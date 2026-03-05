import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Activity, Lightbulb, BarChart3,
  ArrowUp, ArrowDown, Minus, Loader2, Target,
} from 'lucide-react';
import { YouTubeIcon } from '@/components/icons/PlatformIcons';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePersonalTrends, useDetectTrends } from '@/hooks/useAIFeatures';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const directionIcon = {
  up: <ArrowUp className="h-4 w-4 text-chart-sentiment-positive" />,
  down: <ArrowDown className="h-4 w-4 text-destructive" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
};

export default function YouTubeTrends() {
  const { data: trends = [] } = usePersonalTrends('youtube');
  const detectTrends = useDetectTrends();
  const { toast } = useToast();

  const handleDetect = async () => {
    try {
      const result = await detectTrends.mutateAsync('youtube');
      const count = result?.trends?.length || 0;
      toast({ title: 'Trends analyzed', description: count > 0 ? `Detected ${count} trend${count !== 1 ? 's' : ''} in your YouTube data.` : 'No significant trends found yet.' });
    } catch {
      toast({ title: 'Analysis failed', description: 'Could not detect trends. Try again later.', variant: 'destructive' });
    }
  };

  const improving = trends.filter(t => t.direction === 'up').length;
  const declining = trends.filter(t => t.direction === 'down').length;
  const avgConfidence = trends.length > 0 ? Math.round(trends.reduce((s, t) => s + (Number(t.confidence_score) || 0), 0) / trends.length * 100) : 0;

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#FF0000]/10"><Activity className="h-5 w-5 text-[#FF0000]" /></div>
            <h1 className="text-3xl font-bold text-foreground">Trend Intelligence</h1>
            <Badge variant="outline" className="text-xs border-[#FF0000]/30 text-[#FF0000] gap-1"><YouTubeIcon className="h-3 w-3" /> YouTube</Badge>
          </div>
          <p className="text-muted-foreground">AI-detected patterns in your YouTube channel performance.</p>
        </motion.div>
      </div>

      {/* Summary Metrics */}
      {trends.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <EnhancedMetricCard label="Total Trends" value={String(trends.length)} icon={BarChart3} color="hsl(0,80%,50%)" delay={0.05} />
          <EnhancedMetricCard label="Improving" value={String(improving)} icon={TrendingUp} color="hsl(142,71%,45%)" delay={0.1} />
          <EnhancedMetricCard label="Declining" value={String(declining)} icon={TrendingDown} color="hsl(0,72%,51%)" delay={0.15} />
          <EnhancedMetricCard label="Avg Confidence" value={`${avgConfidence}%`} icon={Target} color="hsl(38,92%,50%)" delay={0.2} />
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button size="sm" variant="outline" onClick={handleDetect} disabled={detectTrends.isPending} className="gap-1.5 text-xs">
          {detectTrends.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lightbulb className="h-3.5 w-3.5" />}
          Detect Trends
        </Button>
      </div>

      {trends.length > 0 ? (
        <div className="space-y-4">
          {trends.map(trend => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border/60 bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {directionIcon[trend.direction as keyof typeof directionIcon] || directionIcon.stable}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{trend.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{trend.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{trend.trend_type}</Badge>
                  {trend.confidence_score != null && (
                    <span className="text-[10px] text-muted-foreground">{Math.round(Number(trend.confidence_score) * 100)}% confidence</span>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Detected {format(new Date(trend.detected_at), 'MMM d, yyyy')}
              </p>
            </motion.div>
          ))}
        </div>
      ) : (
        <ChartCard title="No Trends Detected" subtitle="Run the AI analysis to discover patterns" delay={0.1}>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground mb-2">No performance trends yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Connect your YouTube channel and click "Detect Trends" to let AI identify patterns.
            </p>
          </div>
        </ChartCard>
      )}

      {/* AI Content Strategy */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-xl border border-chart-impressions/20 bg-gradient-to-r from-card via-card to-chart-impressions/5 overflow-hidden"
        style={{ boxShadow: '0 4px 30px -8px hsl(38 92% 50% / 0.12)' }}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-impressions/20 to-primary/20 border border-chart-impressions/30">
              <Lightbulb className="h-5 w-5 text-chart-impressions" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">AI Content Strategy</h3>
              <p className="text-xs text-muted-foreground">Data-driven content ideas based on your YouTube trends</p>
            </div>
          </div>
          {trends.length > 0 ? (
            <div className="text-sm text-muted-foreground space-y-2">
              {trends.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/30">
                  {directionIcon[t.direction as keyof typeof directionIcon] || directionIcon.stable}
                  <span className="text-xs text-foreground">{t.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Connect YouTube and detect trends to generate AI-powered content strategies.</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
