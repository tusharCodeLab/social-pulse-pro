import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, ThumbsUp, MessageCircle, Users,
  TrendingUp, BarChart3, Activity, FileText, Image,
} from 'lucide-react';
import { InstagramIcon } from '@/components/icons/PlatformIcons';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { cn } from '@/lib/utils';
import { usePosts } from '@/hooks/usePosts';
import { useSocialAccounts } from '@/hooks/useSocialAccounts';
import { useCommentsApi } from '@/hooks/useSocialApi';
import { format, subDays, isAfter } from 'date-fns';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

const PIE_COLORS = ['hsl(340,82%,52%)', 'hsl(262,83%,58%)', 'hsl(173,80%,45%)'];

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function InstagramOverview() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewsTimeframe, setViewsTimeframe] = useState('all');
  const { data: accounts = [] } = useSocialAccounts();
  const igAccount = accounts.find(a => a.platform === 'instagram');
  const { data: posts = [] } = usePosts('instagram');
  const { data: comments = [] } = useCommentsApi(undefined, 'instagram');

  const hasData = posts.length > 0;

  const totals = useMemo(() => {
    const totalLikes = posts.reduce((s, v) => s + (v.likes_count || 0), 0);
    const totalComments = posts.reduce((s, v) => s + (v.comments_count || 0), 0);
    const totalReach = posts.reduce((s, v) => s + (v.reach || 0), 0);
    const totalImpressions = posts.reduce((s, v) => s + (v.impressions || 0), 0);
    return { totalLikes, totalComments, totalReach, totalImpressions };
  }, [posts]);

  const postsTrend = useMemo(() => {
    return posts
      .filter(v => v.published_at)
      .sort((a, b) => new Date(a.published_at!).getTime() - new Date(b.published_at!).getTime())
      .map(v => ({
        date: format(new Date(v.published_at!), 'MMM d'),
        publishedAt: new Date(v.published_at!),
        likes: v.likes_count || 0,
        comments: v.comments_count || 0,
        reach: v.reach || 0,
        views: v.impressions || 0,
      }));
  }, [posts]);

  const filteredViewsTrend = useMemo(() => {
    if (viewsTimeframe === 'all') return postsTrend;
    const daysMap: Record<string, number> = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 };
    const cutoff = subDays(new Date(), daysMap[viewsTimeframe] || 30);
    return postsTrend.filter(p => isAfter(p.publishedAt, cutoff));
  }, [postsTrend, viewsTimeframe]);

  const engagementPieData = useMemo(() => [
    { name: 'Likes', value: totals.totalLikes },
    { name: 'Comments', value: totals.totalComments },
  ].filter(d => d.value > 0), [totals]);

  const emptyChartMessage = (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
      <InstagramIcon className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Connect your Instagram account to see analytics</p>
      <p className="text-xs text-muted-foreground/60">Go to Settings → Connect Instagram</p>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#E4405F]/10"><InstagramIcon className="h-6 w-6" /></div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Instagram Overview</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {igAccount ? `@${igAccount.account_handle?.replace('@', '')} — ${formatNum(igAccount.followers_count || 0)} followers` : 'Account performance & post insights'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-[#E4405F]/30 text-[#E4405F] self-start sm:self-auto">
          <InstagramIcon className="h-3 w-3" /> Instagram
        </Badge>
      </motion.div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <EnhancedMetricCard label="Followers" value={formatNum(igAccount?.followers_count || 0)} icon={Users} color="hsl(340,82%,52%)" delay={0.05} />
        <EnhancedMetricCard label="Total Likes" value={formatNum(totals.totalLikes)} icon={ThumbsUp} color="hsl(var(--primary))" delay={0.1} sparkData={postsTrend.slice(-7).map(p => p.likes)} />
        <EnhancedMetricCard label="Total Comments" value={formatNum(totals.totalComments)} icon={MessageCircle} color="hsl(262,83%,58%)" delay={0.15} sparkData={postsTrend.slice(-7).map(p => p.comments)} />
        <EnhancedMetricCard label="Total Reach" value={formatNum(totals.totalReach)} icon={Eye} color="hsl(173,80%,45%)" delay={0.2} sparkData={postsTrend.slice(-7).map(p => p.reach)} />
        <EnhancedMetricCard label="Posts" value={String(posts.length)} icon={Image} color="hsl(38,92%,50%)" delay={0.25} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 bg-muted/50">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Engagement</TabsTrigger>
          <TabsTrigger value="posts" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> Top Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Views Chart */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-xl border border-border/60 bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#E4405F]" />
                  <h3 className="text-sm font-semibold text-foreground">Impressions Trend</h3>
                </div>
                <Select value={viewsTimeframe} onValueChange={setViewsTimeframe}>
                  <SelectTrigger className="w-[120px] h-7 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="14d">Last 14 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Impressions per post over time</p>
              <div className="h-[240px]">
                {filteredViewsTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredViewsTrend}>
                      <defs>
                        <linearGradient id="igViewsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(340,82%,52%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(340,82%,52%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="views" stroke="hsl(340,82%,52%)" fill="url(#igViewsGrad)" strokeWidth={2} name="Views" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : emptyChartMessage}
              </div>
            </motion.div>

            {/* Engagement Breakdown Pie */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border/60 bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-1"><Activity className="h-4 w-4 text-[#E4405F]" /><h3 className="text-sm font-semibold text-foreground">Engagement Split</h3></div>
              <p className="text-[10px] text-muted-foreground mb-2">Likes vs Comments distribution</p>
              <div className="h-[200px] flex items-center justify-center relative">
                {engagementPieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={engagementPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                          {engagementPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-bold text-foreground">{formatNum(totals.totalLikes + totals.totalComments)}</span>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                    </div>
                  </>
                ) : emptyChartMessage}
              </div>
              {engagementPieData.length > 0 && (
                <div className="flex justify-center gap-4 mt-2">
                  {engagementPieData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                      <span className="text-[10px] text-muted-foreground">{item.name} ({formatNum(item.value)})</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Likes Chart */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-5 rounded-xl border border-border/60 bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-1"><ThumbsUp className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Likes per Post</h3></div>
            <p className="text-[10px] text-muted-foreground mb-4">Like counts across posts</p>
            <div className="h-[220px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="likes" fill="hsl(340,82%,52%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : emptyChartMessage}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="engagement">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-chart-reach" /><h3 className="text-sm font-semibold text-foreground">Engagement Rate by Post</h3></div>
            <p className="text-[10px] text-muted-foreground mb-4">(Likes + Comments) / Reach × 100</p>
            <div className="h-[280px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postsTrend.map((v, i) => {
                    const post = posts.filter(p => p.published_at).sort((a, b) => new Date(a.published_at!).getTime() - new Date(b.published_at!).getTime())[i];
                    const reach = post?.reach || 0;
                    return { ...v, engRate: reach > 0 ? (((post?.likes_count || 0) + (post?.comments_count || 0)) / reach * 100).toFixed(2) : 0 };
                  })}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" unit="%" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="engRate" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]} name="Eng. Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : emptyChartMessage}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="posts">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/60 bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-4"><Image className="h-4 w-4 text-[#E4405F]" /><h3 className="text-sm font-semibold text-foreground">Top Performing Posts</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Post', 'Likes', 'Comments', 'Reach', 'Eng. Rate'].map(h => (
                      <th key={h} className={cn('py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider', h === 'Post' ? 'text-left' : 'text-right')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hasData ? (
                    [...posts]
                      .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
                      .slice(0, 15)
                      .map(v => (
                        <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-3">
                              {v.media_url && (
                                <img src={v.media_url} alt="" loading="lazy" className="w-10 h-10 rounded-md object-cover border border-border flex-shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                              )}
                              <span className="text-sm text-foreground max-w-xs truncate">{v.content || 'No caption'}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.likes_count || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.comments_count || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.reach || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">
                            {(v.reach || 0) > 0 ? (((v.likes_count || 0) + (v.comments_count || 0)) / (v.reach || 1) * 100).toFixed(2) + '%' : '0%'}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr><td colSpan={5} className="py-12 text-center">{emptyChartMessage}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </>
  );
}
