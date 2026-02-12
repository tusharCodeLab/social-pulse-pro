import { motion } from 'framer-motion';
import {
  Brain, Shield, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Minus,
  MessageCircle, Loader2, Sparkles,
} from 'lucide-react';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSpamComments, useDetectSpam, usePersonalTrends, useDetectTrends } from '@/hooks/useAIFeatures';
import { useAIInsightsApi, useGenerateInsightsApi } from '@/hooks/useSocialApi';

const directionIcon = {
  up: <ArrowUp className="h-3.5 w-3.5 text-chart-sentiment-positive" />,
  down: <ArrowDown className="h-3.5 w-3.5 text-destructive" />,
  stable: <Minus className="h-3.5 w-3.5 text-muted-foreground" />,
};

const trendTypeColors: Record<string, string> = {
  content: 'bg-primary/20 text-primary',
  engagement: 'bg-chart-sentiment-positive/20 text-chart-sentiment-positive',
  audience: 'bg-chart-reach/20 text-chart-reach',
  hashtag: 'bg-chart-impressions/20 text-chart-impressions',
};

export function AIToolsSection() {
  const { toast } = useToast();
  const { data: spamComments } = useSpamComments();
  const detectSpam = useDetectSpam();
  const { data: trends } = usePersonalTrends();
  const detectTrends = useDetectTrends();
  const { data: insights } = useAIInsightsApi();
  const generateInsights = useGenerateInsightsApi();

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    try {
      await action();
      toast({ title: 'Success', description: successMsg });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Action failed.', variant: 'destructive' });
    }
  };

  const displayInsights = insights?.slice(0, 3).map(i => ({
    id: i.id,
    type: i.type === 'alert' ? 'warning' as const : i.type === 'opportunity' || i.type === 'trend' ? 'success' as const : 'info' as const,
    title: i.title,
    description: i.description,
    metric: i.metric,
  })) || [];

  return (
    <section>
      <SectionHeader icon={Brain} title="AI-Powered Tools" subtitle="Gemini-powered analytics & detection" delay={0.95} />

      {/* AI Insights */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AI Insights
          </h3>
          <Button variant="outline" size="sm" onClick={() => handleAction(() => generateInsights.mutateAsync(), 'New insights generated!')} disabled={generateInsights.isPending}>
            {generateInsights.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
            Generate
          </Button>
        </div>
        {displayInsights.length > 0 ? (
          <div className="grid gap-3">
            {displayInsights.map((insight, i) => (
              <InsightCard key={insight.id} type={insight.type} title={insight.title} description={insight.description} metric={insight.metric} delay={1 + i * 0.05} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl border border-border bg-card/50">
            <Sparkles className="h-7 w-7 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Click "Generate" to get AI-powered recommendations.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Spam Filter */}
        <ChartCard
          title="Spam Filter"
          subtitle="Detect bot & promotional comments"
          delay={1.05}
          action={
            <Button size="sm" variant="outline" onClick={() => handleAction(() => detectSpam.mutateAsync(), `Scan complete! ${detectSpam.data?.spamFound || 0} spam found.`)} disabled={detectSpam.isPending}>
              {detectSpam.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Shield className="h-3.5 w-3.5 mr-1.5" />}
              Scan
            </Button>
          }
        >
          {spamComments && spamComments.length > 0 ? (
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
              {spamComments.slice(0, 6).map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 + i * 0.03 }} className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground">{c.author_name || 'Anonymous'}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.content}</p>
                    </div>
                    <Badge variant="destructive" className="text-[9px] shrink-0"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{c.spam_reason}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-7 w-7 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Click "Scan" to detect spam.</p>
            </div>
          )}
        </ChartCard>

        {/* Trends */}
        <ChartCard
          title="Trend Detection"
          subtitle="AI-detected performance patterns"
          delay={1.1}
          action={
            <Button size="sm" variant="outline" onClick={() => handleAction(() => detectTrends.mutateAsync(), 'Trends detected!')} disabled={detectTrends.isPending}>
              {detectTrends.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <TrendingUp className="h-3.5 w-3.5 mr-1.5" />}
              Detect
            </Button>
          }
        >
          {trends && trends.length > 0 ? (
            <div className="space-y-2.5 max-h-[250px] overflow-y-auto">
              {trends.slice(0, 5).map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15 + i * 0.04 }} className="p-2.5 rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      {directionIcon[t.direction as keyof typeof directionIcon] || directionIcon.stable}
                      <span className="text-xs font-medium text-foreground">{t.title}</span>
                    </div>
                    <Badge className={`text-[9px] ${trendTypeColors[t.trend_type] || 'bg-muted text-muted-foreground'}`}>{t.trend_type}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground ml-5 line-clamp-2">{t.description}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-7 w-7 mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Click "Detect" to find patterns.</p>
            </div>
          )}
        </ChartCard>
      </div>
    </section>
  );
}
