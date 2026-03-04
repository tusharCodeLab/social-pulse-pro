import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Unauthorized");
    const userId = claimsData.claims.sub as string;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch user's historical performance data
    const [postsResult, bestTimesResult, trendsResult] = await Promise.all([
      supabase.from("posts")
        .select("content, post_type, platform, likes_count, comments_count, engagement_rate, published_at")
        .eq("user_id", userId)
        .order("published_at", { ascending: false })
        .limit(30),
      supabase.from("best_posting_times")
        .select("*")
        .eq("user_id", userId)
        .order("engagement_score", { ascending: false })
        .limit(10),
      supabase.from("personal_trends")
        .select("title, trend_type, direction, confidence_score")
        .eq("user_id", userId)
        .order("confidence_score", { ascending: false })
        .limit(5),
    ]);

    const posts = postsResult.data || [];
    const bestTimes = bestTimesResult.data || [];
    const trends = trendsResult.data || [];

    // Analyze top performing content
    const topPosts = [...posts]
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 10);

    const contentTypeDist: Record<string, { count: number; avgEng: number }> = {};
    posts.forEach(p => {
      const type = p.post_type || "post";
      if (!contentTypeDist[type]) contentTypeDist[type] = { count: 0, avgEng: 0 };
      contentTypeDist[type].count++;
      contentTypeDist[type].avgEng += Number(p.engagement_rate || 0);
    });
    Object.values(contentTypeDist).forEach(v => {
      if (v.count > 0) v.avgEng = v.avgEng / v.count;
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bestTimesSummary = bestTimes.slice(0, 5).map(bt =>
      `${dayNames[bt.day_of_week]} at ${bt.hour_of_day}:00 (score: ${bt.engagement_score})`
    ).join(", ");

    // Get the upcoming week dates
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d.toISOString().split("T")[0];
    });

    const prompt = `You are a world-class social media content strategist. Based on the user's performance data, generate a complete 7-day content calendar for the upcoming week (${weekDates[0]} to ${weekDates[6]}).

PERFORMANCE DATA:
- Total posts analyzed: ${posts.length}
- Content type performance: ${JSON.stringify(contentTypeDist)}
- Best posting times: ${bestTimesSummary || "Not enough data yet"}
- Current trends: ${trends.map(t => `${t.title} (${t.direction})`).join(", ") || "None detected"}
- Top performing content themes: ${topPosts.slice(0, 5).map(p => `"${(p.content || "").slice(0, 80)}"`).join(" | ") || "No content yet"}

Generate exactly 7 calendar items (one per day) with variety in content types. Each should have a specific time, platform-ready caption, and strategic reasoning.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a social media content strategist." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_calendar",
            description: "Return a 7-day content calendar",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", description: "YYYY-MM-DD format" },
                      time: { type: "string", description: "HH:MM format (24h)" },
                      platform: { type: "string", enum: ["instagram", "twitter", "facebook", "linkedin"] },
                      content_type: { type: "string", enum: ["reel", "carousel", "story", "post", "video"] },
                      title: { type: "string", description: "Short title, max 60 chars" },
                      caption: { type: "string", description: "Full ready-to-post caption with emojis, max 500 chars" },
                      hashtags: { type: "array", items: { type: "string" }, description: "5-10 relevant hashtags" },
                      score: { type: "integer", description: "Predicted engagement score 1-100" },
                      reasoning: { type: "string", description: "Why this content at this time, max 150 chars" },
                    },
                    required: ["date", "time", "platform", "content_type", "title", "caption", "hashtags", "score", "reasoning"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["items"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_calendar" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call response from AI");

    const calendarData = JSON.parse(toolCall.function.arguments);

    await supabase
      .from("content_calendar")
      .delete()
      .eq("user_id", userId)
      .eq("is_ai_generated", true)
      .gte("scheduled_date", weekDates[0])
      .lte("scheduled_date", weekDates[6]);

    const itemsToInsert = calendarData.items.map((item: any) => ({
      user_id: userId,
      scheduled_date: item.date,
      scheduled_time: item.time + ":00",
      platform: item.platform || "instagram",
      content_type: item.content_type || "post",
      title: String(item.title).slice(0, 100),
      caption: String(item.caption).slice(0, 1000),
      hashtags: item.hashtags || [],
      status: "draft",
      ai_score: item.score || 50,
      ai_reasoning: String(item.reasoning || "").slice(0, 300),
      is_ai_generated: true,
    }));

    const { error: insertError } = await supabase.from("content_calendar").insert(itemsToInsert);
    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save calendar items");
    }

    return new Response(JSON.stringify({
      success: true,
      count: calendarData.items.length,
      items: calendarData.items,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-content-calendar error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
