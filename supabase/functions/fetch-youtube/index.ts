import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const YT_API = "https://www.googleapis.com/youtube/v3";

type ChannelLookup = {
  handle?: string;
  channelId?: string;
  username?: string;
  original: string;
};

const parseChannelInput = (rawInput: string): ChannelLookup => {
  const raw = rawInput.trim();
  const out: ChannelLookup = { original: raw };

  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
      const path = url.pathname.replace(/\/$/, "");
      if (path.startsWith("/@")) out.handle = path.slice(2);
      else if (path.startsWith("/channel/")) out.channelId = path.split("/")[2];
      else if (path.startsWith("/user/")) out.username = path.split("/")[2];
      else if (path.startsWith("/c/")) out.username = path.split("/")[2];
      const queryChannelId = url.searchParams.get("channel_id");
      if (!out.channelId && queryChannelId) out.channelId = queryChannelId;
    }
  } catch { /* Not a URL */ }

  if (!out.handle && raw.startsWith("@")) out.handle = raw.slice(1);
  if (!out.channelId && /^UC[a-zA-Z0-9_-]{20,}$/.test(raw)) out.channelId = raw;
  if (!out.username && !out.handle && !out.channelId) out.username = raw;

  return out;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get("YOUTUBE_API_KEY");
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "YouTube API key not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const body = await req.json().catch(() => ({}));
    const channelHandle = body.channel_handle as string | undefined;

    if (!channelHandle) {
      return new Response(JSON.stringify({ error: "channel_handle is required (e.g. @MrBeast)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[YouTube] Fetching data for handle: ${channelHandle}, user: ${userId}`);

    // Step 1: Resolve channel from handle / channel ID / username / URL
    const lookup = parseChannelInput(channelHandle);
    let channelItems: any[] = [];

    if (lookup.handle) {
      const channelRes = await fetch(`${YT_API}/channels?part=snippet,statistics,contentDetails&forHandle=${encodeURIComponent(lookup.handle)}&key=${API_KEY}`);
      const channelJson = await channelRes.json();
      channelItems = channelJson.items || [];
    }

    if (channelItems.length === 0 && lookup.channelId) {
      const byIdRes = await fetch(`${YT_API}/channels?part=snippet,statistics,contentDetails&id=${encodeURIComponent(lookup.channelId)}&key=${API_KEY}`);
      channelItems = (await byIdRes.json()).items || [];
    }

    if (channelItems.length === 0 && lookup.username) {
      const byUsernameRes = await fetch(`${YT_API}/channels?part=snippet,statistics,contentDetails&forUsername=${encodeURIComponent(lookup.username)}&key=${API_KEY}`);
      channelItems = (await byUsernameRes.json()).items || [];
    }

    // Final fallback: channel search by query
    if (channelItems.length === 0) {
      const searchChannelRes = await fetch(`${YT_API}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(lookup.original)}&key=${API_KEY}`);
      const searchChannelJson = await searchChannelRes.json();
      const searchedChannelId = searchChannelJson.items?.[0]?.snippet?.channelId;

      if (searchedChannelId) {
        const bySearchIdRes = await fetch(`${YT_API}/channels?part=snippet,statistics,contentDetails&id=${encodeURIComponent(searchedChannelId)}&key=${API_KEY}`);
        channelItems = (await bySearchIdRes.json()).items || [];
      }
    }

    if (channelItems.length === 0) {
      return new Response(JSON.stringify({ error: "YouTube channel not found." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const channel = channelItems[0];
    const channelId = channel.id;
    const snippet = channel.snippet;
    const stats = channel.statistics;

    console.log(`[YouTube] Found channel: ${snippet.title} (${channelId})`);

    // Step 2: Upsert social account
    const { data: socialAccount, error: accError } = await supabase
      .from("social_accounts")
      .upsert(
        {
          user_id: userId,
          platform: "youtube",
          account_name: snippet.title,
          account_handle: snippet.customUrl
            ? snippet.customUrl.startsWith("@")
              ? snippet.customUrl
              : `@${snippet.customUrl}`
            : lookup.handle
              ? `@${lookup.handle}`
              : lookup.channelId || null,
          profile_image_url: snippet.thumbnails?.default?.url || null,
          followers_count: parseInt(stats.subscriberCount || "0"),
          is_connected: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,platform", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (accError) console.error("[YouTube] Account upsert error:", accError);

    // Step 3: Save audience metrics snapshot
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("audience_metrics").upsert(
      {
        user_id: userId,
        platform: "youtube",
        social_account_id: socialAccount?.id || null,
        date: today,
        followers_count: parseInt(stats.subscriberCount || "0"),
        engagement_rate: 0,
        new_followers: 0,
        lost_followers: 0,
      },
      { onConflict: "user_id,platform,date", ignoreDuplicates: false }
    );

    // Step 4: Fetch recent videos via search
    const searchRes = await fetch(
      `${YT_API}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=25&key=${API_KEY}`
    );
    const searchJson = await searchRes.json();
    const videoIds = (searchJson.items || []).map((i: any) => i.id.videoId).filter(Boolean);

    let videosData: any[] = [];
    if (videoIds.length > 0) {
      const videosRes = await fetch(
        `${YT_API}/videos?part=snippet,statistics,contentDetails&id=${videoIds.join(",")}&key=${API_KEY}`
      );
      videosData = (await videosRes.json()).items || [];
    }

    console.log(`[YouTube] Fetched ${videosData.length} videos`);

    // Step 5: Upsert posts
    const postsToUpsert = videosData.map((v: any) => ({
      user_id: userId,
      platform: "youtube" as const,
      external_post_id: v.id,
      content: v.snippet.title || "",
      media_url: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url || null,
      post_type: v.snippet.liveBroadcastContent === "live" ? "live" : "video",
      published_at: v.snippet.publishedAt,
      likes_count: parseInt(v.statistics.likeCount || "0"),
      comments_count: parseInt(v.statistics.commentCount || "0"),
      reach: parseInt(v.statistics.viewCount || "0"),
      impressions: parseInt(v.statistics.viewCount || "0"),
      engagement_rate:
        parseInt(v.statistics.viewCount || "0") > 0
          ? ((parseInt(v.statistics.likeCount || "0") + parseInt(v.statistics.commentCount || "0")) /
              parseInt(v.statistics.viewCount || "1")) *
            100
          : 0,
      social_account_id: socialAccount?.id || null,
      updated_at: new Date().toISOString(),
    }));

    if (postsToUpsert.length > 0) {
      const { error: postsErr } = await supabase
        .from("posts")
        .upsert(postsToUpsert, { onConflict: "user_id,external_post_id", ignoreDuplicates: false });
      if (postsErr) console.error("[YouTube] Posts upsert error:", postsErr);
      else console.log(`[YouTube] Upserted ${postsToUpsert.length} posts`);
    }

    // Step 6: Fetch comments for top 5 videos
    let totalComments = 0;
    for (const video of videosData.slice(0, 5)) {
      try {
        const commentsRes = await fetch(
          `${YT_API}/commentThreads?part=snippet&videoId=${video.id}&maxResults=50&order=relevance&key=${API_KEY}`
        );
        if (!commentsRes.ok) {
          console.log(`[YouTube] Comments disabled for ${video.id}`);
          continue;
        }
        const commentsJson = await commentsRes.json();
        const comments = commentsJson.items || [];

        if (comments.length > 0) {
          const { data: postData } = await supabase
            .from("posts")
            .select("id")
            .eq("user_id", userId)
            .eq("external_post_id", video.id)
            .maybeSingle();

          if (postData) {
            for (const c of comments) {
              const cs = c.snippet.topLevelComment.snippet;
              const { error: cErr } = await supabase.from("post_comments").upsert(
                {
                  user_id: userId,
                  post_id: postData.id,
                  content: cs.textDisplay || cs.textOriginal || "",
                  author_name: cs.authorDisplayName || "Anonymous",
                  created_at: cs.publishedAt,
                  external_comment_id: c.snippet.topLevelComment.id,
                },
                { onConflict: "user_id,external_comment_id", ignoreDuplicates: true }
              );
              if (!cErr) totalComments++;
            }
          }
        }
      } catch (e) {
        console.error(`[YouTube] Comment fetch error for ${video.id}:`, e);
      }
    }

    console.log(`[YouTube] Saved ${totalComments} comments`);

    return new Response(
      JSON.stringify({
        success: true,
        channel: {
          title: snippet.title,
          handle: snippet.customUrl
            ? snippet.customUrl.startsWith("@")
              ? snippet.customUrl
              : `@${snippet.customUrl}`
            : lookup.handle
              ? `@${lookup.handle}`
              : lookup.channelId || lookup.original,
          subscriberCount: parseInt(stats.subscriberCount || "0"),
          viewCount: parseInt(stats.viewCount || "0"),
          videoCount: parseInt(stats.videoCount || "0"),
        },
        imported: {
          videos: postsToUpsert.length,
          comments: totalComments,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[YouTube] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
