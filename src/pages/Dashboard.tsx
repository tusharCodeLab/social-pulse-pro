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
  Heart,
  Eye,
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
  useGenerateInsightsApi,
} from '@/hooks/useSocialApi';
import { useQueryClient } from '@tanstack/react-query';

const COLORS = {
  engagement: 'hsl(173, 80%, 45%)',
  reach: 'hsl(262, 83%, 58%)',
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: summary, isLoading: loadingSummary } = useDashboardSummaryApi();
  const { data: posts, isLoading: loadingPosts } = usePostsApi();
  const { data: sentimentStats, isLoading: loadingSentiment } = useSentimentStatsApi();
  const { data: insights, isLoading: loadingInsights } = useAIInsightsApi();
  const generateInsights = useGenerateInsightsApi();

  const isLoading = loadingSummary || loadingPosts || loadingSentiment || loadingInsights;

  const engagementData = posts?.slice(0, 7).map(p => ({
    date: new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    likes: p.metrics.likes,
    comments: p.metrics.comments,
  })) || [];

  const pieData = sentimentStats ? [
    { name: 'Positive', value: sentimentStats.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentimentStats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: sentimentStats.negative, color: COLORS.negative },
  ] : [];

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
      toast({ title: "Insights generated!", description: "New AI insights have been added." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate insights. Please try again.", variant: "destructive" });
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
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
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => {
                queryClient.invalidateQueries();
                toast({ title: "Refreshing data", description: "Fetching latest analytics..." });
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {isLoading ? (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} variants={staggerItem}>
                <PremiumSkeleton variant="metric" />
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PremiumSkeleton variant="chart" />
            <PremiumSkeleton variant="chart" />
          </div>
        </motion.div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <MetricCard title="Followers" value={summary?.totalFollowers.toLocaleString() || '0'} icon={Users} delay={0.1} />
            <MetricCard title="Engagement" value={summary?.totalEngagement.toLocaleString() || '0'} icon={Heart} delay={0.15} />
            <MetricCard
              title="Reach"
              value={summary?.totalReach >= 1000 
                ? `${(summary.totalReach / 1000).toFixed(1)}K`
                : summary?.totalReach?.toString() || '0'}
              icon={Eye} delay={0.2}
            />
            <MetricCard title="Posts" value={summary?.totalPosts.toString() || '0'} icon={FileText} delay={0.25} />
            <MetricCard title="Sentiment" value={`${Math.round(summary?.positiveSentimentPercent || 0)}% positive`} icon={Sparkles} delay={0.3} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Engagement Overview" subtitle="Likes & comments per post" delay={0.35}>
              <div className="h-[300px]">
                {engagementData.length > 0 ? (
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
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      <Area type="monotone" dataKey="likes" stroke={COLORS.engagement} fill="url(#colorLikes)" strokeWidth={2} />
                      <Area type="monotone" dataKey="comments" stroke={COLORS.reach} fill="url(#colorComments)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No post data yet. Connect Instagram in Settings to import posts.
                  </div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Sentiment Distribution" subtitle="Comment sentiment breakdown" delay={0.4}>
              <div className="h-[300px] flex items-center justify-center relative">
                {sentimentStats && sentimentStats.total > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">{sentimentStats.total}</span>
                      <span className="text-sm text-muted-foreground">Comments</span>
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground text-center">
                    No sentiment data yet. Analyze comments in AI Tools.
                  </div>
                )}
              </div>
              {sentimentStats && sentimentStats.total > 0 && (
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          {/* AI Insights */}
          <div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">AI-Powered Insights</h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleGenerateInsights} disabled={generateInsights.isPending}>
                {generateInsights.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Generate Insights
              </Button>
            </motion.div>
            {displayInsights.length > 0 ? (
              <div className="grid gap-4">
                {displayInsights.map((insight, index) => (
                  <InsightCard key={insight.id} type={insight.type} title={insight.title} description={insight.description} metric={insight.metric} delay={0.5 + index * 0.1} />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-border bg-card/50">
                <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No insights yet. Click "Generate Insights" to get AI-powered recommendations.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
}
