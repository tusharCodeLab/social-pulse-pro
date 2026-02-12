import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting per user
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX_CALLS = 5;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX_CALLS) {
    return false;
  }
  entry.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit check
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Maximum 5 calls per hour." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating insights for user: ${user.id}`);

    // Fetch user's analytics data
    const [postsResult, metricsResult, commentsResult] = await Promise.all([
      supabase.from("posts").select("*").eq("user_id", user.id).order("published_at", { ascending: false }).limit(50),
      supabase.from("audience_metrics").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(30),
      supabase.from("post_comments").select("*").eq("user_id", user.id).limit(100),
    ]);

    const posts = postsResult.data || [];
    const metrics = metricsResult.data || [];
    const comments = commentsResult.data || [];

    // Prepare data summary for AI
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
    const avgEngagement = posts.length > 0 
      ? posts.reduce((sum, p) => sum + Number(p.engagement_rate || 0), 0) / posts.length 
      : 0;
    
    const positiveComments = comments.filter(c => c.sentiment === "positive").length;
    const negativeComments = comments.filter(c => c.sentiment === "negative").length;
    
    const platformBreakdown = posts.reduce((acc, p) => {
      acc[p.platform] = (acc[p.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPosts = [...posts].sort((a, b) => b.engagement_rate - a.engagement_rate).slice(0, 5);

    const dataSummary = `
Social Media Analytics Summary:
- Total Posts: ${posts.length}
- Total Likes: ${totalLikes}
- Total Comments: ${totalComments}
- Average Engagement Rate: ${avgEngagement.toFixed(2)}%
- Positive Comments: ${positiveComments}
- Negative Comments: ${negativeComments}
- Platform Distribution: ${JSON.stringify(platformBreakdown)}
- Top Performing Posts (by engagement):
${topPosts.map((p, i) => `  ${i + 1}. ${p.platform}: ${p.engagement_rate}% engagement, ${p.likes_count} likes`).join("\n")}
- Recent Follower Trend: ${metrics.length > 0 ? `${metrics[0]?.followers_count || 0} followers` : "No data"}
`;

    const prompt = `You are a social media analytics expert. Based on the following data, generate 3-5 actionable insights for improving social media performance.

${dataSummary}

Focus on:
1. Best times to post based on engagement patterns
2. Content types that perform best
3. Audience engagement strategies
4. Platform-specific recommendations
5. Areas needing improvement`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a social media analytics expert." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_insights",
              description: "Return social media insights",
              parameters: {
                type: "object",
                properties: {
                  insights: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["performance", "engagement", "timing", "content", "audience"] },
                        title: { type: "string", description: "Short title max 50 chars" },
                        description: { type: "string", description: "Actionable advice max 200 chars" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        platform: { type: "string", enum: ["instagram", "twitter", "facebook", "linkedin"], description: "null if general" },
                      },
                      required: ["type", "title", "description", "priority"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_insights" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorStatus = aiResponse.status;
      if (errorStatus === 429) {
        return new Response(
          JSON.stringify({ error: "AI rate limit reached. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (errorStatus === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI API error: ${errorStatus}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call response from AI");
    }

    const insightsData = JSON.parse(toolCall.function.arguments);

    // Store insights in database
    const insightsToInsert = insightsData.insights.map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type,
      title: String(insight.title).slice(0, 100),
      description: String(insight.description).slice(0, 500),
      priority: insight.priority,
      platform: insight.platform || null,
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from("ai_insights")
      .insert(insightsToInsert);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to save insights");
    }

    console.log(`Generated ${insightsData.insights.length} insights`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: insightsData.insights.length,
        insights: insightsData.insights 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Generate insights error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate insights. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
