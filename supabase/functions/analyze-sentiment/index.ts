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

    const body = await req.json();
    const { comments } = body;
    
    if (!comments || !Array.isArray(comments) || comments.length === 0) {
      return new Response(JSON.stringify({ error: "Comments array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (comments.length > 50) {
      return new Response(JSON.stringify({ error: "Maximum 50 comments per request" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validatedComments = [];
    for (const c of comments) {
      if (!c || typeof c !== "object") continue;
      if (typeof c.id !== "string" || c.id.length > 100) continue;
      if (typeof c.content !== "string" || c.content.length === 0) continue;
      validatedComments.push({ id: c.id, content: c.content.slice(0, 5000) });
    }

    if (validatedComments.length === 0) {
      return new Response(JSON.stringify({ error: "No valid comments provided." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analyzing sentiment for ${validatedComments.length} comments`);

    const commentsText = validatedComments.map((c, i: number) => `${i + 1}. "${c.content}"`).join("\n");
    const prompt = `Analyze the sentiment of each social media comment below. For each, classify as positive, negative, or neutral with a confidence score 0-1.\n\nComments:\n${commentsText}`;

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
          { role: "system", content: "You are a sentiment analysis tool. Classify social media comments accurately." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_sentiments",
            description: "Return sentiment classifications for comments",
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number", description: "1-based comment index" },
                      sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                      score: { type: "number", description: "Confidence score 0-1" },
                    },
                    required: ["index", "sentiment", "score"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["results"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_sentiments" } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call response from AI");

    const analysisResults = JSON.parse(toolCall.function.arguments);

    const updates = [];
    for (const result of analysisResults.results) {
      const comment = validatedComments[result.index - 1];
      if (comment) {
        updates.push(
          supabase.from("post_comments").update({
            sentiment: result.sentiment,
            sentiment_score: result.score,
            analyzed_at: new Date().toISOString(),
          }).eq("id", comment.id)
        );
      }
    }
    await Promise.all(updates);

    console.log(`Successfully analyzed ${analysisResults.results.length} comments`);

    return new Response(JSON.stringify({
      success: true,
      analyzed: analysisResults.results.length,
      results: analysisResults.results,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
