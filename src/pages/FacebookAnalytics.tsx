import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, ThumbsUp, MessageCircle, Users, Share2,
  TrendingUp, BarChart3, Activity, FileText, Facebook,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFacebookAccount, useFacebookPosts, useFacebookComments } from '@/hooks/useFacebookData';
import { format } from 'date-fns';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

function MetricTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1.5 rounded-lg', color || 'bg-primary/10')}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// Facebook brand icon component
function FacebookIcon({ className }: { className?: string }) {
  return <Facebook className={className} />;
}

export default function FacebookAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: account } = useFacebookAccount();
  const { data: posts = [] } = useFacebookPosts();
  const { data: comments = [] } = useFacebookComments();

  const hasData = posts.length > 0;

  const totals = useMemo(() => {
    const totalLikes = posts.reduce((s, v) => s + (v.likes_count || 0), 0);
    const totalComments = posts.reduce((s, v) => s + (v.comments_count || 0), 0);
    const totalShares = posts.reduce((s, v) => s + (v.shares_count || 0), 0);
    const totalReach = posts.reduce((s, v) => s + (v.reach || 0), 0);
    return { totalLikes, totalComments, totalShares, totalReach };
  }, [posts]);

  const postsTrend = useMemo(() => {
    return posts
      .filter(v => v.published_at)
      .sort((a, b) => new Date(a.published_at!).getTime() - new Date(b.published_at!).getTime())
      .map(v => ({
        date: format(new Date(v.published_at!), 'MMM d'),
        likes: v.likes_count || 0,
        comments: v.comments_count || 0,
        shares: v.shares_count || 0,
      }));
  }, [posts]);

  const emptyChartMessage = (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
      <FacebookIcon className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Connect your Facebook Page to see analytics</p>
      <p className="text-xs text-muted-foreground/60">Go to Settings → Connect Facebook</p>
    </div>
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1877F2]/10"><FacebookIcon className="h-6 w-6 text-[#1877F2]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Facebook Page Overview</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {account ? `${account.account_name} — ${formatNum(account.followers_count || 0)} followers` : 'Page performance & post insights'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-[#1877F2]/30 text-[#1877F2]">
          <FacebookIcon className="h-3 w-3" /> Facebook
        </Badge>
      </motion.div>

      {/* Top Metrics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricTile icon={Users} label="Page Followers" value={formatNum(account?.followers_count || 0)} color="bg-[#1877F2]/10" />
        <MetricTile icon={ThumbsUp} label="Total Likes" value={formatNum(totals.totalLikes)} color="bg-primary/10" />
        <MetricTile icon={MessageCircle} label="Total Comments" value={formatNum(totals.totalComments)} color="bg-chart-sentiment-positive/10" />
        <MetricTile icon={Share2} label="Total Shares" value={formatNum(totals.totalShares)} color="bg-chart-reach/10" />
        <MetricTile icon={FileText} label="Posts" value={String(posts.length)} color="bg-chart-impressions/10" />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 bg-muted/50">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Engagement</TabsTrigger>
          <TabsTrigger value="posts" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" /> Top Posts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-1"><ThumbsUp className="h-4 w-4 text-[#1877F2]" /><h3 className="text-sm font-semibold text-foreground">Likes per Post</h3></div>
              <p className="text-[10px] text-muted-foreground mb-4">Like counts across posts</p>
              <div className="h-[220px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={postsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="likes" stroke="hsl(214,89%,52%)" fill="hsl(214,89%,52%)" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : emptyChartMessage}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-1"><Share2 className="h-4 w-4 text-chart-reach" /><h3 className="text-sm font-semibold text-foreground">Shares per Post</h3></div>
              <p className="text-[10px] text-muted-foreground mb-4">Share counts across posts</p>
              <div className="h-[220px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={postsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="shares" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : emptyChartMessage}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-chart-reach" /><h3 className="text-sm font-semibold text-foreground">Engagement by Post</h3></div>
            <p className="text-[10px] text-muted-foreground mb-4">Likes + Comments + Shares per post</p>
            <div className="h-[280px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={postsTrend.map(v => ({ ...v, engagement: v.likes + v.comments + v.shares }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="engagement" fill="hsl(214,89%,52%)" radius={[4, 4, 0, 0]} name="Engagement" />
                  </BarChart>
                </ResponsiveContainer>
              ) : emptyChartMessage}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="posts">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-4"><FileText className="h-4 w-4 text-[#1877F2]" /><h3 className="text-sm font-semibold text-foreground">Top Performing Posts</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Post', 'Likes', 'Comments', 'Shares', 'Date'].map(h => (
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
                          <td className="py-2.5 px-3 text-sm text-foreground max-w-xs truncate">{v.content || 'No text'}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.likes_count || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.comments_count || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.shares_count || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-muted-foreground">{v.published_at ? format(new Date(v.published_at), 'MMM d, yyyy') : '—'}</td>
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
    </DashboardLayout>
  );
}
