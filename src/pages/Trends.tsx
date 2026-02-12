import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Loader2, ArrowUp, ArrowDown, Minus, Activity, BarChart3,
  Lightbulb, Calendar, Sparkles, Video, Image, Layers, Radio, MonitorPlay,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { usePersonalTrends, useDetectTrends, useAIContentIdeas, ContentIdea } from '@/hooks/useAIFeatures';

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
  const aiContentIdeas = useAIContentIdeas();
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[] | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);

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

  const handleContentIdeas = async () => {
    try {
      const result = await aiContentIdeas.mutateAsync();
      if (result.ideas) {
        setContentIdeas(result.ideas);
        setStrategy(result.strategy || null);
      } else {
        toast({ title: 'No data', description: result.message || 'Detect trends first to generate content ideas.' });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate ideas.';
      toast({ title: 'Generation Failed', description: msg, variant: 'destructive' });
    }
  };

  const formatIcon: Record<string, typeof Video> = {
    Reel: Video,
    Carousel: Layers,
    'Single Post': Image,
    'Story Series': MonitorPlay,
    Live: Radio,
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

      {/* AI Content Ideas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 rounded-xl border border-chart-impressions/20 bg-gradient-to-r from-card via-card to-chart-impressions/5 overflow-hidden"
        style={{ boxShadow: '0 4px 30px -8px hsl(38 92% 50% / 0.12)' }}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-impressions/20 to-primary/20 border border-chart-impressions/30">
                <Lightbulb className="h-5 w-5 text-chart-impressions" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">AI Content Strategy</h3>
                <p className="text-xs text-muted-foreground">Data-driven content ideas based on your detected trends</p>
              </div>
            </div>
            <Button
              size="sm" onClick={handleContentIdeas} disabled={aiContentIdeas.isPending}
              className="gap-1.5 bg-gradient-to-r from-chart-impressions to-chart-impressions/80 hover:from-chart-impressions/90 hover:to-chart-impressions/70 text-primary-foreground"
            >
              {aiContentIdeas.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {contentIdeas ? 'Regenerate' : 'Generate Ideas'}
            </Button>
          </div>

          {contentIdeas && contentIdeas.length > 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {strategy && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-chart-impressions/5 to-primary/5 border border-chart-impressions/10">
                  <p className="text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-chart-impressions inline mr-1" />
                    <span className="font-medium text-foreground">Strategy:</span> {strategy}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {contentIdeas.map((idea, i) => {
                  const FormatIcon = formatIcon[idea.format] || Image;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="p-4 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-semibold text-foreground flex-1">{idea.title}</h4>
                        <Badge variant="secondary" className={`text-[10px] ml-2 flex-shrink-0 ${
                          idea.priority === 'High' ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive' :
                          idea.priority === 'Medium' ? 'bg-chart-impressions/10 text-chart-impressions' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {idea.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{idea.description}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-foreground bg-muted/40 px-2 py-1 rounded-md">
                          <FormatIcon className="h-3 w-3" />
                          {idea.format}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-foreground bg-muted/40 px-2 py-1 rounded-md">
                          <Calendar className="h-3 w-3" />
                          {idea.bestDay}
                        </div>
                        <span className="text-[10px] text-muted-foreground italic flex-1 text-right">Based on: {idea.basedOn}</span>
                      </div>
                      <p className="text-[10px] text-chart-sentiment-positive mt-2">⚡ {idea.estimatedImpact}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : aiContentIdeas.isPending ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 className="h-5 w-5 animate-spin text-chart-impressions" />
              <span className="text-sm text-muted-foreground">Analyzing trends and generating strategic content ideas...</span>
            </div>
          ) : null}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
