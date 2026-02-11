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

    const { comments } = await req.json();
    
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return new Response(
        JSON.stringify({ error: "Comments array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing sentiment for ${comments.length} comments`);

    // Prepare comments for analysis
    const commentsText = comments.map((c, i) => `${i + 1}. "${c.content}"`).join("\n");

    const prompt = `Analyze the sentiment of the following social media comments. For each comment, determine if it's positive, negative, or neutral, and provide a confidence score from 0 to 1.

Comments:
${commentsText}

Respond in JSON format only with this exact structure:
{
  "results": [
    {"index": 1, "sentiment": "positive|negative|neutral", "score": 0.85},
    ...
  ]
}`;

    // Call Google Gemini API
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 },
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
    let analysisResults;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResults = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    } catch (parseError) {
      console.error("Parse error:", parseError, "Response:", responseContent);
      throw new Error("Failed to parse AI response");
    }

    // Update comments in database
    const updates = [];
    for (const result of analysisResults.results) {
      const comment = comments[result.index - 1];
      if (comment) {
        updates.push(
          supabase
            .from("post_comments")
            .update({
              sentiment: result.sentiment,
              sentiment_score: result.score,
              analyzed_at: new Date().toISOString(),
            })
            .eq("id", comment.id)
        );
      }
    }

    await Promise.all(updates);

    console.log(`Successfully analyzed ${analysisResults.results.length} comments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        analyzed: analysisResults.results.length,
        results: analysisResults.results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Sentiment analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
