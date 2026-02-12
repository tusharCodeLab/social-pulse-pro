import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all posts with engagement data
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("published_at, likes_count, comments_count, shares_count, engagement_rate")
      .eq("user_id", user.id)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false });

    if (postsError) throw postsError;

    if (!posts || posts.length < 3) {
      return new Response(JSON.stringify({
        success: true,
        message: "Need at least 3 posts to calculate best posting times",
        bestTimes: [],
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Calculate engagement by day/hour
    const timeSlots: Record<string, { totalEngagement: number; count: number }> = {};

    for (const post of posts) {
      const date = new Date(post.published_at!);
      const day = date.getUTCDay();
      const hour = date.getUTCHours();
      const key = `${day}-${hour}`;

      const engagement = (post.likes_count || 0) + (post.comments_count || 0) * 2 + (post.shares_count || 0) * 3;

      if (!timeSlots[key]) {
        timeSlots[key] = { totalEngagement: 0, count: 0 };
      }
      timeSlots[key].totalEngagement += engagement;
      timeSlots[key].count += 1;
    }

    // Sort by average engagement
    const ranked = Object.entries(timeSlots)
      .map(([key, val]) => {
        const [day, hour] = key.split("-").map(Number);
        return {
          day_of_week: day,
          hour_of_day: hour,
          engagement_score: val.count > 0 ? val.totalEngagement / val.count : 0,
          sample_size: val.count,
        };
      })
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 10);

    // Delete old best times and insert new
    await supabase.from("best_posting_times").delete().eq("user_id", user.id);

    const toInsert = ranked.map(r => ({
      user_id: user.id,
      platform: "instagram" as const,
      day_of_week: r.day_of_week,
      hour_of_day: r.hour_of_day,
      engagement_score: Math.round(r.engagement_score * 100) / 100,
      sample_size: r.sample_size,
      last_calculated_at: new Date().toISOString(),
    }));

    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from("best_posting_times").insert(toInsert);
      if (insertError) throw insertError;
    }

    const bestTimes = ranked.slice(0, 5).map(r => ({
      day: DAYS[r.day_of_week],
      hour: `${r.hour_of_day.toString().padStart(2, "0")}:00`,
      engagementScore: r.engagement_score,
      sampleSize: r.sample_size,
    }));

    console.log(`Calculated best times from ${posts.length} posts for user ${user.id}`);

    return new Response(JSON.stringify({
      success: true,
      totalPostsAnalyzed: posts.length,
      bestTimes,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Best times calculation error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
