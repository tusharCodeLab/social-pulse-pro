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

    // Fetch all relevant data
    const [postsRes, metricsRes, commentsRes, trendsRes] = await Promise.all([
      supabase.from("posts").select("*").eq("user_id", userId).order("published_at", { ascending: false }).limit(30),
      supabase.from("audience_metrics").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(14),
      supabase.from("post_comments").select("id, sentiment, is_spam").eq("user_id", userId).limit(200),
      supabase.from("personal_trends").select("title, direction, trend_type, confidence_score").eq("user_id", userId).order("confidence_score", { ascending: false }).limit(5),
    ]);

    const posts = postsRes.data || [];
    const metrics = metricsRes.data || [];
    const comments = commentsRes.data || [];
    const trends = trendsRes.data || [];

    if (posts.length === 0 && metrics.length === 0) {
      return new Response(
        JSON.stringify({ digest: null, message: "Not enough data to generate a digest. Import your Instagram data first." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalLikes = posts.reduce((s, p) => s + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);
    const totalReach = posts.reduce((s, p) => s + (p.reach || 0), 0);
    const avgEng = posts.length > 0 ? posts.reduce((s, p) => s + Number(p.engagement_rate || 0), 0) / posts.length : 0;
    const positiveSentiment = comments.filter(c => c.sentiment === "positive").length;
    const negativeSentiment = comments.filter(c => c.sentiment === "negative").length;
    const spamCount = comments.filter(c => c.is_spam).length;

    const latestFollowers = metrics[0]?.followers_count || 0;
    const oldestFollowers = metrics[metrics.length - 1]?.followers_count || 0;
    const followerChange = latestFollowers - oldestFollowers;

    const dataSummary = `
Account Performance Data (last 2 weeks):
- Posts published: ${posts.length}
- Total likes: ${totalLikes} | Total comments: ${totalComments} | Total reach: ${totalReach}
- Avg engagement rate: ${avgEng.toFixed(2)}%
- Follower count: ${latestFollowers} (change: ${followerChange >= 0 ? '+' : ''}${followerChange})
- Sentiment breakdown: ${positiveSentiment} positive, ${negativeSentiment} negative, ${comments.length - positiveSentiment - negativeSentiment} neutral
- Spam comments detected: ${spamCount}
- Active trends: ${trends.map(t => `${t.title} (${t.direction}, ${t.trend_type})`).join("; ") || "None"}
- Top post: ${posts[0] ? `"${(posts[0].content || "").slice(0, 80)}" - ${posts[0].likes_count} likes, ${posts[0].reach} reach` : "N/A"}
`;

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
          { role: "system", content: "You are a premium social media performance analyst. Write concise, data-driven executive summaries." },
          { role: "user", content: `Generate a professional weekly performance digest based on this data. Be specific with numbers.\n\n${dataSummary}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_digest",
            description: "Return a structured performance digest",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string", description: "One-line performance headline, max 60 chars" },
                summary: { type: "string", description: "2-3 sentence executive summary with specific metrics" },
                highlights: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      emoji: { type: "string", description: "Single relevant emoji" },
                      text: { type: "string", description: "One-line highlight with specific number" },
                    },
                    required: ["emoji", "text"],
                    additionalProperties: false,
                  },
                  description: "3-5 key highlights",
                },
                healthScore: { type: "number", description: "Account health score 1-100" },
                healthLabel: { type: "string", enum: ["Critical", "Needs Work", "Healthy", "Strong", "Exceptional"] },
                weeklyGoal: { type: "string", description: "One specific, actionable goal for next week" },
                riskAlert: { type: "string", description: "Any risk or concern, or null if none" },
              },
              required: ["headline", "summary", "highlights", "healthScore", "healthLabel", "weeklyGoal"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_digest" } },
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

    const digest = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ digest }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-performance-digest error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
