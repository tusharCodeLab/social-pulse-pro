import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub as string;

    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Fetch Instagram posts
    const { data: posts, error: postsError } = await serviceClient
      .from("posts")
      .select("published_at, likes_count, comments_count, shares_count, engagement_rate, reach, impressions")
      .eq("user_id", userId)
      .eq("platform", "instagram")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(500);

    if (postsError) throw postsError;

    if (!posts || posts.length < 3) {
      return new Response(JSON.stringify({
        recommendations: [],
        ai_summary: "You need at least 3 Instagram posts with publish dates to generate best time recommendations. Keep posting and check back soon!",
        sample_size: posts?.length || 0,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Aggregate engagement by day/hour
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const slots: Record<string, { totalEngagement: number; count: number; totalReach: number }> = {};

    for (const post of posts) {
      const date = new Date(post.published_at);
      const day = date.getUTCDay();
      const hour = date.getUTCHours();
      const key = `${day}-${hour}`;
      if (!slots[key]) slots[key] = { totalEngagement: 0, count: 0, totalReach: 0 };
      slots[key].totalEngagement += (post.likes_count || 0) + (post.comments_count || 0) + (post.shares_count || 0);
      slots[key].count += 1;
      slots[key].totalReach += post.reach || 0;
    }

    // Build ranked slots
    const ranked = Object.entries(slots)
      .map(([key, val]) => {
        const [day, hour] = key.split("-").map(Number);
        return {
          day: dayNames[day],
          day_index: day,
          hour,
          avg_engagement: Math.round(val.totalEngagement / val.count),
          avg_reach: Math.round(val.totalReach / val.count),
          sample_size: val.count,
        };
      })
      .sort((a, b) => b.avg_engagement - a.avg_engagement)
      .slice(0, 15);

    // Call Lovable AI for insights
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are an Instagram growth strategist. Analyze this engagement data and provide actionable posting schedule recommendations.

Data from ${posts.length} Instagram posts:
${JSON.stringify(ranked, null, 2)}

Return a JSON object with this exact structure:
{
  "top_slots": [
    {
      "day": "Tuesday",
      "hour": 18,
      "score": 95,
      "reason": "Your audience peaks after work hours with 2x average engagement"
    }
  ],
  "summary": "A 2-3 sentence strategic overview",
  "tips": ["tip1", "tip2", "tip3"]
}

Provide exactly 5 top_slots ranked by importance, and 3 actionable tips. Hours are in UTC.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert social media strategist. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { top_slots: ranked.slice(0, 5).map(s => ({ day: s.day, hour: s.hour, score: Math.min(100, s.avg_engagement), reason: "Based on engagement data" })), summary: content, tips: [] };
    }

    return new Response(JSON.stringify({
      recommendations: parsed.top_slots || [],
      ai_summary: parsed.summary || "",
      tips: parsed.tips || [],
      sample_size: posts.length,
      raw_data: ranked,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("ai-best-times error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
