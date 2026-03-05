import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Parse optional platform from request body
    let platform: string | null = null;
    try {
      const body = await req.json();
      if (body?.platform) platform = body.platform;
    } catch {
      // no body is fine
    }

    // Fetch posts, comments, and metrics — filter by platform if provided
    let postsQuery = supabase.from("posts").select("*").eq("user_id", userId).order("published_at", { ascending: false }).limit(50);
    let commentsQuery = supabase.from("post_comments").select("content, sentiment, created_at").eq("user_id", userId).limit(200);
    let metricsQuery = supabase.from("audience_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(30);

    if (platform) {
      postsQuery = postsQuery.eq("platform", platform);
      metricsQuery = metricsQuery.eq("platform", platform);
    }

    const [postsRes, commentsRes, metricsRes] = await Promise.all([
      postsQuery,
      commentsQuery,
      metricsQuery,
    ]);

    const posts = postsRes.data || [];
    const comments = commentsRes.data || [];
    const metrics = metricsRes.data || [];

    const platformLabel = platform || "instagram";

    if (posts.length === 0) {
      return new Response(JSON.stringify({ success: true, trends: [], message: `No ${platformLabel} posts data to analyze` }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build data summary
    const postSummary = posts.slice(0, 20).map(p => ({
      date: p.published_at,
      type: p.post_type,
      likes: p.likes_count,
      comments: p.comments_count,
      engagement: p.engagement_rate,
      caption: (p.content || "").slice(0, 100),
    }));

    const sentimentBreakdown = {
      positive: comments.filter(c => c.sentiment === "positive").length,
      negative: comments.filter(c => c.sentiment === "negative").length,
      neutral: comments.filter(c => c.sentiment === "neutral").length,
    };

    const followerTrend = metrics.slice(0, 14).map(m => ({
      date: m.date,
      followers: m.followers_count,
      newFollowers: m.new_followers,
    }));

    const prompt = `Analyze this ${platformLabel} account's data and detect personal trends:

Posts (recent ${postSummary.length}):
${JSON.stringify(postSummary, null, 1)}

Comment Sentiment: ${JSON.stringify(sentimentBreakdown)}
Follower Trend (14d): ${JSON.stringify(followerTrend)}

Detect 3-5 specific, data-backed trends about this account's performance, content patterns, audience behavior, or engagement shifts.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: `You are a ${platformLabel} analytics trend detector. Identify personal performance trends from real data. Be specific and data-driven.` },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_trends",
            description: "Return detected personal trends",
            parameters: {
              type: "object",
              properties: {
                trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      trend_type: { type: "string", enum: ["content", "engagement", "audience", "hashtag"] },
                      title: { type: "string", description: "Short trend title, max 60 chars" },
                      description: { type: "string", description: "Detailed trend analysis, max 300 chars" },
                      direction: { type: "string", enum: ["up", "down", "stable"] },
                      confidence: { type: "number", description: "Confidence score 0-1" },
                    },
                    required: ["trend_type", "title", "description", "direction", "confidence"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["trends"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_trends" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) return new Response(JSON.stringify({ error: "AI rate limit. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI API error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call response from AI");

    const trendsData = JSON.parse(toolCall.function.arguments);

    // Delete old trends for this platform only
    let deleteQuery = supabase.from("personal_trends").delete().eq("user_id", userId);
    if (platform) {
      deleteQuery = deleteQuery.eq("platform", platform);
    }
    await deleteQuery;

    const trendsToInsert = trendsData.trends.map((t: any) => ({
      user_id: userId,
      trend_type: t.trend_type,
      title: String(t.title).slice(0, 100),
      description: String(t.description).slice(0, 500),
      direction: t.direction,
      confidence_score: t.confidence,
      platform: platformLabel,
    }));

    const { error: insertError } = await supabase.from("personal_trends").insert(trendsToInsert);
    if (insertError) throw insertError;

    console.log(`Detected ${trendsData.trends.length} ${platformLabel} trends for user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      trends: trendsData.trends,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Trend detection error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
