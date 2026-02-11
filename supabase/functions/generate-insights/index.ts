import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
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

    // Get top performing posts
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

Generate insights in JSON format:
{
  "insights": [
    {
      "type": "performance|engagement|timing|content|audience",
      "title": "Short title (max 50 chars)",
      "description": "Detailed actionable advice (max 200 chars)",
      "priority": "high|medium|low",
      "platform": "instagram|twitter|facebook|linkedin|null"
    }
  ]
}

Focus on:
1. Best times to post based on engagement patterns
2. Content types that perform best
3. Audience engagement strategies
4. Platform-specific recommendations
5. Areas needing improvement`;

    // Call Google Gemini API
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let insightsData;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insightsData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Response:", responseContent);
      throw new Error("Failed to parse AI response");
    }

    // Store insights in database
    const insightsToInsert = insightsData.insights.map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      priority: insight.priority,
      platform: insight.platform === "null" ? null : insight.platform,
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
