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

    // Fetch recent posts
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("content, likes_count, comments_count, shares_count, reach, impressions, engagement_rate, post_type, published_at")
      .eq("user_id", userId)
      .order("published_at", { ascending: false })
      .limit(10);

    if (postsError) throw postsError;
    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ coaching: null, message: "No posts to analyze yet." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build analysis prompt
    const postSummaries = posts.map((p, i) => {
      return `Post ${i + 1}: "${(p.content || "").slice(0, 150)}" | Likes: ${p.likes_count || 0} | Comments: ${p.comments_count || 0} | Reach: ${p.reach || 0} | Eng Rate: ${(p.engagement_rate || 0).toFixed(2)}% | Type: ${p.post_type || "unknown"}`;
    }).join("\n");

    const prompt = `You are a world-class Instagram growth coach. Analyze these recent posts and provide actionable coaching.

POSTS:
${postSummaries}

Respond with a JSON object using this exact structure (no markdown, just raw JSON):
{
  "overallScore": <number 1-100>,
  "scoreLabel": "<one word: Poor/Fair/Good/Great/Excellent>",
  "captionTips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "hashtagSuggestions": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "contentIdeas": ["<idea 1>", "<idea 2>", "<idea 3>"],
  "performancePrediction": "<1 sentence prediction for next week>",
  "topStrength": "<what they're doing well in 1 sentence>",
  "biggestOpportunity": "<biggest area to improve in 1 sentence>"
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert Instagram growth strategist. Always respond with valid JSON only, no markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again in a minute." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown fences if present)
    const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let coaching;
    try {
      coaching = JSON.parse(jsonStr);
    } catch {
      coaching = {
        overallScore: 50,
        scoreLabel: "Fair",
        captionTips: ["Write more engaging captions with questions", "Use storytelling to connect with audience", "Add clear calls-to-action"],
        hashtagSuggestions: ["#instagram", "#growth", "#engagement", "#content", "#social"],
        contentIdeas: ["Behind-the-scenes content", "User polls and questions", "Tutorial or how-to posts"],
        performancePrediction: "Engagement could improve with more consistent posting.",
        topStrength: "Consistent posting frequency.",
        biggestOpportunity: "Improve caption quality and engagement hooks.",
      };
    }

    return new Response(JSON.stringify({ coaching }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-post-coach error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
