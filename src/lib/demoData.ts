// Demo data for the Social Media Analytics Dashboard

export interface EngagementData {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

export interface PostData {
  id: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'tiktok';
  content: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
}

export interface AudienceData {
  ageGroup: string;
  percentage: number;
  count: number;
}

export interface GenderData {
  gender: string;
  percentage: number;
}

export interface LocationData {
  country: string;
  percentage: number;
  count: number;
}

export interface GrowthData {
  date: string;
  followers: number;
  following: number;
}

export interface SentimentData {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface TopicData {
  topic: string;
  mentions: number;
  sentiment: number;
}

export interface BestTimeData {
  hour: number;
  day: string;
  engagement: number;
}

// Engagement over time (last 30 days)
export const engagementData: EngagementData[] = [
  { date: 'Jan 1', likes: 1250, comments: 89, shares: 45, saves: 120 },
  { date: 'Jan 2', likes: 1380, comments: 102, shares: 52, saves: 145 },
  { date: 'Jan 3', likes: 1120, comments: 76, shares: 38, saves: 98 },
  { date: 'Jan 4', likes: 1540, comments: 134, shares: 67, saves: 178 },
  { date: 'Jan 5', likes: 1890, comments: 156, shares: 89, saves: 234 },
  { date: 'Jan 6', likes: 1670, comments: 123, shares: 72, saves: 189 },
  { date: 'Jan 7', likes: 2100, comments: 189, shares: 98, saves: 267 },
  { date: 'Jan 8', likes: 1980, comments: 167, shares: 85, saves: 245 },
  { date: 'Jan 9', likes: 1750, comments: 134, shares: 71, saves: 198 },
  { date: 'Jan 10', likes: 2340, comments: 212, shares: 112, saves: 312 },
  { date: 'Jan 11', likes: 2150, comments: 189, shares: 95, saves: 278 },
  { date: 'Jan 12', likes: 1890, comments: 156, shares: 82, saves: 234 },
  { date: 'Jan 13', likes: 2450, comments: 234, shares: 125, saves: 345 },
  { date: 'Jan 14', likes: 2780, comments: 267, shares: 145, saves: 389 },
];

// Posts data
export const postsData: PostData[] = [
  {
    id: '1',
    platform: 'twitter',
    content: 'Excited to announce our new product launch! 🚀 Stay tuned for more updates.',
    date: '2024-01-14',
    likes: 2780,
    comments: 267,
    shares: 145,
    reach: 45600,
    engagement: 8.2,
    sentiment: 'positive',
    sentimentScore: 0.87,
  },
  {
    id: '2',
    platform: 'instagram',
    content: 'Behind the scenes of our latest photoshoot 📸 #BrandLife',
    date: '2024-01-13',
    likes: 4520,
    comments: 389,
    shares: 234,
    reach: 67800,
    engagement: 7.6,
    sentiment: 'positive',
    sentimentScore: 0.92,
  },
  {
    id: '3',
    platform: 'linkedin',
    content: 'We are hiring! Join our team of innovators and creators.',
    date: '2024-01-12',
    likes: 890,
    comments: 156,
    shares: 89,
    reach: 23400,
    engagement: 4.8,
    sentiment: 'positive',
    sentimentScore: 0.78,
  },
  {
    id: '4',
    platform: 'facebook',
    content: 'Customer story: How Jane increased her productivity by 200%',
    date: '2024-01-11',
    likes: 1560,
    comments: 234,
    shares: 178,
    reach: 34500,
    engagement: 5.7,
    sentiment: 'positive',
    sentimentScore: 0.85,
  },
  {
    id: '5',
    platform: 'tiktok',
    content: 'Day in the life at our HQ 🏢 #WorkLife #TechStartup',
    date: '2024-01-10',
    likes: 12400,
    comments: 890,
    shares: 567,
    reach: 156000,
    engagement: 8.9,
    sentiment: 'positive',
    sentimentScore: 0.91,
  },
  {
    id: '6',
    platform: 'twitter',
    content: 'Service maintenance scheduled for tonight. We apologize for any inconvenience.',
    date: '2024-01-09',
    likes: 234,
    comments: 567,
    shares: 45,
    reach: 12300,
    engagement: 6.9,
    sentiment: 'negative',
    sentimentScore: 0.32,
  },
  {
    id: '7',
    platform: 'instagram',
    content: 'Meet our team! The faces behind the innovation 👥',
    date: '2024-01-08',
    likes: 3890,
    comments: 456,
    shares: 189,
    reach: 54200,
    engagement: 8.4,
    sentiment: 'positive',
    sentimentScore: 0.88,
  },
  {
    id: '8',
    platform: 'linkedin',
    content: 'Industry insights: Top 5 trends to watch in 2024',
    date: '2024-01-07',
    likes: 1230,
    comments: 178,
    shares: 234,
    reach: 45600,
    engagement: 3.6,
    sentiment: 'neutral',
    sentimentScore: 0.55,
  },
];

// Audience demographics
export const audienceAgeData: AudienceData[] = [
  { ageGroup: '18-24', percentage: 28, count: 42000 },
  { ageGroup: '25-34', percentage: 35, count: 52500 },
  { ageGroup: '35-44', percentage: 22, count: 33000 },
  { ageGroup: '45-54', percentage: 10, count: 15000 },
  { ageGroup: '55+', percentage: 5, count: 7500 },
];

export const audienceGenderData: GenderData[] = [
  { gender: 'Male', percentage: 52 },
  { gender: 'Female', percentage: 45 },
  { gender: 'Other', percentage: 3 },
];

export const audienceLocationData: LocationData[] = [
  { country: 'United States', percentage: 42, count: 63000 },
  { country: 'United Kingdom', percentage: 18, count: 27000 },
  { country: 'Canada', percentage: 12, count: 18000 },
  { country: 'Australia', percentage: 8, count: 12000 },
  { country: 'Germany', percentage: 6, count: 9000 },
  { country: 'France', percentage: 5, count: 7500 },
  { country: 'Other', percentage: 9, count: 13500 },
];

// Follower growth
export const growthData: GrowthData[] = [
  { date: 'Week 1', followers: 145000, following: 1200 },
  { date: 'Week 2', followers: 146500, following: 1215 },
  { date: 'Week 3', followers: 148200, following: 1230 },
  { date: 'Week 4', followers: 149800, following: 1245 },
  { date: 'Week 5', followers: 152000, following: 1260 },
  { date: 'Week 6', followers: 154500, following: 1280 },
  { date: 'Week 7', followers: 157200, following: 1295 },
  { date: 'Week 8', followers: 160000, following: 1310 },
];

// Sentiment over time
export const sentimentData: SentimentData[] = [
  { date: 'Mon', positive: 65, negative: 15, neutral: 20 },
  { date: 'Tue', positive: 72, negative: 12, neutral: 16 },
  { date: 'Wed', positive: 68, negative: 18, neutral: 14 },
  { date: 'Thu', positive: 75, negative: 10, neutral: 15 },
  { date: 'Fri', positive: 70, negative: 14, neutral: 16 },
  { date: 'Sat', positive: 78, negative: 8, neutral: 14 },
  { date: 'Sun', positive: 82, negative: 6, neutral: 12 },
];

// Topic analysis
export const topicData: TopicData[] = [
  { topic: 'Product Features', mentions: 1250, sentiment: 0.82 },
  { topic: 'Customer Service', mentions: 890, sentiment: 0.45 },
  { topic: 'Brand Values', mentions: 756, sentiment: 0.91 },
  { topic: 'Pricing', mentions: 623, sentiment: 0.38 },
  { topic: 'Innovation', mentions: 578, sentiment: 0.88 },
  { topic: 'Community', mentions: 445, sentiment: 0.95 },
];

// Best times to post
export const bestTimesData: BestTimeData[] = [
  { hour: 9, day: 'Monday', engagement: 6.2 },
  { hour: 12, day: 'Monday', engagement: 7.8 },
  { hour: 18, day: 'Monday', engagement: 8.5 },
  { hour: 9, day: 'Tuesday', engagement: 5.9 },
  { hour: 12, day: 'Tuesday', engagement: 8.2 },
  { hour: 18, day: 'Tuesday', engagement: 9.1 },
  { hour: 9, day: 'Wednesday', engagement: 6.5 },
  { hour: 12, day: 'Wednesday', engagement: 8.8 },
  { hour: 18, day: 'Wednesday', engagement: 9.4 },
  { hour: 9, day: 'Thursday', engagement: 6.1 },
  { hour: 12, day: 'Thursday', engagement: 7.5 },
  { hour: 18, day: 'Thursday', engagement: 8.9 },
  { hour: 9, day: 'Friday', engagement: 5.5 },
  { hour: 12, day: 'Friday', engagement: 7.2 },
  { hour: 18, day: 'Friday', engagement: 7.8 },
  { hour: 10, day: 'Saturday', engagement: 8.5 },
  { hour: 14, day: 'Saturday', engagement: 9.2 },
  { hour: 20, day: 'Saturday', engagement: 8.8 },
  { hour: 10, day: 'Sunday', engagement: 9.0 },
  { hour: 14, day: 'Sunday', engagement: 9.5 },
  { hour: 20, day: 'Sunday', engagement: 8.2 },
];

// Dashboard summary metrics
export const dashboardMetrics = {
  totalFollowers: 160000,
  followersGrowth: 12.5,
  totalEngagement: 89400,
  engagementGrowth: 8.3,
  totalReach: 1250000,
  reachGrowth: 15.7,
  avgSentiment: 0.78,
  sentimentGrowth: 5.2,
  totalPosts: 156,
  postsGrowth: 23,
  avgEngagementRate: 6.8,
  engagementRateGrowth: 1.2,
};

// Smart insights
export const smartInsights = [
  {
    id: '1',
    type: 'success' as const,
    title: 'Engagement Surge Detected',
    description: 'Your video content is performing 45% better than images this week. Consider creating more video content.',
    metric: '+45%',
  },
  {
    id: '2',
    type: 'warning' as const,
    title: 'Optimal Posting Time',
    description: 'Your audience is most active between 6-8 PM. Schedule more posts during this window.',
    metric: '6-8 PM',
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'Trending Topic',
    description: '"Sustainability" mentions increased by 120%. Consider creating content around this topic.',
    metric: '+120%',
  },
  {
    id: '4',
    type: 'success' as const,
    title: 'Sentiment Improvement',
    description: 'Positive sentiment increased by 15% after your customer appreciation campaign.',
    metric: '+15%',
  },
];

// Trend detection
export const trendingTopics = [
  { topic: '#Innovation', growth: 234, sentiment: 'positive' as const },
  { topic: '#TechTrends', growth: 189, sentiment: 'positive' as const },
  { topic: '#Sustainability', growth: 156, sentiment: 'positive' as const },
  { topic: '#WorkFromHome', growth: 123, sentiment: 'neutral' as const },
  { topic: '#CustomerFirst', growth: 98, sentiment: 'positive' as const },
];
