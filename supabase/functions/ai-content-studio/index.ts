import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function handleGenerateVersions(topic: string, platform: string, apiKey: string) {
  const prompt = `You are a social media content strategist specializing in ${platform}. Given the trending topic below, generate exactly 2 post versions (A and B) for ${platform}.

Trending Topic: "${topic}"

For each version provide:
- title: A compelling post title (max 60 chars)
- caption: An engaging caption (150-300 chars) with emojis
- hashtags: Array of 5-8 relevant hashtags (without #)
- script: A detailed script/body text (2-3 paragraphs) that could be used as a carousel script, reel script, or long-form caption

Version A should be more professional/educational.
Version B should be more casual/entertaining.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a social media content expert. Always respond using the provided tool." },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_post_versions",
            description: "Return 2 post versions (A and B) for a trending topic.",
            parameters: {
              type: "object",
              properties: {
                versions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "string", enum: ["A", "B"] },
                      title: { type: "string" },
                      caption: { type: "string" },
                      hashtags: { type: "array", items: { type: "string" } },
                      script: { type: "string" },
                    },
                    required: ["id", "title", "caption", "hashtags", "script"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["versions"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_post_versions" } },
    }),
  });

  return response;
}

async function handlePublishingStrategy(post: { title: string; caption: string; hashtags: string[] }, platform: string, apiKey: string) {
  const prompt = `You are a social media publishing strategist for ${platform}. Based on the post content below, generate a comprehensive publishing strategy.

Post Title: "${post.title}"
Post Caption: "${post.caption}"
Post Hashtags: ${post.hashtags.map(h => '#' + h).join(', ')}

Analyze this content and provide:
1. best_times: Top 3 recommended posting times with specific day of week, time (HH:MM format), and strategic reasoning for each
2. engagement_forecast: Predicted engagement metrics including estimated likes range (min/max), estimated comments range (min/max), estimated reach range (min/max), and a brief explanation
3. audience_insights: 3-4 insights about when the target audience for this content type is most active, their behavior patterns, and demographics likely to engage
4. pro_tips: 4-5 actionable tips specific to this content for maximizing reach and engagement on ${platform}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a social media publishing strategist. Always respond using the provided tool." },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_publishing_strategy",
            description: "Return a publishing strategy for a social media post.",
            parameters: {
              type: "object",
              properties: {
                best_times: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      rank: { type: "number" },
                      day: { type: "string" },
                      time: { type: "string" },
                      reasoning: { type: "string" },
                    },
                    required: ["rank", "day", "time", "reasoning"],
                    additionalProperties: false,
                  },
                },
                engagement_forecast: {
                  type: "object",
                  properties: {
                    likes_min: { type: "number" },
                    likes_max: { type: "number" },
                    comments_min: { type: "number" },
                    comments_max: { type: "number" },
                    reach_min: { type: "number" },
                    reach_max: { type: "number" },
                    explanation: { type: "string" },
                  },
                  required: ["likes_min", "likes_max", "comments_min", "comments_max", "reach_min", "reach_max", "explanation"],
                  additionalProperties: false,
                },
                audience_insights: {
                  type: "array",
                  items: { type: "string" },
                },
                pro_tips: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["best_times", "engagement_forecast", "audience_insights", "pro_tips"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "generate_publishing_strategy" } },
    }),
  });

  return response;
}

async function handleTopicExplanation(topic: string, apiKey: string) {
  const prompt = `You are a knowledgeable content research assistant. A social media creator wants to create content about the following topic, but they may have little to no knowledge about it. Provide a clear, well-structured explanation that helps them deeply understand the topic so they can create informed, credible content.

Topic: "${topic}"

Provide:
1. introduction: A brief 2-3 sentence overview that sets context — what this topic is and why it matters right now.
2. key_points: An array of 3-5 important points. Each point should have a "heading" (short label) and "detail" (1-2 sentence explanation). Cover the core concepts, recent developments, and why people care.
3. conclusion: A 2-3 sentence wrap-up summarizing the creator's takeaway — what angle they should consider and what makes this topic compelling for content.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You are a content research assistant. Always respond using the provided tool." },
        { role: "user", content: prompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "explain_topic",
            description: "Return a structured explanation of a topic for a content creator.",
            parameters: {
              type: "object",
              properties: {
                introduction: { type: "string" },
                key_points: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      heading: { type: "string" },
                      detail: { type: "string" },
                    },
                    required: ["heading", "detail"],
                    additionalProperties: false,
                  },
                },
                conclusion: { type: "string" },
              },
              required: ["introduction", "key_points", "conclusion"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "explain_topic" } },
    }),
  });

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { action, topic, platform = "instagram", post } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let response: Response;

    if (action === "publishing-strategy") {
      if (!post?.title || !post?.caption) {
        return new Response(JSON.stringify({ error: "post with title and caption is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      response = await handlePublishingStrategy(post, platform, LOVABLE_API_KEY);
    } else if (action === "topic-explanation") {
      if (!topic) {
        return new Response(JSON.stringify({ error: "topic is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      response = await handleTopicExplanation(topic, LOVABLE_API_KEY);
    } else {
      // Default: generate versions
      if (!topic) {
        return new Response(JSON.stringify({ error: "topic is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      response = await handleGenerateVersions(topic, platform, LOVABLE_API_KEY);
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const parsed = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-content-studio error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
