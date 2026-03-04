import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0";
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const ACCESS_TOKEN = Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    if (!ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Facebook access token not configured. Please set the FACEBOOK_ACCESS_TOKEN secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");

    // Use anon key client with user's token for signing-keys auth validation
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const user = { id: userId };

    // Use service role client for DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Fetching Facebook Pages for user: ${user.id}`);

    // Step 1: Get pages with engagement metrics
    const pagesResponse = await fetch(
      `${FACEBOOK_GRAPH_API}/me/accounts?fields=id,name,category,access_token,fan_count,followers_count,picture{url}&access_token=${ACCESS_TOKEN}`
    );

    if (!pagesResponse.ok) {
      const errorText = await pagesResponse.text();
      console.error("Facebook Pages API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch Facebook Pages", details: errorText }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pagesData = await pagesResponse.json();
    const pages = pagesData.data || [];
    console.log(`Found ${pages.length} Facebook Pages`);

    if (pages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No Facebook Pages found", hint: "Make sure your token has 'pages_show_list' permission." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalPosts = 0;
    let totalComments = 0;
    const pagesSummary: { name: string; followers: number; posts: number }[] = [];

    for (const page of pages) {
      const pageToken = page.access_token || ACCESS_TOKEN;
      const pageName = page.name || "Unnamed Page";
      const followers = page.followers_count || page.fan_count || 0;
      const profilePic = page.picture?.data?.url || null;

      console.log(`Processing page: ${pageName} (${page.id}), Followers: ${followers}`);

      // Upsert social account for this page
      const { data: socialAccount, error: accountError } = await supabase
        .from("social_accounts")
        .upsert({
          user_id: user.id,
          platform: "facebook",
          account_name: pageName,
          account_handle: page.id,
          followers_count: followers,
          profile_image_url: profilePic,
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
        continue;
      }

      // Step 2: Fetch page posts
      await delay(500);
      const postsResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/${page.id}/posts?fields=id,message,created_time,full_picture,permalink_url,shares,likes.summary(true),comments.summary(true)&limit=25&access_token=${pageToken}`
      );

      if (!postsResponse.ok) {
        console.error(`Failed to fetch posts for ${pageName}:`, await postsResponse.text());
        continue;
      }

      const postsData = await postsResponse.json();
      const posts = postsData.data || [];
      console.log(`Fetched ${posts.length} posts for ${pageName}`);

      const postsToUpsert = posts.map((post: any) => ({
        user_id: user.id,
        platform: "facebook" as const,
        external_post_id: post.id,
        content: post.message || "",
        media_url: post.full_picture || null,
        post_type: post.full_picture ? "image" : "text",
        published_at: post.created_time,
        likes_count: post.likes?.summary?.total_count || 0,
        comments_count: post.comments?.summary?.total_count || 0,
        shares_count: post.shares?.count || 0,
        social_account_id: socialAccount?.id || null,
        updated_at: new Date().toISOString(),
      }));

      if (postsToUpsert.length > 0) {
        const { error: postsError } = await supabase
          .from("posts")
          .upsert(postsToUpsert, { onConflict: "user_id,external_post_id", ignoreDuplicates: false });

        if (postsError) {
          console.error("Error upserting posts:", postsError);
        } else {
          totalPosts += postsToUpsert.length;
        }
      }

      // Step 3: Fetch comments for top posts
      for (const post of posts.slice(0, 5)) {
        await delay(500);
        try {
          const commentsResponse = await fetch(
            `${FACEBOOK_GRAPH_API}/${post.id}/comments?fields=id,message,created_time,from&limit=50&access_token=${pageToken}`
          );

          if (commentsResponse.ok) {
            const commentsJson = await commentsResponse.json();
            const comments = commentsJson.data || [];

            if (comments.length > 0) {
              const { data: postData } = await supabase
                .from("posts")
                .select("id")
                .eq("user_id", user.id)
                .eq("external_post_id", post.id)
                .maybeSingle();

              if (postData) {
                for (const c of comments) {
                  const { error: insertError } = await supabase
                    .from("post_comments")
                    .upsert({
                      user_id: user.id,
                      post_id: postData.id,
                      content: c.message || "",
                      author_name: c.from?.name || "Anonymous",
                      created_at: c.created_time,
                      external_comment_id: c.id,
                    }, { onConflict: "user_id,external_comment_id", ignoreDuplicates: true });

                  if (!insertError) totalComments++;
                }
              }
            }
          }
        } catch (e) {
          console.error(`Error fetching comments for ${post.id}:`, e);
        }
      }

      pagesSummary.push({ name: pageName, followers, posts: posts.length });

      // Clean up stale posts from previously-synced pages
      // Delete any facebook posts whose external_post_id doesn't start with the current page ID
      const currentPagePrefix = page.id + "_";
      const { data: stalePosts } = await supabase
        .from("posts")
        .select("id, external_post_id")
        .eq("user_id", user.id)
        .eq("platform", "facebook");

      if (stalePosts && stalePosts.length > 0) {
        const staleIds = stalePosts
          .filter(p => p.external_post_id && !p.external_post_id.startsWith(currentPagePrefix))
          .map(p => p.id);

        if (staleIds.length > 0) {
          // Delete orphaned comments first
          for (const staleId of staleIds) {
            await supabase.from("post_comments").delete().eq("post_id", staleId);
          }
          // Then delete stale posts
          const { error: deleteError } = await supabase
            .from("posts")
            .delete()
            .in("id", staleIds);
          if (deleteError) console.error("Error cleaning stale posts:", deleteError);
          else console.log(`Cleaned up ${staleIds.length} stale Facebook posts from previous pages`);
        }
      }

      // Only process first page for now (to match social_accounts unique constraint)
      break;
    }

    console.log(`Done: ${totalPosts} posts, ${totalComments} comments`);

    return new Response(
      JSON.stringify({
        success: true,
        pages: pagesSummary,
        imported: { posts: totalPosts, comments: totalComments },
        page: { name: pagesSummary[0]?.name, followers: pagesSummary[0]?.followers },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Facebook fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
