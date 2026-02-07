import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0";
const FACEBOOK_OAUTH_URL = "https://www.facebook.com/v18.0/dialog/oauth";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const META_APP_ID = Deno.env.get("META_APP_ID");
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    
    if (!META_APP_ID || !META_APP_SECRET) {
      console.error("Meta App credentials not configured");
      return new Response(
        JSON.stringify({ error: "Meta App credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // Action: Get authorization URL
    if (action === "authorize") {
      const redirectUri = url.searchParams.get("redirect_uri");
      const state = url.searchParams.get("state"); // Used to pass user session info
      
      if (!redirectUri) {
        return new Response(
          JSON.stringify({ error: "redirect_uri is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build Facebook OAuth URL
      const authParams = new URLSearchParams({
        client_id: META_APP_ID,
        redirect_uri: redirectUri,
        scope: "pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights",
        response_type: "code",
        state: state || "",
      });

      const authUrl = `${FACEBOOK_OAUTH_URL}?${authParams.toString()}`;
      
      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Exchange code for token (callback)
    if (action === "callback") {
      const code = url.searchParams.get("code");
      const redirectUri = url.searchParams.get("redirect_uri");
      
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

      if (!code || !redirectUri) {
        return new Response(
          JSON.stringify({ error: "code and redirect_uri are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Exchanging code for access token for user: ${user.id}`);

      // Exchange code for short-lived access token
      const tokenResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/oauth/access_token?` +
        `client_id=${META_APP_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `client_secret=${META_APP_SECRET}&` +
        `code=${code}`
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for token", details: errorData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenResponse.json();
      const shortLivedToken = tokenData.access_token;
      
      console.log("Short-lived token obtained, exchanging for long-lived token...");

      // Exchange for long-lived token (60 days)
      const longLivedResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${META_APP_ID}&` +
        `client_secret=${META_APP_SECRET}&` +
        `fb_exchange_token=${shortLivedToken}`
      );

      if (!longLivedResponse.ok) {
        const errorData = await longLivedResponse.text();
        console.error("Long-lived token exchange failed:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to get long-lived token", details: errorData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const longLivedData = await longLivedResponse.json();
      const accessToken = longLivedData.access_token;
      const expiresIn = longLivedData.expires_in || 5184000; // Default 60 days in seconds
      
      console.log(`Long-lived token obtained, expires in ${expiresIn} seconds`);

      // Calculate expiry date
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Get Facebook Pages to find Instagram Business Account
      const pagesResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/me/accounts?access_token=${accessToken}`
      );
      
      if (!pagesResponse.ok) {
        const errorData = await pagesResponse.text();
        console.error("Failed to fetch pages:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to fetch Facebook Pages", details: errorData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const pagesData = await pagesResponse.json();
      
      if (!pagesData.data || pagesData.data.length === 0) {
        return new Response(
          JSON.stringify({ error: "No Facebook Pages found. Please create a Facebook Page and connect it to your Instagram Business account." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find Instagram Business Account
      let instagramAccountId: string | null = null;
      let instagramUsername: string | null = null;
      let pageId: string | null = null;
      let pageAccessToken: string | null = null;

      for (const page of pagesData.data) {
        const igResponse = await fetch(
          `${FACEBOOK_GRAPH_API}/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token || accessToken}`
        );
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          if (igData.instagram_business_account) {
            instagramAccountId = igData.instagram_business_account.id;
            instagramUsername = igData.instagram_business_account.username;
            pageId = page.id;
            pageAccessToken = page.access_token;
            console.log(`Found Instagram account: @${instagramUsername}`);
            break;
          }
        }
      }

      if (!instagramAccountId) {
        return new Response(
          JSON.stringify({ 
            error: "No Instagram Business Account found",
            hint: "Make sure your Facebook Page is connected to an Instagram Business or Creator account."
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Store token in database (upsert)
      const { error: upsertError } = await supabase
        .from("instagram_tokens")
        .upsert({
          user_id: user.id,
          access_token: accessToken,
          token_type: "bearer",
          expires_at: expiresAt.toISOString(),
          instagram_user_id: instagramAccountId,
          instagram_username: instagramUsername,
          page_id: pageId,
          page_access_token: pageAccessToken,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      if (upsertError) {
        console.error("Failed to store token:", upsertError);
        return new Response(
          JSON.stringify({ error: "Failed to store token", details: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Token stored successfully for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          instagram_username: instagramUsername,
          instagram_user_id: instagramAccountId,
          expires_at: expiresAt.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Refresh token (for automatic refresh)
    if (action === "refresh") {
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

      // Get current token
      const { data: tokenData, error: tokenError } = await supabase
        .from("instagram_tokens")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: "No Instagram token found for user" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Refreshing token for user ${user.id}`);

      // Refresh the long-lived token
      const refreshResponse = await fetch(
        `${FACEBOOK_GRAPH_API}/oauth/access_token?` +
        `grant_type=fb_exchange_token&` +
        `client_id=${META_APP_ID}&` +
        `client_secret=${META_APP_SECRET}&` +
        `fb_exchange_token=${tokenData.access_token}`
      );

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.text();
        console.error("Token refresh failed:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to refresh token", details: errorData }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshData = await refreshResponse.json();
      const newAccessToken = refreshData.access_token;
      const expiresIn = refreshData.expires_in || 5184000;
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Update token in database
      const { error: updateError } = await supabase
        .from("instagram_tokens")
        .update({
          access_token: newAccessToken,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Failed to update token:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update token", details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Token refreshed successfully for user ${user.id}`);

      return new Response(
        JSON.stringify({
          success: true,
          expires_at: expiresAt.toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Disconnect Instagram
    if (action === "disconnect") {
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

      console.log(`Disconnecting Instagram for user ${user.id}`);

      // Delete token from database
      const { error: deleteError } = await supabase
        .from("instagram_tokens")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Failed to delete token:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to disconnect", details: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Also update social_accounts to mark as disconnected
      await supabase
        .from("social_accounts")
        .update({ is_connected: false })
        .eq("user_id", user.id)
        .eq("platform", "instagram");

      console.log(`Instagram disconnected for user ${user.id}`);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: Get connection status
    if (action === "status") {
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

      // Get token info
      const { data: tokenData, error: tokenError } = await supabase
        .from("instagram_tokens")
        .select("instagram_username, instagram_user_id, expires_at, updated_at")
        .eq("user_id", user.id)
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ connected: false }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isExpired = tokenData.expires_at ? new Date(tokenData.expires_at) < new Date() : false;
      const daysUntilExpiry = tokenData.expires_at 
        ? Math.ceil((new Date(tokenData.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return new Response(
        JSON.stringify({
          connected: true,
          instagram_username: tokenData.instagram_username,
          instagram_user_id: tokenData.instagram_user_id,
          expires_at: tokenData.expires_at,
          is_expired: isExpired,
          days_until_expiry: daysUntilExpiry,
          last_updated: tokenData.updated_at,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: authorize, callback, refresh, disconnect, or status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Instagram auth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
