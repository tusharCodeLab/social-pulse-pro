import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Smile, Frown, Meh, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSentimentStatsApi, useSentimentTrendApi, useCommentsApi, useAnalyzeSentimentApi } from '@/hooks/useSocialApi';

const COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

export function SentimentSection() {
  const { toast } = useToast();
  const { data: stats, refetch: refetchStats } = useSentimentStatsApi();
  const { data: trend } = useSentimentTrendApi(14);
  const { data: comments, refetch: refetchComments } = useCommentsApi();
  const analyzeSentiment = useAnalyzeSentimentApi();

  const trendData = trend?.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    positive: t.positive,
    negative: t.negative,
  })) || [];

  const pieData = stats ? [
    { name: 'Positive', value: stats.positive, color: COLORS.positive },
    { name: 'Neutral', value: stats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: stats.negative, color: COLORS.negative },
  ] : [];

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSentiment.mutateAsync();
      await Promise.all([refetchStats(), refetchComments()]);
      toast({
        title: 'Analysis complete!',
        description: result.analyzed > 0 ? `Analyzed ${result.analyzed} comments.` : 'All comments already analyzed.',
      });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to analyze.', variant: 'destructive' });
    }
  };

  return (
    <section>
      <SectionHeader
        icon={Sparkles}
        title="Sentiment Analysis"
        subtitle="AI-powered audience reaction analysis"
        delay={0.75}
        action={
          <Button size="sm" onClick={handleAnalyze} disabled={analyzeSentiment.isPending}>
            {analyzeSentiment.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
            Analyze Comments
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard title="Positive" value={`${Math.round(stats?.positivePercent || 0)}%`} icon={Smile} delay={0.77} />
        <MetricCard title="Neutral" value={`${Math.round(stats?.neutralPercent || 0)}%`} icon={Meh} delay={0.79} />
        <MetricCard title="Negative" value={`${Math.round(stats?.negativePercent || 0)}%`} icon={Frown} delay={0.81} />
        <MetricCard title="Total Comments" value={stats?.total.toString() || '0'} icon={MessageCircle} delay={0.83} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Sentiment Trend" subtitle="Daily positive vs negative" delay={0.85}>
          <div className="h-[240px]">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="clPosSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="clNegSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.negative} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.negative} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="positive" stroke={COLORS.positive} fill="url(#clPosSent)" strokeWidth={2} />
                  <Area type="monotone" dataKey="negative" stroke={COLORS.negative} fill="url(#clNegSent)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No sentiment trend data.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Distribution" subtitle="Overall breakdown" delay={0.87}>
          <div className="h-[240px] flex items-center justify-center relative">
            {stats && stats.total > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-bold text-foreground">{stats.total}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No sentiment data yet.</div>
            )}
          </div>
          {stats && stats.total > 0 && (
            <div className="flex justify-center gap-5 mt-3">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Comments */}
      {comments && comments.length > 0 && (
        <ChartCard title="Recent Comments" subtitle="Latest analyzed feedback" delay={0.9}>
          <div className="space-y-3">
            {comments.slice(0, 5).map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.92 + i * 0.03 }}
                className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground">{comment.authorName}</span>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{comment.content}</p>
                  </div>
                  {comment.sentiment && <SentimentBadge sentiment={comment.sentiment} />}
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>
      )}
    </section>
  );
}
