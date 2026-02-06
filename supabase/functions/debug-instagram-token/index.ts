import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FACEBOOK_GRAPH_API = "https://graph.facebook.com/v18.0";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the test token from request body (for testing) or use stored secret
    let testToken: string | null = null;
    
    if (req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      testToken = body.token || null;
    }
    
    const ACCESS_TOKEN = testToken || Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    
    if (!ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "No token provided or configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Testing token (${ACCESS_TOKEN.length} characters)`);

    // Step 1: Check token info
    const tokenInfoResponse = await fetch(
      `${FACEBOOK_GRAPH_API}/debug_token?input_token=${ACCESS_TOKEN}&access_token=${ACCESS_TOKEN}`
    );
    
    let tokenInfo = null;
    if (tokenInfoResponse.ok) {
      const tokenData = await tokenInfoResponse.json();
      tokenInfo = {
        app_id: tokenData.data?.app_id,
        type: tokenData.data?.type,
        expires_at: tokenData.data?.expires_at ? new Date(tokenData.data.expires_at * 1000).toISOString() : null,
        is_valid: tokenData.data?.is_valid,
        scopes: tokenData.data?.scopes || [],
        user_id: tokenData.data?.user_id,
      };
    }

    // Step 2: Get user info
    const meResponse = await fetch(
      `${FACEBOOK_GRAPH_API}/me?fields=id,name,email&access_token=${ACCESS_TOKEN}`
    );
    
    let userInfo = null;
    if (meResponse.ok) {
      const meData = await meResponse.json();
      userInfo = {
        id: meData.id,
        name: meData.name,
        email: meData.email,
      };
    } else {
      const meError = await meResponse.text();
      userInfo = { error: meError };
    }

    // Step 3: Get Facebook Pages
    const pagesResponse = await fetch(
      `${FACEBOOK_GRAPH_API}/me/accounts?fields=id,name,category,access_token&access_token=${ACCESS_TOKEN}`
    );
    
    let pages: { id: string; name: string; category: string; hasInstagram: boolean; instagramUsername?: string }[] = [];
    
    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      
      // For each page, check for Instagram Business Account
      for (const page of (pagesData.data || [])) {
        const igResponse = await fetch(
          `${FACEBOOK_GRAPH_API}/${page.id}?fields=instagram_business_account{id,username}&access_token=${page.access_token || ACCESS_TOKEN}`
        );
        
        let hasInstagram = false;
        let instagramUsername: string | undefined;
        
        if (igResponse.ok) {
          const igData = await igResponse.json();
          if (igData.instagram_business_account) {
            hasInstagram = true;
            instagramUsername = igData.instagram_business_account.username;
          }
        }
        
        pages.push({
          id: page.id,
          name: page.name,
          category: page.category,
          hasInstagram,
          instagramUsername,
        });
      }
    } else {
      const pagesError = await pagesResponse.text();
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch pages",
          details: pagesError,
          tokenInfo,
          userInfo,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return diagnostic info
    return new Response(
      JSON.stringify({
        success: true,
        tokenInfo,
        userInfo,
        pages,
        diagnosis: pages.length === 0 
          ? "No Facebook Pages found. Make sure you're using a token from the Meta account that owns your Facebook Page."
          : pages.some(p => p.hasInstagram)
            ? `Ready! Found Instagram account: @${pages.find(p => p.hasInstagram)?.instagramUsername}`
            : "Pages found but none have Instagram Business Account connected. Connect Instagram to your Facebook Page first.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Debug error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
