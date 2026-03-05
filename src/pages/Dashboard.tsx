import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Heart, Eye, Sparkles, RefreshCw,
  TrendingUp, Loader2, Activity, AlertTriangle, Target,
  MessageCircle, BarChart3, Wifi, Clock,
} from 'lucide-react';
import { InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/icons/PlatformIcons';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDashboardSummaryApi, useSentimentStatsApi,
} from '@/hooks/useSocialApi';
import { useAIPerformanceDigest, PerformanceDigest } from '@/hooks/useAIFeatures';
import { usePlatformComparison, useReachTrends, useTopContentByReach, useCrossPlatformInsights } from '@/hooks/useCrossPlatformData';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { EngagementBreakdown } from '@/components/dashboard/EngagementBreakdown';
import { TopPostsTable } from '@/components/dashboard/TopPostsTable';
import { SentimentPanel } from '@/components/dashboard/SentimentPanel';
import { QuickActionsRow } from '@/components/dashboard/QuickActionsRow';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

/* ── Constants ── */
const PLATFORM_CONFIG = {
  instagram: { icon: InstagramIcon, color: '#E4405F', label: 'Instagram', border: 'border-l-[#E4405F]' },
  youtube: { icon: YouTubeIcon, color: '#FF0000', label: 'YouTube', border: 'border-l-[#FF0000]' },
  facebook: { icon: FacebookIcon, color: '#1877F2', label: 'Facebook', border: 'border-l-[#1877F2]' },
};

/* ── Reach Chart Tooltip ── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-medium text-foreground mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground capitalize">{entry.dataKey}</span>
          <span className="font-semibold text-foreground ml-auto">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Platform Card (enhanced) ── */
function PlatformCard({ platform, metrics }: { platform: 'instagram' | 'youtube' | 'facebook'; metrics: any }) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;
  const stats = [
    { label: 'Likes', value: metrics.totalLikes, icon: Heart },
    { label: 'Comments', value: metrics.totalComments, icon: MessageCircle },
    { label: 'Engagement', value: `${metrics.avgEngagementRate}%`, icon: BarChart3 },
    { label: 'Followers', value: metrics.followers, icon: Users },
  ];

  return (
    <div className={cn('rounded-xl border border-border bg-card border-l-4 relative overflow-hidden group', config.border)}
      style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${config.color}08, transparent 60%)` }} />
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
          {metrics.postsCount} posts
        </span>
      </div>
      <div className="p-4 relative z-10">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}15` }}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">{config.label}</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => {
            const SIcon = s.icon;
            const formatted = typeof s.value === 'number'
              ? s.value >= 1000 ? `${(s.value / 1000).toFixed(1)}K` : s.value.toString()
              : s.value;
            return (
              <div key={s.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <SIcon className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground leading-tight">{formatted}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { connectedPlatforms } = useSettingsStore();

  const { data: summary, isLoading } = useDashboardSummaryApi();
  const { data: sentiment } = useSentimentStatsApi();
  const { data: platformMetrics } = usePlatformComparison();
  const { data: reachTrends } = useReachTrends();
  const { data: topPosts } = useTopContentByReach();
  const { data: insights } = useCrossPlatformInsights();
  const aiDigest = useAIPerformanceDigest();
  const [digest, setDigest] = useState<PerformanceDigest | null>(null);
  const [period, setPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('all');

  const handleGenerateDigest = async () => {
    try {
      const result = await aiDigest.mutateAsync();
      if (result.digest) setDigest(result.digest);
      else toast({ title: 'Not enough data', description: result.message || 'Import your data first.' });
    } catch (error) {
      toast({ title: 'Digest Failed', description: error instanceof Error ? error.message : 'Failed to generate.', variant: 'destructive' });
    }
  };

  const platformMap = (platformMetrics || []).reduce((acc, p) => { acc[p.platform] = p; return acc; }, {} as Record<string, any>);
  const avgEngagement = platformMetrics?.length
    ? (platformMetrics.reduce((s, p) => s + p.avgEngagementRate, 0) / platformMetrics.length).toFixed(1)
    : '0';

  // Filter reach trends by period
  const filteredTrends = (() => {
    if (!reachTrends?.length || period === 'all') return reachTrends || [];
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return reachTrends.filter(t => new Date(t.date) >= cutoff);
  })();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <PremiumSkeleton key={i} variant="metric" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PremiumSkeleton variant="chart" className="lg:col-span-2" />
          <PremiumSkeleton variant="chart" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PremiumSkeleton variant="chart" className="lg:col-span-2" />
          <PremiumSkeleton variant="chart" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ─── Section 1: Header ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, <span className="gradient-text">{user?.email?.split('@')[0] || 'Analyst'}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your cross-platform analytics command center</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connected platforms badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border/60 text-[10px]">
            <Wifi className="h-3 w-3 text-chart-sentiment-positive" />
            <span className="text-muted-foreground">{connectedPlatforms.length || 0} connected</span>
          </div>
          {/* Sentiment mini-donut */}
          {sentiment && sentiment.total > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-card border border-border/60">
              <div className="w-8 h-8 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: sentiment.positive, color: 'hsl(142, 71%, 45%)' },
                        { value: sentiment.neutral, color: 'hsl(215, 20%, 55%)' },
                        { value: sentiment.negative, color: 'hsl(0, 72%, 51%)' },
                      ]}
                      cx="50%" cy="50%" innerRadius={10} outerRadius={16} paddingAngle={3} dataKey="value" strokeWidth={0}
                    >
                      {[
                        { color: 'hsl(142, 71%, 45%)' },
                        { color: 'hsl(215, 20%, 55%)' },
                        { color: 'hsl(0, 72%, 51%)' },
                      ].map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-foreground">Sentiment</p>
                <p className="text-[9px] text-chart-sentiment-positive">
                  {Math.round((sentiment.positive / sentiment.total) * 100)}% positive
                </p>
              </div>
            </div>
          )}
          <Button
            variant="outline" size="sm" className="gap-1.5 h-8 text-xs"
            onClick={async () => {
              await queryClient.invalidateQueries();
              toast({ title: 'Data refreshed', description: 'All analytics updated.' });
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* ─── Section 2: Enhanced Metric Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <EnhancedMetricCard
          label="Total Followers" value={summary?.totalFollowers.toLocaleString() || '0'}
          icon={Users} change={2.4} delay={0.02}
          color="hsl(173, 80%, 45%)"
        />
        <EnhancedMetricCard
          label="Total Engagement" value={summary?.totalEngagement.toLocaleString() || '0'}
          icon={Heart} change={5.1} delay={0.04}
          color="hsl(0, 72%, 51%)"
        />
        <EnhancedMetricCard
          label="Total Reach" value={summary?.totalReach >= 1000 ? `${(summary.totalReach / 1000).toFixed(1)}K` : summary?.totalReach?.toString() || '0'}
          icon={Eye} change={-1.2} delay={0.06}
          color="hsl(262, 83%, 58%)"
        />
        <EnhancedMetricCard
          label="Avg Engagement Rate" value={`${avgEngagement}%`}
          icon={BarChart3} change={0.8} delay={0.08}
          color="hsl(38, 92%, 50%)"
        />
      </div>

      {/* ─── Section 3a: Reach Chart + Engagement Breakdown ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Reach chart col-span-2 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl border border-border bg-card p-5"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Combined Reach</h3>
                <p className="text-[10px] text-muted-foreground">Cross-platform reach over time</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {(['7d', '14d', '30d', 'all'] as const).map(p => (
                <button
                  key={p} onClick={() => setPeriod(p)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
                    period === p ? 'bg-primary/15 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  )}
                >
                  {p === 'all' ? 'All' : p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mb-3">
            {(['instagram', 'youtube', 'facebook'] as const).map(p => (
              <div key={p} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLATFORM_CONFIG[p].color }} />
                <span className="text-[10px] text-muted-foreground capitalize">{p}</span>
              </div>
            ))}
          </div>
          <div className="h-[300px]">
            {filteredTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredTrends} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillInsta" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E4405F" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#E4405F" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillYT" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0000" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF0000" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillFB" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1877F2" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1877F2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 15%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="instagram" stroke="#E4405F" fill="url(#fillInsta)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="youtube" stroke="#FF0000" fill="url(#fillYT)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="facebook" stroke="#1877F2" fill="url(#fillFB)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-muted-foreground">No reach data yet. Import posts to see trends.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Engagement Breakdown */}
        <EngagementBreakdown metrics={platformMetrics || []} />
      </div>

      {/* ─── Section 3b: Top Posts + Sentiment ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TopPostsTable posts={topPosts || []} />
        </div>
        <SentimentPanel sentiment={sentiment} />
      </div>

      {/* ─── Section 4: Platform Comparison Strip ─── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2.5 mb-3">
          <h3 className="text-sm font-bold text-foreground">Platform Breakdown</h3>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['instagram', 'youtube', 'facebook'] as const).map(p => (
            <PlatformCard
              key={p} platform={p}
              metrics={platformMap[p] || { totalReach: 0, totalImpressions: 0, postsCount: 0, avgEngagementRate: 0, followers: 0, totalLikes: 0, totalComments: 0 }}
            />
          ))}
        </div>
      </motion.div>

      {/* ─── Section 5: Quick Actions ─── */}
      <div>
        <div className="flex items-center gap-2.5 mb-3">
          <h3 className="text-sm font-bold text-foreground">Quick AI Actions</h3>
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <QuickActionsRow />
      </div>

      {/* ─── Section 6: AI Digest + Activity Feed ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* AI Digest — 3 cols */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="lg:col-span-3 rounded-xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 overflow-hidden"
          style={{ boxShadow: '0 4px 30px -8px hsl(173 80% 45% / 0.12)' }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-chart-reach/20 border border-primary/30">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">AI Performance Digest</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {digest ? digest.headline : 'AI-generated weekly performance summary'}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={handleGenerateDigest} disabled={aiDigest.isPending} className="gap-1.5 h-7 text-xs">
                {aiDigest.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {digest ? 'Refresh' : 'Generate'}
              </Button>
            </div>

            {digest ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{digest.summary}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3.5" />
                        <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(var(--primary))" strokeWidth="3.5"
                          strokeDasharray={`${(digest.healthScore / 100) * 113} 113`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary">{digest.healthScore}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{digest.healthLabel}</p>
                      <p className="text-[9px] text-muted-foreground">Health Score</p>
                    </div>
                  </div>
                  {digest.highlights.slice(0, 3).map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-base">{h.emoji}</span>
                      <p className="text-[11px] text-foreground leading-tight line-clamp-2">{h.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 p-2.5 rounded-lg bg-chart-sentiment-positive/5 border border-chart-sentiment-positive/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="h-3 w-3 text-chart-sentiment-positive" />
                      <span className="text-[10px] font-semibold text-chart-sentiment-positive uppercase">Weekly Goal</span>
                    </div>
                    <p className="text-xs text-foreground">{digest.weeklyGoal}</p>
                  </div>
                  {digest.riskAlert && (
                    <div className="flex-1 p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertTriangle className="h-3 w-3 text-destructive" />
                        <span className="text-[10px] font-semibold text-destructive uppercase">Risk Alert</span>
                      </div>
                      <p className="text-xs text-foreground">{digest.riskAlert}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : aiDigest.isPending ? (
              <div className="flex items-center justify-center gap-2 py-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Generating your performance digest...</span>
              </div>
            ) : (
              <div className="py-6 text-center">
                <Sparkles className="h-6 w-6 text-primary/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click Generate to get your AI-powered performance summary</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Feed — 2 cols */}
        <div className="lg:col-span-2">
          <ActivityFeed insights={insights || []} />
        </div>
      </div>
    </div>
  );
}
