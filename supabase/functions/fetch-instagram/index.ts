import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Using Facebook Graph API to access Instagram Business/Creator accounts
// This works with tokens that have pages_show_list, instagram_basic permissions
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

    // Log token length for debugging (not the actual token)
    console.log(`Access token length: ${ACCESS_TOKEN.length} characters`);

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
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Facebook Pages", 
          details: pagesRawResponse,
          hint: "Make sure your token has 'pages_show_list' permission and is a valid User Access Token from Graph API Explorer"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      console.log("No Facebook Pages found - returning demo data");
      
      // Return demo data when no real Instagram connection is available
      const demoUsername = "demo_account";
      
      // Upsert demo social account
      const { data: socialAccount } = await supabase
        .from("social_accounts")
        .upsert({
          user_id: user.id,
          platform: "instagram",
          account_name: "Demo Instagram Account",
          account_handle: `@${demoUsername}`,
          is_connected: true,
          followers_count: 12500,
          following_count: 850,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,platform",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      // Create demo posts
      const demoPosts = [
        { content: "Excited to share our latest product update! 🚀", likes: 245, comments: 18, type: "image", daysAgo: 1 },
        { content: "Behind the scenes of our team retreat. Amazing energy! 🌟", likes: 189, comments: 24, type: "carousel", daysAgo: 3 },
        { content: "Thank you for 10K followers! Your support means everything 🙏", likes: 892, comments: 156, type: "image", daysAgo: 5 },
        { content: "New collection dropping next week. Stay tuned! 👀", likes: 567, comments: 43, type: "image", daysAgo: 7 },
        { content: "Monday motivation: Dream big, work hard 💪", likes: 324, comments: 31, type: "reel", daysAgo: 10 },
        { content: "Customer spotlight: Amazing feedback from @happy_customer 🎉", likes: 156, comments: 12, type: "image", daysAgo: 12 },
        { content: "Tips for growing your social presence - link in bio!", likes: 423, comments: 67, type: "carousel", daysAgo: 14 },
        { content: "Weekend vibes only ☀️", likes: 278, comments: 19, type: "reel", daysAgo: 16 },
      ];

      const postsToInsert = demoPosts.map((post, index) => ({
        user_id: user.id,
        platform: "instagram" as const,
        external_post_id: `demo_post_${index + 1}`,
        content: post.content,
        post_type: post.type,
        published_at: new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000).toISOString(),
        likes_count: post.likes,
        comments_count: post.comments,
        social_account_id: socialAccount?.id || null,
        impressions: Math.floor(post.likes * 8.5),
        reach: Math.floor(post.likes * 6.2),
        engagement_rate: ((post.likes + post.comments) / 12500 * 100).toFixed(2),
        updated_at: new Date().toISOString(),
      }));

      const { error: postsError } = await supabase
        .from("posts")
        .upsert(postsToInsert, {
          onConflict: "user_id,external_post_id",
          ignoreDuplicates: false,
        });

      if (postsError) {
        console.error("Error inserting demo posts:", postsError);
      }

      // Create demo comments
      const demoComments = [
        { postIndex: 0, content: "This looks amazing! 🔥", author: "tech_enthusiast" },
        { postIndex: 0, content: "Can't wait to try this!", author: "early_adopter" },
        { postIndex: 2, content: "Congratulations on 10K! 🎉", author: "supporter123" },
        { postIndex: 2, content: "Well deserved!", author: "loyal_follower" },
        { postIndex: 4, content: "So inspiring!", author: "motivated_user" },
        { postIndex: 6, content: "Great tips, thanks for sharing!", author: "learning_daily" },
      ];

      // Get inserted posts to link comments
      const { data: insertedPosts } = await supabase
        .from("posts")
        .select("id, external_post_id")
        .eq("user_id", user.id)
        .like("external_post_id", "demo_post_%");

      if (insertedPosts) {
        const commentsToInsert = demoComments.map(comment => {
          const post = insertedPosts.find(p => p.external_post_id === `demo_post_${comment.postIndex + 1}`);
          return {
            user_id: user.id,
            post_id: post?.id,
            content: comment.content,
            author_name: comment.author,
            sentiment: ["positive", "positive", "positive", "neutral", "positive", "positive"][Math.floor(Math.random() * 6)] as "positive" | "neutral" | "negative",
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }).filter(c => c.post_id);

        await supabase
          .from("post_comments")
          .upsert(commentsToInsert, {
            onConflict: "user_id,post_id,content",
            ignoreDuplicates: true,
          });
      }

      console.log("Demo data created successfully");

      return new Response(
        JSON.stringify({
          success: true,
          demo: true,
          account: {
            username: demoUsername,
            id: "demo",
          },
          imported: {
            posts: demoPosts.length,
            comments: demoComments.length,
            hasInsights: false,
          },
          message: "Demo data loaded. To use real Instagram data, create a Facebook Page and link your Instagram Business account to it.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get Instagram Business Account for each page
    let instagramAccountId: string | null = null;
    let instagramUsername: string | null = null;
    let pageAccessToken: string | null = null;

    for (const page of pagesData.data) {
      console.log(`Checking page: ${page.name} (${page.id})`);
      
      const igAccountResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/${page.id}?fields=instagram_business_account{id,username,followers_count,media_count}&access_token=${page.access_token || ACCESS_TOKEN}`
      );
      
      if (igAccountResponse.ok) {
        const igData = await igAccountResponse.json();
        if (igData.instagram_business_account) {
          instagramAccountId = igData.instagram_business_account.id;
          instagramUsername = igData.instagram_business_account.username;
          pageAccessToken = page.access_token || ACCESS_TOKEN;
          console.log(`Found Instagram account: @${instagramUsername} (${instagramAccountId})`);
          break;
        }
      }
    }

    if (!instagramAccountId) {
      return new Response(
        JSON.stringify({ 
          error: "No Instagram Business Account found",
          hint: "Your Facebook Page must be connected to an Instagram Business or Creator account. Go to your Facebook Page settings to connect Instagram."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Upsert social account in database
    const { data: socialAccount, error: accountError } = await supabase
      .from("social_accounts")
      .upsert({
        user_id: user.id,
        platform: "instagram",
        account_name: instagramUsername || "Instagram Account",
        account_handle: `@${instagramUsername}`,
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
    for (const media of mediaData.slice(0, 10)) {
      try {
        const commentsResponse = await fetch(
          `${FACEBOOK_GRAPH_API}/${media.id}/comments?fields=id,text,timestamp,username&limit=50&access_token=${pageAccessToken}`
        );
        
        if (commentsResponse.ok) {
          const commentsJson = await commentsResponse.json();
          const comments = commentsJson.data || [];
          
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
