// React Query hooks for the Social API layer
// These hooks provide easy data fetching with caching and automatic refetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/services/api';
import type { SocialPlatform } from '@/services/api/types';
import { useActiveProfileStore } from '@/stores/activeProfileStore';

// ============================================================================
// Query Keys - Centralized for easy invalidation
// ============================================================================
export const queryKeys = {
  accounts: ['social-accounts'] as const,
  account: (id: string) => ['social-account', id] as const,
  posts: (platform?: SocialPlatform, profileId?: string | null) => ['posts', platform, profileId] as const,
  post: (id: string) => ['post', id] as const,
  postStats: (profileId?: string | null) => ['post-stats', profileId] as const,
  comments: (postId?: string, profileId?: string | null) => ['comments', postId, profileId] as const,
  sentimentStats: (profileId?: string | null) => ['sentiment-stats', profileId] as const,
  demographics: (accountId?: string) => ['demographics', accountId] as const,
  audienceGrowth: (days?: number, profileId?: string | null) => ['audience-growth', days, profileId] as const,
  audienceSummary: ['audience-summary'] as const,
  engagement: (days?: number, profileId?: string | null) => ['engagement', days, profileId] as const,
  sentimentTrend: (days?: number) => ['sentiment-trend', days] as const,
  bestPostingTimes: (platform?: SocialPlatform) => ['best-posting-times', platform] as const,
  dashboardSummary: (profileId?: string | null) => ['dashboard-summary', profileId] as const,
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
    staleTime: 5 * 60 * 1000,
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
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.posts(platform, activeProfileId),
    queryFn: async () => {
      const response = await socialApi.posts.getAll({ platform, socialAccountId: activeProfileId });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
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

export function usePostStatsApi() {
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.postStats(activeProfileId),
    queryFn: async () => {
      const response = await socialApi.posts.getStats(activeProfileId);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Comments Hooks
// ============================================================================
export function useCommentsApi(postId?: string) {
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.comments(postId, activeProfileId),
    queryFn: async () => {
      if (postId) {
        const response = await socialApi.comments.getByPostId(postId);
        return response.data;
      }
      const response = await socialApi.comments.getAll(activeProfileId);
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSentimentStatsApi() {
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.sentimentStats(activeProfileId),
    queryFn: async () => {
      const response = await socialApi.comments.getSentimentStats(activeProfileId);
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
      queryClient.invalidateQueries({ queryKey: ['sentiment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['comments'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-trend'] });
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
    staleTime: 10 * 60 * 1000,
  });
}

export function useAudienceGrowthApi(days: number = 30) {
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.audienceGrowth(days, activeProfileId),
    queryFn: async () => {
      const response = await socialApi.audience.getGrowth(days, activeProfileId);
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
export function useEngagementAnalyticsApi(days: number = 30) {
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.engagement(days, activeProfileId),
    queryFn: async () => {
      const response = await socialApi.analytics.getEngagement(days, activeProfileId);
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
    staleTime: 30 * 60 * 1000,
  });
}

export function useDashboardSummaryApi() {
  const { activeProfileId } = useActiveProfileStore();
  return useQuery({
    queryKey: queryKeys.dashboardSummary(activeProfileId),
    queryFn: async () => {
      const response = await socialApi.analytics.getDashboardSummary(activeProfileId);
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
