import { motion } from 'framer-motion';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FileText, Heart, MessageCircle, TrendingUp, Eye } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { PlatformBadge } from '@/components/dashboard/PlatformBadge';
import { usePostsApi, usePostStatsApi, useEngagementAnalyticsApi } from '@/hooks/useSocialApi';

const COLORS = {
  likes: 'hsl(173, 80%, 45%)',
  comments: 'hsl(262, 83%, 58%)',
  shares: 'hsl(38, 92%, 50%)',
};

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

export function PostsSection() {
  const { data: posts } = usePostsApi();
  const { data: stats } = usePostStatsApi();
  const { data: engagementTrend } = useEngagementAnalyticsApi(14);

  const trendData = engagementTrend?.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    likes: e.likes,
    comments: e.comments,
    shares: e.shares,
  })) || [];

  const topPosts = [...(posts || [])].sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate).slice(0, 5);

  return (
    <section>
      <SectionHeader icon={FileText} title="Posts Analysis" subtitle="Track post performance & engagement" delay={0.3} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard title="Total Posts" value={stats?.totalPosts.toString() || '0'} icon={FileText} delay={0.35} />
        <MetricCard title="Total Likes" value={stats?.totalLikes.toLocaleString() || '0'} icon={Heart} delay={0.37} />
        <MetricCard title="Total Comments" value={stats?.totalComments.toLocaleString() || '0'} icon={MessageCircle} delay={0.39} />
        <MetricCard title="Avg Engagement" value={`${(stats?.avgEngagement || 0).toFixed(1)}%`} icon={TrendingUp} delay={0.41} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Engagement Trend" subtitle="Daily likes over 2 weeks" delay={0.43}>
          <div className="h-[240px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="clLikesP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.likes} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.likes} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="likes" stroke={COLORS.likes} fill="url(#clLikesP)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No engagement data yet.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Engagement Breakdown" subtitle="Likes, comments & shares" delay={0.45}>
          <div className="h-[240px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData.slice(-7)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="likes" fill={COLORS.likes} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" fill={COLORS.comments} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" fill={COLORS.shares} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No data available.</div>
            )}
          </div>
          <div className="flex justify-center gap-5 mt-3">
            {[{ label: 'Likes', color: COLORS.likes }, { label: 'Comments', color: COLORS.comments }, { label: 'Shares', color: COLORS.shares }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Posts Table */}
      {topPosts.length > 0 && (
        <ChartCard title="Top Performing Posts" subtitle="Ranked by engagement rate" delay={0.5}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Post', 'Platform', 'Likes', 'Comments', 'Reach', 'Eng. Rate'].map(h => (
                    <th key={h} className={`py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ${h === 'Post' || h === 'Platform' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topPosts.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 + i * 0.04 }}
                    className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <p className="text-xs text-foreground line-clamp-1 max-w-[200px]">{post.content}</p>
                    </td>
                    <td className="py-2.5 px-3"><PlatformBadge platform={post.platform} /></td>
                    <td className="py-2.5 px-3 text-right text-xs text-foreground">{post.metrics.likes.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-xs text-foreground">{post.metrics.comments.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-xs text-foreground">
                      {post.metrics.reach >= 1000 ? `${(post.metrics.reach / 1000).toFixed(1)}K` : post.metrics.reach}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="text-xs font-semibold text-chart-sentiment-positive">{post.metrics.engagementRate.toFixed(1)}%</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </section>
  );
}
