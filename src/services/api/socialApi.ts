// Real API Layer - Fetches data from Supabase database
// Only uses real data from connected Instagram account

import { supabase } from '@/integrations/supabase/client';
import { 
  SocialAccount, 
  Post, 
  Comment, 
  AudienceDemographics,
  AudienceGrowth,
  EngagementAnalytics,
  SentimentAnalytics,
  BestPostingTime,
  AIInsight,
  TrendingTopic,
  APIResponse,
  SocialPlatform,
  SentimentType,
} from './types';

// ============================================================================
// Social Accounts API
// ============================================================================
export const accountsApi = {
  async getAll(): Promise<APIResponse<SocialAccount[]>> {
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped: SocialAccount[] = (accounts || []).map(a => ({
      id: a.id,
      platform: a.platform as SocialPlatform,
      username: a.account_handle || '',
      name: a.account_name,
      profilePictureUrl: a.profile_image_url || '',
      followersCount: a.followers_count || 0,
      followingCount: a.following_count || 0,
      postsCount: 0,
      isConnected: a.is_connected || false,
    }));

    return {
      data: mapped,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getById(accountId: string): Promise<APIResponse<SocialAccount | null>> {
    const { data: account, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .maybeSingle();

    if (error) throw error;

    const mapped: SocialAccount | null = account ? {
      id: account.id,
      platform: account.platform as SocialPlatform,
      username: account.account_handle || '',
      name: account.account_name,
      profilePictureUrl: account.profile_image_url || '',
      followersCount: account.followers_count || 0,
      followingCount: account.following_count || 0,
      postsCount: 0,
      isConnected: account.is_connected || false,
    } : null;

    return {
      data: mapped,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async connect(platform: SocialPlatform): Promise<APIResponse<{ authUrl: string }>> {
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=instagram_basic,pages_show_list`;
    return {
      data: { authUrl },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async disconnect(accountId: string): Promise<APIResponse<{ success: boolean }>> {
    const { error } = await supabase
      .from('social_accounts')
      .update({ is_connected: false })
      .eq('id', accountId);

    if (error) throw error;

    return {
      data: { success: true },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },
};

// ============================================================================
// Posts/Media API
// ============================================================================
export const postsApi = {
  async getAll(options?: { 
    platform?: SocialPlatform; 
    limit?: number;
    after?: string;
  }): Promise<APIResponse<Post[]>> {
    let query = supabase
      .from('posts')
      .select('*')
      .order('published_at', { ascending: false });

    if (options?.platform) {
      query = query.eq('platform', options.platform);
    }

    const limit = options?.limit || 25;
    query = query.limit(limit);

    const { data: posts, error, count } = await query;

    if (error) throw error;

    const mapped: Post[] = (posts || []).map(p => ({
      id: p.id,
      platform: p.platform as SocialPlatform,
      accountId: p.social_account_id || '',
      externalId: p.external_post_id || undefined,
      type: (p.post_type || 'image') as 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'story',
      content: p.content || '',
      mediaUrl: p.media_url || undefined,
      publishedAt: p.published_at || p.created_at || new Date().toISOString(),
      metrics: {
        likes: p.likes_count || 0,
        comments: p.comments_count || 0,
        shares: p.shares_count || 0,
        saves: 0,
        reach: p.reach || 0,
        impressions: p.impressions || 0,
        engagementRate: Number(p.engagement_rate) || 0,
      },
      hashtags: [],
      mentions: [],
    }));

    return {
      data: mapped,
      pagination: {
        total: count || mapped.length,
        page: 1,
        perPage: limit,
        hasMore: (count || 0) > limit,
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getById(postId: string): Promise<APIResponse<Post | null>> {
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (error) throw error;

    const mapped: Post | null = post ? {
      id: post.id,
      platform: post.platform as SocialPlatform,
      accountId: post.social_account_id || '',
      externalId: post.external_post_id || undefined,
      type: (post.post_type || 'image') as 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'story',
      content: post.content || '',
      mediaUrl: post.media_url || undefined,
      publishedAt: post.published_at || post.created_at || new Date().toISOString(),
      metrics: {
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        shares: post.shares_count || 0,
        saves: 0,
        reach: post.reach || 0,
        impressions: post.impressions || 0,
        engagementRate: Number(post.engagement_rate) || 0,
      },
      hashtags: [],
      mentions: [],
    } : null;

    return {
      data: mapped,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getStats(platform?: SocialPlatform): Promise<APIResponse<{
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalReach: number;
    avgEngagement: number;
  }>> {
    let query = supabase
      .from('posts')
      .select('likes_count, comments_count, shares_count, reach, engagement_rate');

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    const postList = posts || [];
    const stats = {
      totalPosts: postList.length,
      totalLikes: postList.reduce((sum, p) => sum + (p.likes_count || 0), 0),
      totalComments: postList.reduce((sum, p) => sum + (p.comments_count || 0), 0),
      totalShares: postList.reduce((sum, p) => sum + (p.shares_count || 0), 0),
      totalReach: postList.reduce((sum, p) => sum + (p.reach || 0), 0),
      avgEngagement: postList.length > 0 
        ? postList.reduce((sum, p) => sum + Number(p.engagement_rate || 0), 0) / postList.length 
        : 0,
    };

    return {
      data: stats,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },
};

// ============================================================================
// Comments API
// ============================================================================
export const commentsApi = {
  async getByPostId(postId: string): Promise<APIResponse<Comment[]>> {
    const { data: comments, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mapped: Comment[] = (comments || []).map(c => ({
      id: c.id,
      postId: c.post_id || '',
      authorName: c.author_name || 'Anonymous',
      content: c.content,
      createdAt: c.created_at || new Date().toISOString(),
      likes: 0,
      sentiment: c.sentiment as SentimentType | undefined,
      sentimentScore: c.sentiment_score ? Number(c.sentiment_score) : undefined,
      isReply: false,
    }));

    return {
      data: mapped,
      pagination: {
        total: mapped.length,
        page: 1,
        perPage: 50,
        hasMore: false,
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getAll(platform?: SocialPlatform): Promise<APIResponse<Comment[]>> {
    let query = supabase
      .from('post_comments')
      .select('*, posts!inner(platform)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (platform) {
      query = query.eq('posts.platform', platform);
    }

    const { data: comments, error } = await query;

    if (error) throw error;

    const mapped: Comment[] = (comments || []).map(c => ({
      id: c.id,
      postId: c.post_id || '',
      authorName: c.author_name || 'Anonymous',
      content: c.content,
      createdAt: c.created_at || new Date().toISOString(),
      likes: 0,
      sentiment: c.sentiment as SentimentType | undefined,
      sentimentScore: c.sentiment_score ? Number(c.sentiment_score) : undefined,
      isReply: false,
    }));

    return {
      data: mapped,
      pagination: {
        total: mapped.length,
        page: 1,
        perPage: 100,
        hasMore: false,
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async analyzeSentiment(): Promise<APIResponse<{ analyzed: number }>> {
    // Get unanalyzed comments
    const { data: comments, error: fetchError } = await supabase
      .from('post_comments')
      .select('id, content')
      .is('sentiment', null)
      .limit(50);

    if (fetchError) throw fetchError;

    if (!comments || comments.length === 0) {
      return {
        data: { analyzed: 0 },
        meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
      };
    }

    // Call the analyze-sentiment edge function
    const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
      body: { comments },
    });

    if (error) throw error;

    return {
      data: { analyzed: data?.analyzed || 0 },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getSentimentStats(platform?: SocialPlatform): Promise<APIResponse<{
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    positivePercent: number;
    negativePercent: number;
    neutralPercent: number;
    avgScore: number;
  }>> {
    let query = supabase
      .from('post_comments')
      .select('sentiment, sentiment_score, posts!inner(platform)');

    if (platform) {
      query = query.eq('posts.platform', platform);
    }

    const { data: comments, error } = await query;

    if (error) throw error;

    const commentList = comments || [];
    const total = commentList.length;
    const positive = commentList.filter(c => c.sentiment === 'positive').length;
    const negative = commentList.filter(c => c.sentiment === 'negative').length;
    const neutral = commentList.filter(c => c.sentiment === 'neutral').length;
    const avgScore = total > 0 
      ? commentList.reduce((sum, c) => sum + Number(c.sentiment_score || 0.5), 0) / total 
      : 0;

    return {
      data: {
        total,
        positive,
        negative,
        neutral,
        positivePercent: total > 0 ? (positive / total) * 100 : 0,
        negativePercent: total > 0 ? (negative / total) * 100 : 0,
        neutralPercent: total > 0 ? (neutral / total) * 100 : 0,
        avgScore,
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },
};

// ============================================================================
// Audience/Demographics API
// ============================================================================
export const audienceApi = {
  async getDemographics(accountId?: string): Promise<APIResponse<AudienceDemographics>> {
    // Demographics would come from Instagram API - for now return empty structure
    // This data requires instagram_manage_insights permission
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('platform', 'instagram')
      .limit(1);

    const account = accounts?.[0];

    return {
      data: {
        accountId: accountId || account?.id || '',
        platform: 'instagram',
        totalFollowers: account?.followers_count || 0,
        ageGenderBreakdown: [],
        topCities: [],
        topCountries: [],
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getGrowth(days: number = 30, platform?: SocialPlatform): Promise<APIResponse<AudienceGrowth[]>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('audience_metrics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: metrics, error } = await query;

    if (error) throw error;

    const mapped: AudienceGrowth[] = (metrics || []).map(m => ({
      date: m.date,
      followersCount: m.followers_count || 0,
      followingCount: m.following_count || 0,
      newFollowers: m.new_followers || 0,
      lostFollowers: m.lost_followers || 0,
      netChange: (m.new_followers || 0) - (m.lost_followers || 0),
    }));

    return {
      data: mapped,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getSummary(): Promise<APIResponse<{
    totalFollowers: number;
    totalFollowing: number;
    growthRate: number;
    newFollowersToday: number;
    newFollowersWeek: number;
  }>> {
    // Get from social_accounts
    const { data: accounts } = await supabase
      .from('social_accounts')
      .select('followers_count, following_count')
      .eq('platform', 'instagram');

    const totalFollowers = (accounts || []).reduce((sum, a) => sum + (a.followers_count || 0), 0);
    const totalFollowing = (accounts || []).reduce((sum, a) => sum + (a.following_count || 0), 0);

    // Get recent audience metrics for growth calculation
    const { data: metrics } = await supabase
      .from('audience_metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    const metricsList = metrics || [];
    const today = metricsList[0];
    const weekAgo = metricsList.slice(0, 7);
    const monthAgo = metricsList[metricsList.length - 1];

    const newFollowersWeek = weekAgo.reduce((sum, m) => sum + (m.new_followers || 0), 0);
    const growthRate = monthAgo?.followers_count 
      ? ((totalFollowers - monthAgo.followers_count) / monthAgo.followers_count) * 100 
      : 0;

    return {
      data: {
        totalFollowers,
        totalFollowing,
        growthRate,
        newFollowersToday: today?.new_followers || 0,
        newFollowersWeek,
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },
};

// ============================================================================
// Analytics API
// ============================================================================
export const analyticsApi = {
  async getEngagement(days: number = 30, platform?: SocialPlatform): Promise<APIResponse<EngagementAnalytics[]>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('posts')
      .select('published_at, likes_count, comments_count, shares_count, reach, impressions')
      .gte('published_at', startDate.toISOString())
      .order('published_at', { ascending: true });

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    // Group by date
    const byDate: Record<string, EngagementAnalytics> = {};
    (posts || []).forEach(p => {
      const date = p.published_at?.split('T')[0] || new Date().toISOString().split('T')[0];
      if (!byDate[date]) {
        byDate[date] = {
          date,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          reach: 0,
          impressions: 0,
          profileViews: 0,
          websiteClicks: 0,
        };
      }
      byDate[date].likes += p.likes_count || 0;
      byDate[date].comments += p.comments_count || 0;
      byDate[date].shares += p.shares_count || 0;
      byDate[date].reach += p.reach || 0;
      byDate[date].impressions += p.impressions || 0;
    });

    return {
      data: Object.values(byDate),
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getSentiment(days: number = 14, platform?: SocialPlatform): Promise<APIResponse<SentimentAnalytics[]>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = supabase
      .from('post_comments')
      .select('created_at, sentiment, sentiment_score, posts!inner(platform)')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (platform) {
      query = query.eq('posts.platform', platform);
    }

    const { data: comments, error } = await query;

    if (error) throw error;

    // Group by date
    const byDate: Record<string, SentimentAnalytics> = {};
    (comments || []).forEach(c => {
      const date = c.created_at?.split('T')[0] || new Date().toISOString().split('T')[0];
      if (!byDate[date]) {
        byDate[date] = {
          date,
          positive: 0,
          negative: 0,
          neutral: 0,
          averageScore: 0,
          totalComments: 0,
        };
      }
      byDate[date].totalComments += 1;
      if (c.sentiment === 'positive') byDate[date].positive += 1;
      if (c.sentiment === 'negative') byDate[date].negative += 1;
      if (c.sentiment === 'neutral') byDate[date].neutral += 1;
    });

    // Calculate average scores
    Object.values(byDate).forEach(d => {
      d.averageScore = d.totalComments > 0 
        ? (d.positive * 1 + d.neutral * 0.5 + d.negative * 0) / d.totalComments 
        : 0;
    });

    return {
      data: Object.values(byDate),
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getBestPostingTimes(platform?: SocialPlatform): Promise<APIResponse<BestPostingTime[]>> {
    let query = supabase
      .from('best_posting_times')
      .select('*')
      .order('engagement_score', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: times, error } = await query;

    if (error) throw error;

    const mapped: BestPostingTime[] = (times || []).map(t => ({
      dayOfWeek: t.day_of_week,
      hourOfDay: t.hour_of_day,
      engagementScore: Number(t.engagement_score) || 0,
      sampleSize: t.sample_size || 0,
    }));

    return {
      data: mapped,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async getDashboardSummary(): Promise<APIResponse<{
    totalFollowers: number;
    totalEngagement: number;
    totalReach: number;
    totalPosts: number;
    avgEngagementRate: number;
    positiveSentimentPercent: number;
  }>> {
    // Get posts stats and accounts in parallel
    const [{ data: posts }, { data: accounts }] = await Promise.all([
      supabase.from('posts').select('likes_count, comments_count, shares_count, reach, engagement_rate'),
      supabase.from('social_accounts').select('followers_count'),
    ]);

    const postList = posts || [];
    const totalFollowers = (accounts || []).reduce((sum, a) => sum + (a.followers_count || 0), 0);
    const totalEngagement = postList.reduce((sum, p) => 
      sum + (p.likes_count || 0) + (p.comments_count || 0) + (p.shares_count || 0), 0);
    const totalReach = postList.reduce((sum, p) => sum + (p.reach || 0), 0);
    const avgEngagementRate = postList.length > 0 
      ? postList.reduce((sum, p) => sum + Number(p.engagement_rate || 0), 0) / postList.length
      : 0;

    // Get sentiment stats
    const { data: comments } = await supabase
      .from('post_comments')
      .select('sentiment');

    const commentList = comments || [];
    const positiveCount = commentList.filter(c => c.sentiment === 'positive').length;
    const positiveSentimentPercent = commentList.length > 0 
      ? (positiveCount / commentList.length) * 100 
      : 0;

    return {
      data: {
        totalFollowers,
        totalEngagement,
        totalReach,
        totalPosts: postList.length,
        avgEngagementRate,
        positiveSentimentPercent,
      },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },
};

// ============================================================================
// AI Insights API
// ============================================================================
export const insightsApi = {
  async getAll(): Promise<APIResponse<AIInsight[]>> {
    const { data: insights, error } = await supabase
      .from('ai_insights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const mapped: AIInsight[] = (insights || []).map(i => ({
      id: i.id,
      type: (i.insight_type || 'tip') as 'trend' | 'tip' | 'alert' | 'opportunity',
      priority: (i.priority || 'medium') as 'high' | 'medium' | 'low',
      title: i.title,
      description: i.description,
      platform: i.platform as SocialPlatform | undefined,
      actionable: true,
      createdAt: i.created_at || new Date().toISOString(),
      isRead: i.is_read || false,
    }));

    return {
      data: mapped,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async markAsRead(insightId: string): Promise<APIResponse<{ success: boolean }>> {
    const { error } = await supabase
      .from('ai_insights')
      .update({ is_read: true })
      .eq('id', insightId);

    if (error) throw error;

    return {
      data: { success: true },
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },

  async generate(): Promise<APIResponse<AIInsight[]>> {
    // Call the edge function to generate insights
    const { error } = await supabase.functions.invoke('generate-insights');
    
    if (error) throw error;

    // Return fresh insights
    return this.getAll();
  },

  async getTrendingTopics(): Promise<APIResponse<TrendingTopic[]>> {
    // Extract hashtags from post content — counts only, no fake growth data
    const { data: posts } = await supabase
      .from('posts')
      .select('content')
      .order('published_at', { ascending: false })
      .limit(50);

    const hashtagCounts: Record<string, number> = {};
    (posts || []).forEach(p => {
      const hashtags = p.content?.match(/#\w+/g) || [];
      hashtags.forEach((tag: string) => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
      });
    });

    const topics: TrendingTopic[] = Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({
        topic: tag.replace('#', ''),
        hashtag: tag,
        mentions: count,
        growth: 0, // No historical data available to calculate real growth
        sentiment: 'neutral' as const,
        relatedPosts: [],
      }));

    return {
      data: topics,
      meta: { requestId: crypto.randomUUID(), timestamp: new Date().toISOString() },
    };
  },
};

// ============================================================================
// Export unified API object
// ============================================================================
export const socialApi = {
  accounts: accountsApi,
  posts: postsApi,
  comments: commentsApi,
  audience: audienceApi,
  analytics: analyticsApi,
  insights: insightsApi,
};

export default socialApi;
