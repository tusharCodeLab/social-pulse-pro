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

    // Fetch unscanned comments
    const { data: comments, error: fetchError } = await supabase
      .from("post_comments")
      .select("id, content, author_name")
      .eq("user_id", userId)
      .is("spam_reason", null)
      .limit(50);

    if (fetchError) throw fetchError;
    if (!comments || comments.length === 0) {
      return new Response(JSON.stringify({ success: true, scanned: 0, spamFound: 0 }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const commentsText = comments.map((c, i) => `${i + 1}. [${c.author_name || "Anonymous"}]: "${c.content.slice(0, 500)}"`).join("\n");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a spam detection system for Instagram comments. Identify spam, bot-generated, promotional, phishing, or irrelevant comments. Be strict but fair — genuine engagement should not be flagged." },
          { role: "user", content: `Analyze these Instagram comments for spam:\n\n${commentsText}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_spam",
            description: "Classify comments as spam or not spam",
            parameters: {
              type: "object",
              properties: {
                results: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number", description: "1-based comment index" },
                      is_spam: { type: "boolean" },
                      reason: { type: "string", description: "Brief reason if spam, e.g. 'promotional link', 'bot pattern', 'phishing'. Use 'legitimate' if not spam." },
                    },
                    required: ["index", "is_spam", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["results"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_spam" } },
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

    const spamResults = JSON.parse(toolCall.function.arguments);
    let spamCount = 0;

    const updates = [];
    for (const result of spamResults.results) {
      const comment = comments[result.index - 1];
      if (!comment) continue;
      if (result.is_spam) spamCount++;
      updates.push(
        supabase.from("post_comments").update({
          is_spam: result.is_spam,
          spam_reason: String(result.reason).slice(0, 200),
        }).eq("id", comment.id)
      );
    }
    await Promise.all(updates);

    console.log(`Spam scan: ${comments.length} scanned, ${spamCount} spam found`);

    return new Response(JSON.stringify({
      success: true,
      scanned: comments.length,
      spamFound: spamCount,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Spam detection error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
