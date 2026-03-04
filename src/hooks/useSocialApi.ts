// React Query hooks for the Social API layer
// These hooks provide easy data fetching with caching and automatic refetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/services/api';
import type { SocialPlatform } from '@/services/api/types';

// ============================================================================
// Query Keys - Centralized for easy invalidation
// ============================================================================
export const queryKeys = {
  accounts: ['social-accounts'] as const,
  account: (id: string) => ['social-account', id] as const,
  posts: (platform?: SocialPlatform) => ['posts', platform] as const,
  post: (id: string) => ['post', id] as const,
  postStats: ['post-stats'] as const,
  comments: (postId?: string) => ['comments', postId] as const,
  sentimentStats: ['sentiment-stats'] as const,
  demographics: (accountId?: string) => ['demographics', accountId] as const,
  audienceGrowth: (days?: number) => ['audience-growth', days] as const,
  audienceSummary: ['audience-summary'] as const,
  engagement: (days?: number) => ['engagement', days] as const,
  sentimentTrend: (days?: number) => ['sentiment-trend', days] as const,
  bestPostingTimes: (platform?: SocialPlatform) => ['best-posting-times', platform] as const,
  dashboardSummary: ['dashboard-summary'] as const,
  insights: ['ai-insights'] as const,
  trendingTopics: ['trending-topics'] as const,
};

// ============================================================================
// Account Hooks
// ============================================================================
export function useSocialAccountsApi() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => {
      const response = await socialApi.accounts.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSocialAccountApi(accountId: string) {
  return useQuery({
    queryKey: queryKeys.account(accountId),
    queryFn: async () => {
      const response = await socialApi.accounts.getById(accountId);
      return response.data;
    },
    enabled: !!accountId,
  });
}

export function useConnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (platform: SocialPlatform) => {
      const response = await socialApi.accounts.connect(platform);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await socialApi.accounts.disconnect(accountId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
    },
  });
}

// ============================================================================
// Posts Hooks
// ============================================================================
export function usePostsApi(platform?: SocialPlatform) {
  return useQuery({
    queryKey: queryKeys.posts(platform),
    queryFn: async () => {
      const response = await socialApi.posts.getAll({ platform });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePostApi(postId: string) {
  return useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: async () => {
      const response = await socialApi.posts.getById(postId);
      return response.data;
    },
    enabled: !!postId,
  });
}

export function usePostStatsApi(platform?: SocialPlatform) {
  return useQuery({
    queryKey: [...queryKeys.postStats, platform],
    queryFn: async () => {
      const response = await socialApi.posts.getStats(platform);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Comments Hooks
// ============================================================================
export function useCommentsApi(postId?: string, platform?: SocialPlatform) {
  return useQuery({
    queryKey: [...queryKeys.comments(postId), platform],
    queryFn: async () => {
      if (postId) {
        const response = await socialApi.comments.getByPostId(postId);
        return response.data;
      }
      const response = await socialApi.comments.getAll(platform);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSentimentStatsApi(platform?: SocialPlatform) {
  return useQuery({
    queryKey: [...queryKeys.sentimentStats, platform],
    queryFn: async () => {
      const response = await socialApi.comments.getSentimentStats(platform);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyzeSentimentApi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.comments.analyzeSentiment();
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all sentiment-related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: queryKeys.sentimentStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.comments() });
      queryClient.invalidateQueries({ queryKey: queryKeys.sentimentTrend() });
    },
  });
}

// ============================================================================
// Audience Hooks
// ============================================================================
export function useDemographicsApi(accountId?: string) {
  return useQuery({
    queryKey: queryKeys.demographics(accountId),
    queryFn: async () => {
      const response = await socialApi.audience.getDemographics(accountId);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAudienceGrowthApi(days: number = 30) {
  return useQuery({
    queryKey: queryKeys.audienceGrowth(days),
    queryFn: async () => {
      const response = await socialApi.audience.getGrowth(days);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAudienceSummaryApi() {
  return useQuery({
    queryKey: queryKeys.audienceSummary,
    queryFn: async () => {
      const response = await socialApi.audience.getSummary();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Analytics Hooks
// ============================================================================
export function useEngagementAnalyticsApi(days: number = 30, platform?: SocialPlatform) {
  return useQuery({
    queryKey: [...queryKeys.engagement(days), platform],
    queryFn: async () => {
      const response = await socialApi.analytics.getEngagement(days, platform);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSentimentTrendApi(days: number = 14) {
  return useQuery({
    queryKey: queryKeys.sentimentTrend(days),
    queryFn: async () => {
      const response = await socialApi.analytics.getSentiment(days);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBestPostingTimesApi(platform?: SocialPlatform) {
  return useQuery({
    queryKey: queryKeys.bestPostingTimes(platform),
    queryFn: async () => {
      const response = await socialApi.analytics.getBestPostingTimes(platform);
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useDashboardSummaryApi() {
  return useQuery({
    queryKey: queryKeys.dashboardSummary,
    queryFn: async () => {
      const response = await socialApi.analytics.getDashboardSummary();
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// AI Insights Hooks
// ============================================================================
export function useAIInsightsApi() {
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: async () => {
      const response = await socialApi.insights.getAll();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarkInsightReadApi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (insightId: string) => {
      const response = await socialApi.insights.markAsRead(insightId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights });
    },
  });
}

export function useGenerateInsightsApi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.insights.generate();
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights });
    },
  });
}

export function useTrendingTopicsApi() {
  return useQuery({
    queryKey: queryKeys.trendingTopics,
    queryFn: async () => {
      const response = await socialApi.insights.getTrendingTopics();
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
