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
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Fetch trends and recent posts for context
    const [trendsRes, postsRes] = await Promise.all([
      supabase.from("personal_trends").select("title, description, direction, trend_type, confidence_score").eq("user_id", user.id).order("confidence_score", { ascending: false }).limit(10),
      supabase.from("posts").select("content, likes_count, comments_count, engagement_rate, post_type").eq("user_id", user.id).order("published_at", { ascending: false }).limit(10),
    ]);

    const trends = trendsRes.data || [];
    const posts = postsRes.data || [];

    if (trends.length === 0 && posts.length === 0) {
      return new Response(
        JSON.stringify({ ideas: null, message: "No data available. Detect trends and import posts first." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const context = `
DETECTED TRENDS:
${trends.map(t => `- ${t.title} (${t.direction}, ${t.trend_type}, confidence: ${((t.confidence_score || 0) * 100).toFixed(0)}%): ${t.description}`).join("\n") || "None detected yet"}

RECENT TOP POSTS:
${posts.slice(0, 5).map((p, i) => `${i + 1}. Type: ${p.post_type || "post"} | Eng: ${(p.engagement_rate || 0).toFixed(1)}% | "${(p.content || "").slice(0, 100)}"`).join("\n") || "No posts yet"}
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
          { role: "system", content: "You are an elite social media content strategist. Generate data-driven content ideas based on the user's actual performance trends and posting history." },
          { role: "user", content: `Based on these trends and performance data, generate 5 strategic content ideas that capitalize on what's working and address weaknesses.\n\n${context}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_content_ideas",
            description: "Return strategic content ideas",
            parameters: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Content idea title, max 60 chars" },
                      description: { type: "string", description: "Detailed description of the content idea, 2-3 sentences" },
                      format: { type: "string", enum: ["Reel", "Carousel", "Single Post", "Story Series", "Live"], description: "Recommended content format" },
                      priority: { type: "string", enum: ["High", "Medium", "Low"] },
                      basedOn: { type: "string", description: "Which trend or data point this idea leverages" },
                      estimatedImpact: { type: "string", description: "Expected outcome in one sentence" },
                      bestDay: { type: "string", description: "Suggested day of week to post" },
                    },
                    required: ["title", "description", "format", "priority", "basedOn", "estimatedImpact", "bestDay"],
                    additionalProperties: false,
                  },
                },
                strategy: { type: "string", description: "Overall content strategy recommendation in 2-3 sentences" },
              },
              required: ["ideas", "strategy"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_content_ideas" } },
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

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("ai-content-ideas error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
