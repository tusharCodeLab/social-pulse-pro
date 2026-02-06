import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import {
  engagementData,
  dashboardMetrics,
  smartInsights,
  sentimentData,
  trendingTopics,
} from '@/lib/demoData';

const COLORS = {
  engagement: 'hsl(173, 80%, 45%)',
  reach: 'hsl(262, 83%, 58%)',
  impressions: 'hsl(38, 92%, 50%)',
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

const pieData = [
  { name: 'Positive', value: 65, color: COLORS.positive },
  { name: 'Neutral', value: 25, color: COLORS.neutral },
  { name: 'Negative', value: 10, color: COLORS.negative },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, <span className="gradient-text">Analyst</span>
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your social media presence today.
          </p>
        </motion.div>

        {/* Demo Mode Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
        >
          <div className="w-2 h-2 rounded-full bg-primary pulse-live" />
          <span className="text-xs font-medium text-primary">Demo Mode Active</span>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <MetricCard
          title="Total Followers"
          value={dashboardMetrics.totalFollowers}
          change={dashboardMetrics.followersGrowth}
          icon={Users}
          delay={0.1}
        />
        <MetricCard
          title="Engagement"
          value={dashboardMetrics.totalEngagement}
          change={dashboardMetrics.engagementGrowth}
          icon={Heart}
          delay={0.15}
        />
        <MetricCard
          title="Total Reach"
          value={`${(dashboardMetrics.totalReach / 1000000).toFixed(2)}M`}
          change={dashboardMetrics.reachGrowth}
          icon={Eye}
          delay={0.2}
        />
        <MetricCard
          title="Avg Sentiment"
          value={`${Math.round(dashboardMetrics.avgSentiment * 100)}%`}
          change={dashboardMetrics.sentimentGrowth}
          icon={Sparkles}
          delay={0.25}
        />
        <MetricCard
          title="Total Posts"
          value={dashboardMetrics.totalPosts}
          change={dashboardMetrics.postsGrowth}
          icon={FileText}
          delay={0.3}
        />
        <MetricCard
          title="Eng. Rate"
          value={`${dashboardMetrics.avgEngagementRate}%`}
          change={dashboardMetrics.engagementRateGrowth}
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
          <div className="h-[300px] flex items-center justify-center">
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
              <span className="text-3xl font-bold text-foreground">65%</span>
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
            className="mb-4 flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">AI-Powered Insights</h2>
          </motion.div>
          <div className="grid gap-4">
            {smartInsights.map((insight, index) => (
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
            {trendingTopics.map((topic, index) => (
              <motion.div
                key={topic.topic}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.65 + index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{topic.topic}</span>
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

      {/* Sentiment Over Time */}
      <div className="mt-8">
        <ChartCard
          title="Sentiment Trend"
          subtitle="Daily sentiment breakdown over the past week"
          delay={0.7}
        >
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData}>
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
                <Bar dataKey="positive" stackId="a" fill={COLORS.positive} radius={[0, 0, 0, 0]} />
                <Bar dataKey="neutral" stackId="a" fill={COLORS.neutral} radius={[0, 0, 0, 0]} />
                <Bar dataKey="negative" stackId="a" fill={COLORS.negative} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
