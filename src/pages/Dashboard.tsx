import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Heart, Eye, FileText, Sparkles, RefreshCw,
  TrendingUp, MessageCircle, Shield, Brain, Clock, Smile,
  ArrowUp, ArrowDown, Minus, Loader2, Activity, AlertTriangle, Target,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PremiumSkeleton } from '@/components/ui/premium-skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  useDashboardSummaryApi, usePostStatsApi, useAudienceSummaryApi,
  useSentimentStatsApi, useAIInsightsApi, useBestPostingTimesApi,
} from '@/hooks/useSocialApi';
import { useSpamComments, usePersonalTrends, useAIPerformanceDigest, PerformanceDigest } from '@/hooks/useAIFeatures';
import { cn } from '@/lib/utils';

const COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function MiniStat({ label, value, icon: Icon, className }: { label: string; value: string; icon: any; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2.5 p-3 rounded-lg bg-muted/30 border border-border/50', className)}>
      <div className="p-1.5 rounded-md bg-primary/10">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold text-foreground leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: summary, isLoading } = useDashboardSummaryApi();
  const { data: postStats } = usePostStatsApi();
  const { data: audience } = useAudienceSummaryApi();
  const { data: sentiment } = useSentimentStatsApi();
  const { data: insights } = useAIInsightsApi();
  const { data: bestTimes } = useBestPostingTimesApi();
  const { data: spamComments } = useSpamComments();
  const { data: trends } = usePersonalTrends();
  const aiDigest = useAIPerformanceDigest();
  const [digest, setDigest] = useState<PerformanceDigest | null>(null);

  const handleGenerateDigest = async () => {
    try {
      const result = await aiDigest.mutateAsync();
      if (result.digest) {
        setDigest(result.digest);
      } else {
        toast({ title: 'Not enough data', description: result.message || 'Import your Instagram data first.' });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate digest.';
      toast({ title: 'Digest Failed', description: msg, variant: 'destructive' });
    }
  };


  const pieData = sentiment ? [
    { name: 'Positive', value: sentiment.positive, color: COLORS.positive },
    { name: 'Neutral', value: sentiment.neutral, color: COLORS.neutral },
    { name: 'Negative', value: sentiment.negative, color: COLORS.negative },
  ] : [];

  const directionIcon = {
    up: <ArrowUp className="h-3 w-3 text-chart-sentiment-positive" />,
    down: <ArrowDown className="h-3 w-3 text-destructive" />,
    stable: <Minus className="h-3 w-3 text-muted-foreground" />,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
          {[...Array(5)].map((_, i) => <PremiumSkeleton key={i} variant="metric" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <PremiumSkeleton variant="chart" />
          <PremiumSkeleton variant="chart" />
          <PremiumSkeleton variant="chart" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Compact Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, <span className="gradient-text">{user?.email?.split('@')[0] || 'Analyst'}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your Instagram analytics at a glance</p>
        </div>
        <Button
          variant="outline" size="sm" className="gap-1.5 h-8 text-xs"
          onClick={async () => { 
            await queryClient.invalidateQueries(); 
            toast({ title: 'Data refreshed', description: 'All analytics have been updated.' }); 
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Top Metrics Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-5"
      >
        <MiniStat label="Followers" value={summary?.totalFollowers.toLocaleString() || '0'} icon={Users} />
        <MiniStat label="Engagement" value={summary?.totalEngagement.toLocaleString() || '0'} icon={Heart} />
        <MiniStat label="Reach" value={summary?.totalReach >= 1000 ? `${(summary.totalReach / 1000).toFixed(1)}K` : summary?.totalReach?.toString() || '0'} icon={Eye} />
        <MiniStat label="Posts" value={summary?.totalPosts.toString() || '0'} icon={FileText} />
        <MiniStat label="Positive" value={`${Math.round(summary?.positiveSentimentPercent || 0)}%`} icon={Smile} />
      </motion.div>


      {/* AI Performance Digest */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-5 rounded-xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 overflow-hidden"
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
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Generating your performance digest...</span>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Main Grid — 3 columns on desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Column 1: Posts + Audience */}
        <div className="space-y-4">
          {/* Posts Summary */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Posts</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-md bg-muted/30 text-center">
                <p className="text-base font-bold text-foreground">{postStats?.totalLikes.toLocaleString() || '0'}</p>
                <p className="text-[10px] text-muted-foreground">Likes</p>
              </div>
              <div className="p-2 rounded-md bg-muted/30 text-center">
                <p className="text-base font-bold text-foreground">{postStats?.totalComments.toLocaleString() || '0'}</p>
                <p className="text-[10px] text-muted-foreground">Comments</p>
              </div>
              <div className="p-2 rounded-md bg-muted/30 text-center col-span-2">
                <p className="text-base font-bold text-foreground">{(postStats?.avgEngagement || 0).toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">Avg Engagement Rate</p>
              </div>
            </div>
          </div>

          {/* Audience Summary */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Audience</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                <span className="text-xs text-muted-foreground">Total Followers</span>
                <span className="text-sm font-bold text-foreground">{audience?.totalFollowers.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                <span className="text-xs text-muted-foreground">New This Week</span>
                <span className="text-sm font-bold text-chart-sentiment-positive">+{audience?.newFollowersWeek.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-md bg-muted/30">
                <span className="text-xs text-muted-foreground">Following</span>
                <span className="text-sm font-bold text-foreground">{audience?.totalFollowing.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Sentiment + Best Times */}
        <div className="space-y-4">
          {/* Sentiment */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Sentiment</h3>
            </div>
            {sentiment && sentiment.total > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 relative flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} paddingAngle={3} dataKey="value">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-foreground">{sentiment.total}</span>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[11px] text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No sentiment data yet.</p>
            )}
          </div>

          {/* Best Posting Times */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Best Times</h3>
            </div>
            {bestTimes && bestTimes.length > 0 ? (
              <div className="space-y-1.5">
                {bestTimes.slice(0, 3).map((time, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-md bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">#{i + 1}</span>
                      <span className="text-xs text-foreground">{DAYS[time.dayOfWeek]} {time.hourOfDay.toString().padStart(2, '0')}:00</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{time.engagementScore.toFixed(0)} avg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">Run AI analysis to see best times.</p>
            )}
          </div>
        </div>

        {/* Column 3: AI Insights + Spam + Trends */}
        <div className="space-y-4">
          {/* AI Insights */}
          <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
              {insights && insights.length > 0 && (
                <Badge variant="secondary" className="text-[9px] ml-auto">{insights.length}</Badge>
              )}
            </div>
            {insights && insights.length > 0 ? (
              <div className="space-y-2">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-2 rounded-md bg-muted/30">
                    <p className="text-xs font-medium text-foreground line-clamp-1">{insight.title}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{insight.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No insights yet.</p>
            )}
          </div>

          {/* Spam + Trends combined */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <Shield className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-foreground">Spam</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{spamComments?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">detected</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-chart-reach" />
                <span className="text-xs font-semibold text-foreground">Trends</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{trends?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">patterns</p>
            </div>
          </div>

          {/* Latest Trends */}
          {trends && trends.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Latest Trends</h3>
              </div>
              <div className="space-y-1.5">
                {trends.slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                    {directionIcon[t.direction as keyof typeof directionIcon] || directionIcon.stable}
                    <span className="text-xs text-foreground line-clamp-1 flex-1">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
