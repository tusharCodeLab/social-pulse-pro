import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Eye,
  Heart,
  FileText,
  Zap,
  Sparkles,
  Loader2,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  useDashboardSummaryApi,
  usePostsApi,
  useSentimentStatsApi,
  useAIInsightsApi,
  useTrendingTopicsApi,
  useGenerateInsightsApi,
} from '@/hooks/useSocialApi';

const COLORS = {
  engagement: 'hsl(173, 80%, 45%)',
  reach: 'hsl(262, 83%, 58%)',
  impressions: 'hsl(38, 92%, 50%)',
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // API hooks
  const { data: summary, isLoading: loadingSummary } = useDashboardSummaryApi();
  const { data: posts, isLoading: loadingPosts } = usePostsApi();
  const { data: sentimentStats, isLoading: loadingSentiment } = useSentimentStatsApi();
  const { data: insights, isLoading: loadingInsights } = useAIInsightsApi();
  const { data: trendingTopics } = useTrendingTopicsApi();
  const generateInsights = useGenerateInsightsApi();

  const isLoading = loadingSummary || loadingPosts || loadingSentiment || loadingInsights;

  // Transform posts to engagement chart data
  const engagementData = posts?.slice(0, 7).map(p => ({
    date: new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    likes: p.metrics.likes,
    comments: p.metrics.comments,
    shares: p.metrics.shares,
  })) || [];

  // Sentiment pie data
  const pieData = sentimentStats ? [
    { name: 'Positive', value: sentimentStats.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentimentStats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: sentimentStats.negative, color: COLORS.negative },
  ] : [];

  // Map insights to display format
  const displayInsights = insights?.slice(0, 3).map(i => ({
    id: i.id,
    type: i.type === 'alert' ? 'warning' as const 
      : i.type === 'opportunity' || i.type === 'trend' ? 'success' as const 
      : 'info' as const,
    title: i.title,
    description: i.description,
    metric: i.metric,
  })) || [];

  const handleGenerateInsights = async () => {
    try {
      await generateInsights.mutateAsync();
      toast({
        title: "Insights generated!",
        description: "New AI insights have been added to your dashboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome back, <span className="gradient-text">{user?.email?.split('@')[0] || 'Analyst'}</span>
            </motion.h1>
            <motion.p 
              className="text-muted-foreground flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Calendar className="h-4 w-4" />
              {currentDate}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
        </motion.div>

        {/* Live Data Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-chart-reach/10 border border-primary/20 backdrop-blur-sm"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-chart-sentiment-positive"
          />
          <span className="text-xs font-medium text-primary">
            Live Analytics
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            Auto-refreshing
          </span>
        </motion.div>
      </div>

      {isLoading ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Skeleton metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} variants={staggerItem}>
                <PremiumSkeleton variant="metric" />
              </motion.div>
            ))}
          </div>
          {/* Skeleton charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PremiumSkeleton variant="chart" />
            <PremiumSkeleton variant="chart" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            <MetricCard
              title="Total Followers"
              value={summary?.totalFollowers.toLocaleString() || '0'}
              change={12.5}
              icon={Users}
              delay={0.1}
            />
            <MetricCard
              title="Engagement"
              value={summary?.totalEngagement.toLocaleString() || '0'}
              change={8.3}
              icon={Heart}
              delay={0.15}
            />
            <MetricCard
              title="Total Reach"
              value={summary?.totalReach >= 1000000 
                ? `${(summary.totalReach / 1000000).toFixed(2)}M` 
                : summary?.totalReach >= 1000 
                  ? `${(summary.totalReach / 1000).toFixed(1)}K`
                  : summary?.totalReach?.toString() || '0'}
              change={15.7}
              icon={Eye}
              delay={0.2}
            />
            <MetricCard
              title="Avg Sentiment"
              value={`${Math.round((summary?.positiveSentimentPercent || 0))}%`}
              change={5.2}
              icon={Sparkles}
              delay={0.25}
            />
            <MetricCard
              title="Total Posts"
              value={summary?.totalPosts.toString() || '0'}
              change={23}
              icon={FileText}
              delay={0.3}
            />
            <MetricCard
              title="Eng. Rate"
              value={`${(summary?.avgEngagementRate || 0).toFixed(1)}%`}
              change={1.2}
              icon={Zap}
              delay={0.35}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Engagement Chart */}
            <ChartCard
              title="Engagement Overview"
              subtitle="Likes, comments, shares over time"
              delay={0.4}
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.engagement} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.engagement} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.reach} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.reach} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 15%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="likes"
                      stroke={COLORS.engagement}
                      fill="url(#colorLikes)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="comments"
                      stroke={COLORS.reach}
                      fill="url(#colorComments)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Sentiment Distribution */}
            <ChartCard
              title="Sentiment Distribution"
              subtitle="Overall sentiment breakdown"
              delay={0.45}
            >
              <div className="h-[300px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 15%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground">
                    {Math.round(sentimentStats?.positivePercent || 0)}%
                  </span>
                  <span className="text-sm text-muted-foreground">Positive</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* AI Insights & Trends Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Smart Insights */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground">AI-Powered Insights</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateInsights}
                  disabled={generateInsights.isPending}
                >
                  {generateInsights.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Generate Insights
                </Button>
              </motion.div>
              <div className="grid gap-4">
                {displayInsights.map((insight, index) => (
                  <InsightCard
                    key={insight.id}
                    type={insight.type}
                    title={insight.title}
                    description={insight.description}
                    metric={insight.metric}
                    delay={0.55 + index * 0.1}
                  />
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <ChartCard
              title="Trending Topics"
              subtitle="Top hashtags this week"
              delay={0.6}
            >
              <div className="space-y-3">
                {trendingTopics?.slice(0, 5).map((topic, index) => (
                  <motion.div
                    key={topic.topic}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground">{topic.hashtag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-chart-sentiment-positive" />
                      <span className="text-sm font-medium text-chart-sentiment-positive">
                        +{topic.growth}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ChartCard>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
