import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Platform = 'instagram' | 'youtube' | 'facebook';

interface PlatformMetrics {
  platform: Platform;
  totalReach: number;
  totalImpressions: number;
  postsCount: number;
  avgEngagementRate: number;
  followers: number;
}

interface ReachTrendPoint {
  date: string;
  instagram: number;
  youtube: number;
  facebook: number;
}

interface TopPost {
  id: string;
  platform: Platform;
  content: string | null;
  reach: number;
  mediaUrl: string | null;
  publishedAt: string | null;
  engagementRate: number;
  likesCount: number;
  commentsCount: number;
}

export function usePlatformComparison() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cross-platform-comparison', user?.id],
    queryFn: async (): Promise<PlatformMetrics[]> => {
      if (!user) return [];

      const platforms: Platform[] = ['instagram', 'youtube', 'facebook'];
      const results: PlatformMetrics[] = [];

      for (const platform of platforms) {
        const [postsRes, accountsRes] = await Promise.all([
          supabase
            .from('posts')
            .select('reach, impressions, engagement_rate, likes_count, comments_count')
            .eq('user_id', user.id)
            .eq('platform', platform),
          supabase
            .from('social_accounts')
            .select('followers_count')
            .eq('user_id', user.id)
            .eq('platform', platform)
            .limit(1)
            .maybeSingle(),
        ]);

        const posts = postsRes.data || [];
        const rawReach = posts.reduce((sum, p) => sum + (p.reach || 0), 0);
        const totalInteractions = posts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);
        // Smart fallback: use interactions when reach is 0
        const totalReach = rawReach > 0 ? rawReach : totalInteractions;
        const totalImpressions = posts.reduce((sum, p) => sum + (p.impressions || 0), 0);
        const avgEngagement = posts.length
          ? posts.reduce((sum, p) => sum + (Number(p.engagement_rate) || 0), 0) / posts.length
          : 0;

        results.push({
          platform,
          totalReach,
          totalImpressions,
          postsCount: posts.length,
          avgEngagementRate: Math.round(avgEngagement * 100) / 100,
          followers: accountsRes.data?.followers_count || 0,
        });
      }

      return results;
    },
    enabled: !!user,
  });
}

export function useReachTrends() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cross-platform-reach-trends', user?.id],
    queryFn: async (): Promise<ReachTrendPoint[]> => {
      if (!user) return [];

      const { data: posts } = await supabase
        .from('posts')
        .select('platform, reach, published_at, likes_count, comments_count')
        .eq('user_id', user.id)
        .not('published_at', 'is', null)
        .order('published_at', { ascending: true });

      if (!posts?.length) return [];

      const grouped: Record<string, ReachTrendPoint> = {};

      for (const post of posts) {
        const date = new Date(post.published_at!).toISOString().split('T')[0];
        if (!grouped[date]) {
          grouped[date] = { date, instagram: 0, youtube: 0, facebook: 0 };
        }
        const platform = post.platform as Platform;
        // Smart fallback: use interactions when reach is 0
        const value = (post.reach || 0) > 0 ? post.reach! : (post.likes_count || 0) + (post.comments_count || 0);
        if (platform in grouped[date]) {
          grouped[date][platform] += value;
        }
      }

      return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!user,
  });
}

export function useTopContentByReach() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cross-platform-top-content', user?.id],
    queryFn: async (): Promise<TopPost[]> => {
      if (!user) return [];

      const { data } = await supabase
        .from('posts')
        .select('id, platform, content, reach, media_url, published_at, engagement_rate, likes_count, comments_count')
        .eq('user_id', user.id)
        .order('reach', { ascending: false })
        .limit(5);

      return (data || []).map(p => ({
        id: p.id,
        platform: p.platform as Platform,
        content: p.content,
        reach: p.reach || 0,
        mediaUrl: p.media_url,
        publishedAt: p.published_at,
        engagementRate: Number(p.engagement_rate) || 0,
        likesCount: p.likes_count || 0,
        commentsCount: p.comments_count || 0,
      }));
    },
    enabled: !!user,
  });
}

export function useCrossPlatformInsights() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cross-platform-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      return data || [];
    },
    enabled: !!user,
  });
}
