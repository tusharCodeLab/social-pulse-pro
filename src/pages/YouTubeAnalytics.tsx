import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Youtube, Eye, ThumbsUp, MessageCircle, Users, Clock,
  TrendingUp, PlayCircle, BarChart3, Activity, Film,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useYouTubeAccount, useYouTubeVideos, useYouTubeComments } from '@/hooks/useYouTubeData';
import { format } from 'date-fns';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

function MetricTile({ icon: Icon, label, value, color }: {
  icon: any; label: string; value: string; color?: string;
}) {
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

export default function YouTubeAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: account } = useYouTubeAccount();
  const { data: videos = [] } = useYouTubeVideos();
  const { data: comments = [] } = useYouTubeComments();

  const hasData = videos.length > 0;

  const totals = useMemo(() => {
    const totalViews = videos.reduce((s, v) => s + (v.reach || 0), 0);
    const totalLikes = videos.reduce((s, v) => s + (v.likes_count || 0), 0);
    const totalComments = videos.reduce((s, v) => s + (v.comments_count || 0), 0);
    return { totalViews, totalLikes, totalComments };
  }, [videos]);

  const viewsTrend = useMemo(() => {
    return videos
      .filter(v => v.published_at)
      .sort((a, b) => new Date(a.published_at!).getTime() - new Date(b.published_at!).getTime())
      .map(v => ({
        date: format(new Date(v.published_at!), 'MMM d'),
        views: v.reach || 0,
        likes: v.likes_count || 0,
      }));
  }, [videos]);

  const emptyChartMessage = (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
      <Youtube className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Connect your YouTube channel to see analytics</p>
      <p className="text-xs text-muted-foreground/60">Go to Settings → Connect YouTube</p>
    </div>
  );

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF0000]/10"><Youtube className="h-6 w-6 text-[#FF0000]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">YouTube Overview</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {account ? `@${account.account_handle?.replace('@', '')} — ${formatNum(account.followers_count || 0)} subscribers` : 'Channel performance & video insights'}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-[#FF0000]/30 text-[#FF0000]">
          <PlayCircle className="h-3 w-3" /> YouTube
        </Badge>
      </motion.div>

      {/* Top Metrics */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <MetricTile icon={Eye} label="Total Views" value={formatNum(totals.totalViews)} color="bg-[#FF0000]/10" />
        <MetricTile icon={Users} label="Subscribers" value={formatNum(account?.followers_count || 0)} color="bg-chart-impressions/10" />
        <MetricTile icon={ThumbsUp} label="Likes" value={formatNum(totals.totalLikes)} color="bg-primary/10" />
        <MetricTile icon={MessageCircle} label="Comments" value={formatNum(totals.totalComments)} color="bg-chart-sentiment-positive/10" />
        <MetricTile icon={Film} label="Videos" value={String(videos.length)} color="bg-chart-sentiment-neutral/10" />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 bg-muted/50">
          <TabsTrigger value="overview" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" /> Engagement</TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5 text-xs"><PlayCircle className="h-3.5 w-3.5" /> Top Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-1"><Eye className="h-4 w-4 text-[#FF0000]" /><h3 className="text-sm font-semibold text-foreground">Views per Video</h3></div>
              <p className="text-[10px] text-muted-foreground mb-4">Views for each published video</p>
              <div className="h-[220px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="views" stroke="hsl(0,80%,50%)" fill="hsl(0,80%,50%)" fillOpacity={0.15} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : emptyChartMessage}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-1"><ThumbsUp className="h-4 w-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Likes per Video</h3></div>
              <p className="text-[10px] text-muted-foreground mb-4">Like counts across videos</p>
              <div className="h-[220px]">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={viewsTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="likes" fill="hsl(210,80%,55%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : emptyChartMessage}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-chart-reach" /><h3 className="text-sm font-semibold text-foreground">Engagement Rate by Video</h3></div>
            <p className="text-[10px] text-muted-foreground mb-4">(Likes + Comments) / Views × 100</p>
            <div className="h-[280px]">
              {hasData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsTrend.map((v, i) => ({
                    ...v,
                    engRate: videos[i] && (videos[i].reach || 0) > 0
                      ? (((videos[i].likes_count || 0) + (videos[i].comments_count || 0)) / (videos[i].reach || 1) * 100).toFixed(2)
                      : 0,
                  }))}>
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

        <TabsContent value="videos">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-4"><PlayCircle className="h-4 w-4 text-[#FF0000]" /><h3 className="text-sm font-semibold text-foreground">Top Performing Videos</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Video', 'Views', 'Likes', 'Comments', 'Eng. Rate'].map(h => (
                      <th key={h} className={cn('py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider', h === 'Video' ? 'text-left' : 'text-right')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hasData ? (
                    [...videos]
                      .sort((a, b) => (b.reach || 0) - (a.reach || 0))
                      .slice(0, 15)
                      .map(v => (
                        <tr key={v.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 text-sm text-foreground max-w-xs truncate">{v.content || 'Untitled'}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.reach || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.likes_count || 0)}</td>
                          <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.comments_count || 0)}</td>
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
