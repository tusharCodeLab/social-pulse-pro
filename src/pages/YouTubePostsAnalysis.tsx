import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Eye, ThumbsUp, MessageCircle, Film, Clock,
} from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/PlatformIcons';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useYouTubeVideos } from '@/hooks/useYouTubeData';
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import { format } from 'date-fns';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

const PIE_COLORS = ['hsl(0,80%,50%)', 'hsl(210,80%,55%)', 'hsl(262,83%,58%)', 'hsl(38,92%,50%)'];

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

const emptyState = (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
    <YouTubeIcon className="h-8 w-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">Connect your YouTube channel to see video data</p>
    <p className="text-xs text-muted-foreground/60">Go to Settings → Connect YouTube</p>
  </div>
);

export default function YouTubePostsAnalysis() {
  const { data: videos = [] } = useYouTubeVideos();
  const hasData = videos.length > 0;

  const totals = useMemo(() => {
    const totalViews = videos.reduce((s, v) => s + (v.reach || 0), 0);
    const totalLikes = videos.reduce((s, v) => s + (v.likes_count || 0), 0);
    const totalComments = videos.reduce((s, v) => s + (v.comments_count || 0), 0);
    return { totalViews, totalLikes, totalComments };
  }, [videos]);

  const engagementTrend = useMemo(() => {
    return videos
      .filter(v => v.published_at)
      .sort((a, b) => new Date(a.published_at!).getTime() - new Date(b.published_at!).getTime())
      .map(v => ({
        date: format(new Date(v.published_at!), 'MMM d'),
        likes: v.likes_count || 0,
        comments: v.comments_count || 0,
        shares: v.shares_count || 0,
      }));
  }, [videos]);

  const postTypeData = useMemo(() => {
    const types: Record<string, number> = {};
    videos.forEach(v => {
      const type = v.post_type || 'video';
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  }, [videos]);

  const durationData = useMemo(() => {
    return videos
      .filter(v => v.published_at && (v as any).duration_seconds != null)
      .sort((a, b) => new Date(a.published_at!).getTime() - new Date(b.published_at!).getTime())
      .map(v => ({
        date: format(new Date(v.published_at!), 'MMM d'),
        title: (v.content || 'Untitled').slice(0, 30),
        seconds: (v as any).duration_seconds as number,
        label: `${Math.floor(((v as any).duration_seconds as number) / 60)}:${String(((v as any).duration_seconds as number) % 60).padStart(2, '0')}`,
      }));
  }, [videos]);

  const uploadFreq = useMemo(() => {
    const weeks: Record<string, number> = {};
    videos.forEach(v => {
      if (!v.published_at) return;
      const d = new Date(v.published_at);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = format(weekStart, 'MMM d');
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks).map(([week, count]) => ({ week, count })).slice(-12);
  }, [videos]);

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#FF0000]/10"><Film className="h-5 w-5 text-[#FF0000]" /></div>
            <h1 className="text-3xl font-bold text-foreground">Video Analysis</h1>
            <Badge variant="outline" className="text-xs border-[#FF0000]/30 text-[#FF0000] gap-1"><YouTubeIcon className="h-3 w-3" /> YouTube</Badge>
          </div>
          <p className="text-muted-foreground">Track and analyze the performance of your YouTube videos.</p>
        </motion.div>
      </div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <EnhancedMetricCard label="Total Videos" value={String(videos.length)} icon={Film} delay={0.1} color="hsl(0,80%,50%)" />
        <EnhancedMetricCard label="Total Views" value={formatNum(totals.totalViews)} icon={Eye} delay={0.15} color="hsl(38,92%,50%)" sparkData={engagementTrend.slice(-7).map(d => d.likes + d.comments)} />
        <EnhancedMetricCard label="Total Likes" value={formatNum(totals.totalLikes)} icon={ThumbsUp} delay={0.2} color="hsl(var(--primary))" sparkData={engagementTrend.slice(-7).map(d => d.likes)} />
        <EnhancedMetricCard label="Total Comments" value={formatNum(totals.totalComments)} icon={MessageCircle} delay={0.25} color="hsl(262,83%,58%)" sparkData={engagementTrend.slice(-7).map(d => d.comments)} />
      </div>

      {/* Content Type Distribution + Engagement Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <ChartCard title="Video Engagement Trend" subtitle="Likes, comments per video" delay={0.3}>
          <div className="h-[280px]">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="likes" fill="hsl(0,80%,50%)" radius={[4, 4, 0, 0]} name="Likes" />
                  <Bar dataKey="comments" fill="hsl(210,80%,55%)" radius={[4, 4, 0, 0]} name="Comments" />
                </BarChart>
              </ResponsiveContainer>
            ) : emptyState}
          </div>
        </ChartCard>

        <div className="lg:col-span-1">
          <ChartCard title="Content Type Distribution" subtitle="Breakdown by video type" delay={0.35}>
            <div className="h-[280px] flex items-center justify-center relative">
              {postTypeData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={postTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {postTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-foreground">{videos.length}</span>
                    <span className="text-[10px] text-muted-foreground">Videos</span>
                  </div>
                </>
              ) : emptyState}
            </div>
            {postTypeData.length > 0 && (
              <div className="flex justify-center gap-3 mt-2">
                {postTypeData.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-[10px] text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Top Videos Table */}
      <ChartCard title="Top Performing Videos" subtitle="Ranked by view count" delay={0.4}>
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
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-3">
                          {v.media_url ? (
                            <img src={v.media_url} alt="" loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                              className="w-20 h-11 rounded-md object-cover border border-border flex-shrink-0" />
                          ) : null}
                          <div className={`flex items-center justify-center w-20 h-11 rounded-md bg-muted/50 border border-border flex-shrink-0 ${v.media_url ? 'hidden' : ''}`}>
                            <Film className="h-5 w-5 text-muted-foreground/50" />
                          </div>
                          <span className="text-sm text-foreground max-w-xs truncate">{v.content || 'Untitled'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.reach || 0)}</td>
                      <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.likes_count || 0)}</td>
                      <td className="py-2.5 px-3 text-sm text-right text-foreground">{formatNum(v.comments_count || 0)}</td>
                      <td className="py-2.5 px-3 text-sm text-right text-foreground">
                        {(v.reach || 0) > 0 ? (((v.likes_count || 0) + (v.comments_count || 0)) / (v.reach || 1) * 100).toFixed(2) + '%' : '0%'}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr><td colSpan={5} className="py-12 text-center">{emptyState}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Average View Duration */}
      <div className="mt-6">
        <ChartCard title="Video Duration" subtitle="Length of each video (MM:SS)" delay={0.45}>
          <div className="h-[280px]">
            {durationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={durationData}>
                  <defs>
                    <linearGradient id="durationGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(38,92%,50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(38,92%,50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="hsl(215,20%,50%)"
                    tickFormatter={(v: number) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number) => [`${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`, 'Duration']}
                    labelFormatter={(label: string, payload: any[]) => payload?.[0]?.payload?.title || label}
                  />
                  <Area type="monotone" dataKey="seconds" stroke="hsl(38,92%,50%)" fill="url(#durationGrad)" name="Duration" />
                </AreaChart>
              </ResponsiveContainer>
            ) : emptyState}
          </div>
        </ChartCard>
      </div>

      {/* Upload Frequency */}
      <div className="mt-6">
        <ChartCard title="Upload Frequency" subtitle="Videos published per week" delay={0.5}>
          <div className="h-[250px]">
            {uploadFreq.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={uploadFreq}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="hsl(262,83%,58%)" radius={[4, 4, 0, 0]} name="Videos" />
                </BarChart>
              </ResponsiveContainer>
            ) : emptyState}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
