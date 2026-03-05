import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, TrendingUp, Percent, Eye } from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/PlatformIcons';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { useYouTubeAccount, useYouTubeAudienceMetrics, useYouTubeVideos } from '@/hooks/useYouTubeData';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format, subDays, isAfter } from 'date-fns';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

const emptyState = (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
    <YouTubeIcon className="h-8 w-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">Connect your YouTube channel to see audience data</p>
    <p className="text-xs text-muted-foreground/60">Go to Settings → Connect YouTube</p>
  </div>
);

export default function YouTubeAudience() {
  const { data: account } = useYouTubeAccount();
  const { data: metrics = [] } = useYouTubeAudienceMetrics();
  const { data: videos = [] } = useYouTubeVideos();

  const computed = useMemo(() => {
    const oneWeekAgo = subDays(new Date(), 7);
    const recentMetrics = metrics.filter(m => isAfter(new Date(m.date), oneWeekAgo));
    const newThisWeek = recentMetrics.reduce((sum, m) => sum + (m.new_followers || 0), 0);

    let growthRate = 0;
    if (metrics.length >= 2) {
      const oldest = metrics[0]?.followers_count || 0;
      const newest = metrics[metrics.length - 1]?.followers_count || 0;
      if (oldest > 0) growthRate = ((newest - oldest) / oldest) * 100;
    }

    const totalViews = videos.reduce((sum, v) => sum + (v.impressions || 0), 0);
    const avgViews = videos.length > 0 ? Math.round(totalViews / videos.length) : 0;

    return { newThisWeek, growthRate, avgViews };
  }, [metrics, videos]);

  const chartData = metrics.map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    subscribers: m.followers_count || 0,
  }));

  const growthVelocity = metrics.map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    newFollowers: m.new_followers || 0,
  }));

  // Milestone calculation
  const currentFollowers = account?.followers_count || 0;
  const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];
  const nextMilestone = milestones.find(m => m > currentFollowers) || milestones[milestones.length - 1];
  const milestoneProgress = currentFollowers > 0 ? Math.min((currentFollowers / nextMilestone) * 100, 100) : 0;

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#FF0000]/10"><Users className="h-5 w-5 text-[#FF0000]" /></div>
            <h1 className="text-3xl font-bold text-foreground">Audience Insights</h1>
            <Badge variant="outline" className="text-xs border-[#FF0000]/30 text-[#FF0000] gap-1"><YouTubeIcon className="h-3 w-3" /> YouTube</Badge>
          </div>
          <p className="text-muted-foreground">Track your subscriber growth, demographics, and traffic sources.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <EnhancedMetricCard label="Total Subscribers" value={formatNum(account?.followers_count || 0)} icon={Users} delay={0.1} color="hsl(0,80%,50%)" sparkData={chartData.slice(-7).map(d => d.subscribers)} />
        <EnhancedMetricCard label="New This Week" value={computed.newThisWeek > 0 ? `+${formatNum(computed.newThisWeek)}` : '0'} icon={UserPlus} delay={0.15} color="hsl(142,71%,45%)" change={computed.newThisWeek > 0 ? computed.newThisWeek : undefined} />
        <EnhancedMetricCard label="Growth Rate" value={`${computed.growthRate >= 0 ? '+' : ''}${computed.growthRate.toFixed(1)}%`} icon={Percent} delay={0.2} color="hsl(262,83%,58%)" change={computed.growthRate} />
        <EnhancedMetricCard label="Avg Views/Video" value={formatNum(computed.avgViews)} icon={Eye} delay={0.25} color="hsl(38,92%,50%)" />
      </div>

      {/* Milestone Indicator */}
      {currentFollowers > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="mb-6 rounded-xl border border-[#FF0000]/20 bg-gradient-to-r from-card via-card to-[#FF0000]/5 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">🎯 Next Milestone: {formatNum(nextMilestone)} subscribers</span>
            <span className="text-xs text-muted-foreground">{milestoneProgress.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${milestoneProgress}%` }} transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[#FF0000] to-[#FF0000]/60" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">{formatNum(nextMilestone - currentFollowers)} subscribers to go</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Subscriber Growth" subtitle="Subscriber count snapshots" delay={0.3}>
          <div className="h-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ytSubGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0,80%,50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0,80%,50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="subscribers" stroke="hsl(0,80%,50%)" fill="url(#ytSubGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : emptyState}
          </div>
        </ChartCard>

        <ChartCard title="Growth Velocity" subtitle="Daily new subscribers" delay={0.35}>
          <div className="h-[300px]">
            {growthVelocity.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthVelocity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="newFollowers" fill="hsl(142,71%,45%)" radius={[4, 4, 0, 0]} name="New Subscribers" />
                </BarChart>
              </ResponsiveContainer>
            ) : emptyState}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
