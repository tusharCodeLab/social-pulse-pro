import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Using Facebook Graph API to access Instagram Business/Creator accounts
// This works with tokens that have pages_show_list, instagram_basic permissions
const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0";

// Helper to add delay between API calls to avoid rate limiting
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Check if response is a rate limit error
function isRateLimitError(responseText: string): boolean {
  try {
    const parsed = JSON.parse(responseText);
    return parsed?.error?.code === 4 || parsed?.error?.message?.includes("request limit");
  } catch {
    return false;
  }
}

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

    // Token validated - proceed with fetch

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

    // Step 1: Get Facebook Pages connected to this token
    console.log("Fetching Facebook Pages...");
    const pagesResponse = await fetch(
      `${FACEBOOK_GRAPH_API}/me/accounts?access_token=${ACCESS_TOKEN}`
    );
    
    const pagesRawResponse = await pagesResponse.text();
    console.log("Facebook Pages API raw response:", pagesRawResponse);
    
    if (!pagesResponse.ok) {
      console.error("Facebook Pages API error:", pagesRawResponse);
      const statusCode = isRateLimitError(pagesRawResponse) ? 429 : 400;
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Facebook Pages", 
          details: pagesRawResponse,
          hint: statusCode === 429 
            ? "Facebook API rate limit reached. Please wait a few minutes before syncing again."
            : "Make sure your token has 'pages_show_list' permission and is a valid User Access Token from Graph API Explorer",
          rateLimited: statusCode === 429,
        }),
        { status: statusCode, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    let pagesData;
    try {
      pagesData = JSON.parse(pagesRawResponse);
    } catch (e) {
      console.error("Failed to parse pages response:", e);
      return new Response(
        JSON.stringify({ error: "Invalid response from Facebook API", details: pagesRawResponse }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    console.log(`Found ${pagesData.data?.length || 0} Facebook Pages`);

    if (!pagesData.data || pagesData.data.length === 0) {
      console.log("No Facebook Pages found");
      return new Response(
        JSON.stringify({ 
          error: "No Facebook Pages found", 
          hint: "Make sure your Facebook account has a Page connected to an Instagram Business/Creator account"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get Instagram Business Account for each page
    let instagramAccountId: string | null = null;
    let instagramUsername: string | null = null;
    let instagramFollowersCount: number = 0;
    let instagramMediaCount: number = 0;
    let pageAccessToken: string | null = null;
    const checkedPages: Array<{ id: string; name: string; hasInstagram: boolean }> = [];

    for (const page of pagesData.data) {
      await delay(500); // Delay between page checks to avoid rate limits
      console.log(`Checking page: ${page.name} (${page.id})`);
      
      const igAccountResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/${page.id}?fields=instagram_business_account{id,username,followers_count,follows_count,media_count}&access_token=${page.access_token || ACCESS_TOKEN}`
      );
      
      if (igAccountResponse.ok) {
        const igData = await igAccountResponse.json();
        const hasInstagram = Boolean(igData.instagram_business_account);
        checkedPages.push({ id: page.id, name: page.name, hasInstagram });

        if (hasInstagram) {
          instagramAccountId = igData.instagram_business_account.id;
          instagramUsername = igData.instagram_business_account.username;
          instagramFollowersCount = igData.instagram_business_account.followers_count || 0;
          instagramMediaCount = igData.instagram_business_account.media_count || 0;
          pageAccessToken = page.access_token || ACCESS_TOKEN;
          console.log(`Found Instagram account: @${instagramUsername} (${instagramAccountId}), Followers: ${instagramFollowersCount}, Posts: ${instagramMediaCount}`);
          break;
        }
      } else {
        checkedPages.push({ id: page.id, name: page.name, hasInstagram: false });
      }
    }

    if (!instagramAccountId) {
      return new Response(
        JSON.stringify({ 
          success: false,
          reason: "instagram_not_connected",
          error: "No Instagram Business Account found",
          hint: "Your Facebook Page must be connected to an Instagram Business or Creator account. Go to your Facebook Page settings to connect Instagram.",
          checked_pages: checkedPages,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Upsert social account in database WITH follower count
    const { data: socialAccount, error: accountError } = await supabase
      .from("social_accounts")
      .upsert({
        user_id: user.id,
        platform: "instagram",
        account_name: instagramUsername || "Instagram Account",
        account_handle: `@${instagramUsername}`,
        followers_count: instagramFollowersCount,
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
      console.log("Social account upserted:", socialAccount?.id, "with followers:", instagramFollowersCount);
    }

    // Step 4: Fetch recent media from Instagram Business Account
    console.log("Fetching Instagram media...");
    const mediaResponse = await fetch(
      `${FACEBOOK_GRAPH_API}/${instagramAccountId}/media?fields=id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count&limit=25&access_token=${pageAccessToken}`
    );
    
    let mediaData: InstagramMedia[] = [];
    if (mediaResponse.ok) {
      const mediaJson = await mediaResponse.json();
      mediaData = mediaJson.data || [];
      console.log(`Fetched ${mediaData.length} media items`);
    } else {
      const mediaError = await mediaResponse.text();
      console.error("Failed to fetch media:", mediaError);
    }

    // Step 5: Save posts to database
    const postsToUpsert = mediaData.map((media) => ({
      user_id: user.id,
      platform: "instagram" as const,
      external_post_id: media.id,
      content: media.caption || "",
      media_url: media.media_url || null,
      post_type: media.media_type?.toLowerCase() || "image",
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

    // Step 6: Fetch comments for each post
    let totalComments = 0;
    for (const media of mediaData.slice(0, 5)) { // Reduced from 10 to 5 to avoid rate limits
      await delay(1000); // 1 second delay between comment fetches
      try {
        const commentsResponse = await fetch(
          `${FACEBOOK_GRAPH_API}/${media.id}/comments?fields=id,text,timestamp,username&limit=50&access_token=${pageAccessToken}`
        );
        
        if (commentsResponse.ok) {
          const commentsJson = await commentsResponse.json();
          const comments = commentsJson.data || [];
          console.log(`Fetched ${comments.length} comments for media ${media.id}`);
          
          if (comments.length > 0) {
            const { data: postData } = await supabase
              .from("posts")
              .select("id")
              .eq("user_id", user.id)
              .eq("external_post_id", media.id)
              .maybeSingle();

            if (postData) {
              const commentsToInsert = comments.map((c: { id: string; text: string; timestamp: string; username?: string }) => ({
                user_id: user.id,
                post_id: postData.id,
                content: c.text,
                author_name: c.username || "Anonymous",
                created_at: c.timestamp,
                external_comment_id: c.id, // Use Instagram's comment ID for deduplication
              }));

              // Use insert with proper conflict handling on external_comment_id
              for (const comment of commentsToInsert) {
                const { error: insertError } = await supabase
                  .from("post_comments")
                  .upsert(comment, {
                    onConflict: "user_id,external_comment_id",
                    ignoreDuplicates: true,
                  });
                
                if (!insertError) {
                  totalComments++;
                } else {
                  console.error(`Error inserting comment:`, insertError.message);
                }
              }
            }
          }
        } else {
          const errorText = await commentsResponse.text();
          console.log(`No comments available for media ${media.id}: ${commentsResponse.status}`);
        }
      } catch (e) {
        console.error(`Error fetching comments for ${media.id}:`, e);
      }
    }
    console.log(`Saved ${totalComments} comments total`);

    // Step 7: Try to fetch insights (requires instagram_manage_insights)
    let hasInsights = false;
    try {
      const insightsResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/${instagramAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${pageAccessToken}`
      );
      
      if (insightsResponse.ok) {
        hasInsights = true;
        console.log("Insights available");
      }
    } catch (e) {
      console.log("Insights not available");
    }

    // Return summary
    return new Response(
      JSON.stringify({
        success: true,
        account: {
          username: instagramUsername,
          id: instagramAccountId,
          followers_count: instagramFollowersCount,
          media_count: instagramMediaCount,
        },
        imported: {
          posts: postsToUpsert.length,
          comments: totalComments,
          hasInsights,
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
