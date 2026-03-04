// API Types - Matching Meta Graph API response structures
// These types can be used with both mock data and real API responses

export type SocialPlatform = 'instagram' | 'twitter' | 'facebook' | 'linkedin' | 'youtube';
export type SentimentType = 'positive' | 'negative' | 'neutral';
export type PostType = 'image' | 'video' | 'carousel' | 'text' | 'reel' | 'story';

// Social Account (matches Instagram Business Account structure)
export interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  username: string;
  name: string;
  profilePictureUrl: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  biography?: string;
  website?: string;
  isConnected: boolean;
  accessToken?: string;
  tokenExpiresAt?: string;
}

// Post/Media (matches Instagram Media structure)
export interface Post {
  id: string;
  platform: SocialPlatform;
  accountId: string;
  externalId?: string;
  type: PostType;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  publishedAt: string;
  metrics: PostMetrics;
  hashtags: string[];
  mentions: string[];
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  videoViews?: number;
}

// Comment (matches Instagram Comment structure)
export interface Comment {
  id: string;
  postId: string;
  externalId?: string;
  authorName: string;
  authorUsername?: string;
  authorProfilePic?: string;
  content: string;
  createdAt: string;
  likes: number;
  sentiment?: SentimentType;
  sentimentScore?: number;
  isReply: boolean;
  parentId?: string;
}

// Audience Demographics (matches Instagram Insights)
export interface AudienceDemographics {
  accountId: string;
  platform: SocialPlatform;
  totalFollowers: number;
  ageGenderBreakdown: AgeGenderData[];
  topCities: LocationData[];
  topCountries: LocationData[];
}

export interface AgeGenderData {
  ageRange: string;
  gender: 'male' | 'female' | 'unknown';
  percentage: number;
  count: number;
}

export interface LocationData {
  name: string;
  percentage: number;
  count: number;
}

// Audience Growth
export interface AudienceGrowth {
  date: string;
  followersCount: number;
  followingCount: number;
  newFollowers: number;
  lostFollowers: number;
  netChange: number;
}

// Engagement Analytics
export interface EngagementAnalytics {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
}

// Sentiment Analytics
export interface SentimentAnalytics {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  averageScore: number;
  totalComments: number;
}

// Best Posting Time
export interface BestPostingTime {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hourOfDay: number; // 0-23
  engagementScore: number;
  sampleSize: number;
}

// AI Insight
export interface AIInsight {
  id: string;
  type: 'trend' | 'tip' | 'alert' | 'opportunity';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: string;
  platform?: SocialPlatform;
  actionable: boolean;
  createdAt: string;
  isRead: boolean;
}

// Trending Topic
export interface TrendingTopic {
  topic: string;
  hashtag: string;
  mentions: number;
  growth: number;
  sentiment: SentimentType;
  relatedPosts: string[];
}

// API Response wrapper
export interface APIResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    hasMore: boolean;
    cursors?: {
      before?: string;
      after?: string;
    };
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

// API Error
export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
