import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INSTAGRAM_GRAPH_API = "https://graph.instagram.com";
const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0";

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramInsight {
  name: string;
  values: { value: number }[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ACCESS_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) {
      console.error("INSTAGRAM_ACCESS_TOKEN not configured");
      return new Response(
        JSON.stringify({ error: "Instagram access token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    console.log(`Fetching Instagram data for user: ${user.id}`);

    // Step 1: Get Instagram account info
    console.log("Fetching Instagram account info...");
    const meResponse = await fetch(
      `${INSTAGRAM_GRAPH_API}/me?fields=id,username,account_type,media_count&access_token=${ACCESS_TOKEN}`
    );
    
    if (!meResponse.ok) {
      const errorData = await meResponse.text();
      console.error("Instagram API error (me):", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Instagram account", details: errorData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const instagramAccount = await meResponse.json();
    console.log("Instagram account:", JSON.stringify(instagramAccount));

    // Step 2: Upsert social account in database
    const { data: socialAccount, error: accountError } = await supabase
      .from("social_accounts")
      .upsert({
        user_id: user.id,
        platform: "instagram",
        account_name: instagramAccount.username || "Instagram Account",
        account_handle: `@${instagramAccount.username}`,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,platform",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (accountError) {
      console.error("Error upserting social account:", accountError);
    } else {
      console.log("Social account upserted:", socialAccount?.id);
    }

    // Step 3: Fetch recent media
    console.log("Fetching Instagram media...");
    const mediaResponse = await fetch(
      `${INSTAGRAM_GRAPH_API}/me/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${ACCESS_TOKEN}`
    );
    
    let mediaData: InstagramMedia[] = [];
    if (mediaResponse.ok) {
      const mediaJson = await mediaResponse.json();
      mediaData = mediaJson.data || [];
      console.log(`Fetched ${mediaData.length} media items`);
    } else {
      console.error("Failed to fetch media:", await mediaResponse.text());
    }

    // Step 4: Save posts to database
    const postsToUpsert = mediaData.map((media) => ({
      user_id: user.id,
      platform: "instagram" as const,
      external_post_id: media.id,
      content: media.caption || "",
      media_url: media.media_url || null,
      post_type: media.media_type.toLowerCase(),
      published_at: media.timestamp,
      likes_count: media.like_count || 0,
      comments_count: media.comments_count || 0,
      social_account_id: socialAccount?.id || null,
      updated_at: new Date().toISOString(),
    }));

    if (postsToUpsert.length > 0) {
      const { error: postsError } = await supabase
        .from("posts")
        .upsert(postsToUpsert, {
          onConflict: "user_id,external_post_id",
          ignoreDuplicates: false,
        });

      if (postsError) {
        console.error("Error upserting posts:", postsError);
      } else {
        console.log(`Upserted ${postsToUpsert.length} posts`);
      }
    }

    // Step 5: Fetch comments for each post
    let totalComments = 0;
    for (const media of mediaData.slice(0, 10)) { // Limit to 10 posts for comments
      try {
        const commentsResponse = await fetch(
          `${INSTAGRAM_GRAPH_API}/${media.id}/comments?fields=id,text,timestamp,username&limit=50&access_token=${ACCESS_TOKEN}`
        );
        
        if (commentsResponse.ok) {
          const commentsJson = await commentsResponse.json();
          const comments = commentsJson.data || [];
          
          if (comments.length > 0) {
            // Get the post ID from our database
            const { data: postData } = await supabase
              .from("posts")
              .select("id")
              .eq("user_id", user.id)
              .eq("external_post_id", media.id)
              .single();

            if (postData) {
              const commentsToInsert = comments.map((c: { id: string; text: string; timestamp: string; username: string }) => ({
                user_id: user.id,
                post_id: postData.id,
                content: c.text,
                author_name: c.username,
                created_at: c.timestamp,
              }));

              const { error: commentsError } = await supabase
                .from("post_comments")
                .upsert(commentsToInsert, {
                  onConflict: "user_id,post_id,content",
                  ignoreDuplicates: true,
                });

              if (!commentsError) {
                totalComments += comments.length;
              }
            }
          }
        }
      } catch (e) {
        console.error(`Error fetching comments for ${media.id}:`, e);
      }
    }
    console.log(`Saved ${totalComments} comments`);

    // Step 6: Try to fetch insights (requires business/creator account)
    let insights = null;
    try {
      const insightsResponse = await fetch(
        `${INSTAGRAM_GRAPH_API}/me/insights?metric=impressions,reach,profile_views&period=day&access_token=${ACCESS_TOKEN}`
      );
      
      if (insightsResponse.ok) {
        const insightsJson = await insightsResponse.json();
        insights = insightsJson.data;
        console.log("Fetched insights:", insights?.length || 0);
      }
    } catch (e) {
      console.log("Insights not available (may require business account)");
    }

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        account: {
          username: instagramAccount.username,
          mediaCount: instagramAccount.media_count,
        },
        imported: {
          posts: postsToUpsert.length,
          comments: totalComments,
          hasInsights: !!insights,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Instagram fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
