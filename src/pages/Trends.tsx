import { motion } from 'framer-motion';
import {
  TrendingUp, Loader2, ArrowUp, ArrowDown, Minus, Activity, BarChart3,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePersonalTrends, useDetectTrends } from '@/hooks/useAIFeatures';

const directionIcon = {
  up: <ArrowUp className="h-4 w-4 text-chart-sentiment-positive" />,
  down: <ArrowDown className="h-4 w-4 text-destructive" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
};

const directionLabel: Record<string, string> = {
  up: 'Improving',
  down: 'Declining',
  stable: 'Steady',
};

const trendTypeColors: Record<string, string> = {
  content: 'bg-primary/20 text-primary',
  engagement: 'bg-chart-sentiment-positive/20 text-chart-sentiment-positive',
  audience: 'bg-chart-reach/20 text-chart-reach',
  hashtag: 'bg-chart-impressions/20 text-chart-impressions',
};

const trendTypeLabels: Record<string, string> = {
  content: 'Content',
  engagement: 'Engagement',
  audience: 'Audience',
  hashtag: 'Hashtags',
};

function formatConfidence(score: number): { label: string; className: string } {
  const pct = Math.round(score * 100);
  if (pct >= 90) return { label: `${pct}% · Very High`, className: 'text-chart-sentiment-positive' };
  if (pct >= 75) return { label: `${pct}% · High`, className: 'text-primary' };
  if (pct >= 50) return { label: `${pct}% · Moderate`, className: 'text-chart-impressions' };
  return { label: `${pct}% · Low`, className: 'text-muted-foreground' };
}

export default function Trends() {
  const { toast } = useToast();
  const { data: trends, isLoading: loadingTrends, error: trendsError } = usePersonalTrends();
  const detectTrends = useDetectTrends();

  const handleDetectTrends = async () => {
    try {
      const result = await detectTrends.mutateAsync();
      const count = result?.trends?.length || 0;
      toast({ 
        title: 'Analysis complete', 
        description: count > 0 
          ? `Detected ${count} trend${count !== 1 ? 's' : ''} in your performance data.`
          : 'No significant trends found. Try again after more data accumulates.',
      });
    } catch (error) {
      toast({ title: 'Detection failed', description: error instanceof Error ? error.message : 'Failed to detect trends.', variant: 'destructive' });
    }
  };

  // Group trends by type for better organization
  const trendsByType = (trends || []).reduce<Record<string, typeof trends>>((acc, trend) => {
    const type = trend.trend_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type]!.push(trend);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Trend Intelligence</h1>
              <p className="text-muted-foreground">
                AI-detected patterns in your Instagram performance.
                {trends && trends.length > 0 && (
                  <span className="text-foreground font-medium"> {trends.length} active trends.</span>
                )}
              </p>
            </div>
          </div>
          <Button onClick={handleDetectTrends} disabled={detectTrends.isPending}>
            {detectTrends.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            Detect Trends
          </Button>
        </motion.div>
      </div>

      {trendsError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-destructive font-medium">Failed to load trends</p>
          <p className="text-sm text-muted-foreground">{trendsError instanceof Error ? trendsError.message : 'An unexpected error occurred.'}</p>
        </div>
      ) : loadingTrends ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : trends && trends.length > 0 ? (
        <>
          {/* Summary row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            {Object.entries(trendsByType).map(([type, items]) => (
              <div key={type} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <BarChart3 className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">{items?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{trendTypeLabels[type] || type} trends</p>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trends.map((trend, i) => {
              const confidence = formatConfidence(Number(trend.confidence_score));
              return (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <ChartCard title={trend.title} subtitle={`Detected ${new Date(trend.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`} delay={0}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {directionIcon[trend.direction as keyof typeof directionIcon] || directionIcon.stable}
                          <span className="text-sm font-medium text-foreground">
                            {directionLabel[trend.direction] || 'Steady'}
                          </span>
                        </div>
                        <Badge className={`text-xs ${trendTypeColors[trend.trend_type] || 'bg-muted text-muted-foreground'}`}>
                          {trendTypeLabels[trend.trend_type] || trend.trend_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{trend.description}</p>
                      <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          Confidence: <span className={`font-medium ${confidence.className}`}>{confidence.label}</span>
                        </span>
                        {trend.platform && (
                          <span className="text-xs text-muted-foreground">
                            Platform: <span className="font-medium text-foreground capitalize">{trend.platform}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </ChartCard>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <ChartCard title="No Trends Detected" subtitle="Run the AI analysis to discover patterns" delay={0.1}>
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground mb-2">No performance trends yet</p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Click "Detect Trends" to analyze your posts, engagement, and audience data. The AI will identify patterns like content performance shifts, audience growth trends, and engagement anomalies.
            </p>
          </div>
        </ChartCard>
      )}
    </DashboardLayout>
  );
}
