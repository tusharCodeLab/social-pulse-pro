// Hooks for AI features: spam detection, trend detection, best posting times
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============================================================================
// Spam Detection
// ============================================================================
export function useSpamComments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["spam-comments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("post_comments")
        .select("id, content, author_name, is_spam, spam_reason, created_at")
        .eq("is_spam", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useDetectSpam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-spam");
      if (error) throw error;
      return data as { success: boolean; scanned: number; spamFound: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spam-comments"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });
}

// ============================================================================
// Personal Trends
// ============================================================================
export function usePersonalTrends() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["personal-trends", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("personal_trends")
        .select("*")
        .order("confidence_score", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useDetectTrends() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("detect-trends");
      if (error) throw error;
      return data as { success: boolean; trends: any[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personal-trends"] });
    },
  });
}

// ============================================================================
// Best Posting Times (AI-calculated)
// ============================================================================
export function useCalculateBestTimes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("calculate-best-times");
      if (error) throw error;
      return data as { success: boolean; totalPostsAnalyzed: number; bestTimes: any[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["best-posting-times"] });
    },
  });
}
