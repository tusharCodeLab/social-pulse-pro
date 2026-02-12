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

// ============================================================================
// AI Post Coach
// ============================================================================
export interface PostCoaching {
  overallScore: number;
  scoreLabel: string;
  captionTips: string[];
  hashtagSuggestions: string[];
  contentIdeas: string[];
  performancePrediction: string;
  topStrength: string;
  biggestOpportunity: string;
}

export function useAIPostCoach() {
  return useMutation({
    mutationFn: async (): Promise<{ coaching: PostCoaching | null; message?: string }> => {
      const { data, error } = await supabase.functions.invoke("ai-post-coach");
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// AI Performance Digest
// ============================================================================
export interface PerformanceDigest {
  headline: string;
  summary: string;
  highlights: { emoji: string; text: string }[];
  healthScore: number;
  healthLabel: string;
  weeklyGoal: string;
  riskAlert?: string;
}

export function useAIPerformanceDigest() {
  return useMutation({
    mutationFn: async (): Promise<{ digest: PerformanceDigest | null; message?: string }> => {
      const { data, error } = await supabase.functions.invoke("ai-performance-digest");
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// AI Caption Generator
// ============================================================================
export interface GeneratedCaption {
  style: string;
  caption: string;
  hashtags: string[];
  estimatedEngagement: string;
  hookStrength: number;
}

export function useAICaptionGenerator() {
  return useMutation({
    mutationFn: async (params: { topic: string; tone?: string; postType?: string }): Promise<{ captions: GeneratedCaption[] }> => {
      const { data, error } = await supabase.functions.invoke("ai-caption-generator", {
        body: params,
      });
      if (error) throw error;
      return data;
    },
  });
}

// ============================================================================
// AI Content Ideas
// ============================================================================
export interface ContentIdea {
  title: string;
  description: string;
  format: string;
  priority: string;
  basedOn: string;
  estimatedImpact: string;
  bestDay: string;
}

export function useAIContentIdeas() {
  return useMutation({
    mutationFn: async (): Promise<{ ideas: ContentIdea[] | null; strategy?: string; message?: string }> => {
      const { data, error } = await supabase.functions.invoke("ai-content-ideas");
      if (error) throw error;
      return data;
    },
  });
}
