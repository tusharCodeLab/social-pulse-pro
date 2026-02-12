import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  FileText,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { PlatformBadge } from '@/components/dashboard/PlatformBadge';
import { usePostsApi, usePostStatsApi, useEngagementAnalyticsApi } from '@/hooks/useSocialApi';

const COLORS = {
  likes: 'hsl(173, 80%, 45%)',
  comments: 'hsl(262, 83%, 58%)',
  shares: 'hsl(38, 92%, 50%)',
};

export default function PostsAnalysis() {
  const { data: posts, isLoading: loadingPosts } = usePostsApi();
  const { data: stats, isLoading: loadingStats } = usePostStatsApi();
  const { data: engagementTrend, isLoading: loadingTrend } = useEngagementAnalyticsApi(14);

  const isLoading = loadingPosts || loadingStats || loadingTrend;

  const trendData = engagementTrend?.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    likes: e.likes,
    comments: e.comments,
    shares: e.shares,
  })) || [];

  const topPosts = [...(posts || [])].sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Posts Analysis</h1>
          <p className="text-muted-foreground">Track and analyze the performance of your Instagram posts.</p>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Total Posts" value={stats?.totalPosts.toString() || '0'} icon={FileText} delay={0.1} />
            <MetricCard title="Total Likes" value={stats?.totalLikes.toLocaleString() || '0'} icon={Heart} delay={0.15} />
            <MetricCard title="Total Comments" value={stats?.totalComments.toLocaleString() || '0'} icon={MessageCircle} delay={0.2} />
            <MetricCard title="Avg Engagement" value={`${(stats?.avgEngagement || 0).toFixed(1)}%`} icon={TrendingUp} delay={0.25} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Engagement Trend" subtitle="Daily engagement over the last 2 weeks" delay={0.3}>
              <div className="h-[300px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorLikesPost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.likes} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.likes} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                      <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      <Area type="monotone" dataKey="likes" stroke={COLORS.likes} fill="url(#colorLikesPost)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No engagement data yet.</div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Engagement Distribution" subtitle="Breakdown by engagement type" delay={0.35}>
              <div className="h-[300px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                      <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      <Bar dataKey="likes" fill={COLORS.likes} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" fill={COLORS.comments} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="shares" fill={COLORS.shares} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data available.</div>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.likes }} />
                  <span className="text-sm text-muted-foreground">Likes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.comments }} />
                  <span className="text-sm text-muted-foreground">Comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.shares }} />
                  <span className="text-sm text-muted-foreground">Shares</span>
                </div>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Top Performing Posts" subtitle="Ranked by engagement rate" delay={0.4}>
            {topPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Post</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Platform</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Likes</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Comments</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Reach</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Eng. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((post, index) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="text-sm text-foreground line-clamp-2 max-w-[300px]">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(post.publishedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-4"><PlatformBadge platform={post.platform} /></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{post.metrics.likes.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <MessageCircle className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{post.metrics.comments.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              {post.metrics.reach >= 1000 ? `${(post.metrics.reach / 1000).toFixed(1)}K` : post.metrics.reach}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-chart-sentiment-positive">
                            <TrendingUp className="h-3 w-3" />
                            {post.metrics.engagementRate.toFixed(1)}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No posts data. Connect Instagram in Settings to import posts.</div>
            )}
          </ChartCard>
        </>
      )}
    </DashboardLayout>
  );
}
