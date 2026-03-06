import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles, Loader2, TrendingUp, Lightbulb, BarChart3, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  day: string;
  hour: number;
  score: number;
  reason: string;
}

interface BestTimesResult {
  recommendations: TimeSlot[];
  ai_summary: string;
  tips: string[];
  sample_size: number;
}

const formatHour = (h: number) => {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:00 ${suffix}`;
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  if (score >= 50) return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
  return 'bg-muted text-muted-foreground border-border';
};

export default function InstagramBestTime() {
  const [result, setResult] = useState<BestTimesResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-best-times', {});
      if (error) throw error;
      if (data?.error) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
        return;
      }
      setResult(data);
    } catch (e: any) {
      toast({ title: 'Failed to generate', description: e.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Best Time to Post
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered analysis of your Instagram engagement patterns
          </p>
        </div>
        <Button onClick={generate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {result ? 'Regenerate' : 'Generate Best Times'}
        </Button>
      </div>

      {/* Empty state */}
      {!result && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Clock className="h-12 w-12 text-primary/40 mb-4" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Discover Your Optimal Posting Schedule</h3>
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              Our AI analyzes your Instagram post history to find when your audience is most engaged, then generates a personalized posting strategy.
            </p>
            <Button onClick={generate} size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Best Times
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-foreground font-medium">Analyzing your posting patterns…</p>
            <p className="text-muted-foreground text-sm mt-1">This may take a few seconds</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI Strategy Summary
                </CardTitle>
                <CardDescription>Based on {result.sample_size} Instagram posts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-sm leading-relaxed">{result.ai_summary}</p>
              </CardContent>
            </Card>

            {/* Top Slots */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Recommended Posting Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.recommendations.map((slot, i) => (
                  <motion.div
                    key={`${slot.day}-${slot.hour}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">{slot.day}</span>
                        <span className="text-muted-foreground">at</span>
                        <span className="font-semibold text-foreground">{formatHour(slot.hour)} UTC</span>
                      </div>
                      <p className="text-muted-foreground text-xs truncate">{slot.reason}</p>
                    </div>
                    <Badge variant="outline" className={scoreColor(slot.score)}>
                      Score: {slot.score}
                    </Badge>
                  </motion.div>
                ))}
                {result.recommendations.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">No recommendations yet — post more to unlock insights!</p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            {result.tips && result.tips.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-impressions" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.tips.map((tip, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-start gap-3 text-sm text-foreground"
                      >
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        {tip}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
