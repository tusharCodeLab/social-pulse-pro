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

    const { topic, tone, postType } = await req.json();
    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Topic is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's top-performing posts for style reference
    const { data: topPosts } = await supabase
      .from("posts")
      .select("content, likes_count, comments_count, engagement_rate")
      .eq("user_id", user.id)
      .order("engagement_rate", { ascending: false })
      .limit(5);

    const styleContext = (topPosts && topPosts.length > 0)
      ? `\n\nHere are the user's top-performing captions for style reference:\n${topPosts.map((p, i) => `${i + 1}. "${(p.content || "").slice(0, 120)}" (${p.likes_count} likes, ${(p.engagement_rate || 0).toFixed(1)}% eng)`).join("\n")}`
      : "";

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
          { role: "system", content: "You are an elite Instagram copywriter. Create engaging, authentic captions that drive engagement. Match the user's brand voice when reference posts are available." },
          { role: "user", content: `Generate 3 Instagram caption variations for this topic: "${topic.trim()}"\nTone: ${tone || "professional"}\nPost type: ${postType || "post"}${styleContext}\n\nEach caption should include a hook, body, CTA, and relevant hashtags.` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_captions",
            description: "Return generated caption variations",
            parameters: {
              type: "object",
              properties: {
                captions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      style: { type: "string", description: "Caption style label e.g. 'Storytelling', 'Bold & Direct', 'Educational'" },
                      caption: { type: "string", description: "Full caption text with emojis and line breaks" },
                      hashtags: { type: "array", items: { type: "string" }, description: "5-10 relevant hashtags without #" },
                      estimatedEngagement: { type: "string", enum: ["Low", "Medium", "High", "Very High"], description: "Predicted engagement level" },
                      hookStrength: { type: "number", description: "Hook quality score 1-10" },
                    },
                    required: ["style", "caption", "hashtags", "estimatedEngagement", "hookStrength"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["captions"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_captions" } },
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
    console.error("ai-caption-generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
