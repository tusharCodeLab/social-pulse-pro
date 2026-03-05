import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Smile, Frown, Meh, MessageCircle, Shield, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { useYouTubeComments } from '@/hooks/useYouTubeData';
import { useAnalyzeSentimentApi } from '@/hooks/useSocialApi';
import { useSpamComments, useDetectSpam } from '@/hooks/useAIFeatures';
import { useToast } from '@/hooks/use-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

const SENTIMENT_COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function YouTubeSentiment() {
  const { data: comments = [], refetch: refetchComments } = useYouTubeComments();
  const analyzeSentiment = useAnalyzeSentimentApi();
  const { data: spamComments = [], isLoading: loadingSpam } = useSpamComments('youtube');
  const detectSpam = useDetectSpam();
  const { toast } = useToast();

  const stats = useMemo(() => {
    const total = comments.length;
    const pos = comments.filter(c => c.sentiment === 'positive').length;
    const neg = comments.filter(c => c.sentiment === 'negative').length;
    const neu = comments.filter(c => c.sentiment === 'neutral').length;
    return { total, pos, neg, neu,
      positive: total > 0 ? Math.round((pos / total) * 100) : 0,
      negative: total > 0 ? Math.round((neg / total) * 100) : 0,
      neutral: total > 0 ? Math.round((neu / total) * 100) : 0,
    };
  }, [comments]);

  const pieData = useMemo(() => [
    { name: 'Positive', value: stats.pos, color: SENTIMENT_COLORS.positive },
    { name: 'Neutral', value: stats.neu, color: SENTIMENT_COLORS.neutral },
    { name: 'Negative', value: stats.neg, color: SENTIMENT_COLORS.negative },
  ].filter(d => d.value > 0), [stats]);

  const healthScore = stats.total > 0 ? Math.round(((stats.pos * 1 + stats.neu * 0.5) / stats.total) * 100) : 0;

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSentiment.mutateAsync('youtube');
      await refetchComments();
      toast({ title: 'Analysis complete', description: result.analyzed > 0 ? `Analyzed ${result.analyzed} comment${result.analyzed !== 1 ? 's' : ''}.` : 'All comments already analyzed.' });
    } catch (error) {
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Failed to analyze.', variant: 'destructive' });
    }
  };

  const handleScanSpam = async () => {
    try {
      const result = await detectSpam.mutateAsync();
      toast({ title: 'Spam scan complete', description: `${result?.spamFound || 0} spam found out of ${result?.scanned || 0} scanned.` });
    } catch (error) {
      toast({ title: 'Scan failed', description: error instanceof Error ? error.message : 'Failed to scan.', variant: 'destructive' });
    }
  };

  const legitimateComments = comments.filter(c => !c.is_spam);

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#FF0000]/10"><MessageCircle className="h-5 w-5 text-[#FF0000]" /></div>
              <h1 className="text-3xl font-bold text-foreground">Sentiment Analysis</h1>
              <Badge variant="outline" className="text-xs border-[#FF0000]/30 text-[#FF0000] gap-1"><Youtube className="h-3 w-3" /> YouTube</Badge>
            </div>
            <p className="text-muted-foreground">AI-powered analysis of YouTube comment reactions.{stats.total > 0 && <span className="text-foreground font-medium"> {stats.total} comments imported.</span>}</p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzeSentiment.isPending}>
            {analyzeSentiment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze Comments
          </Button>
        </motion.div>
      </div>

      {/* Health Score Banner */}
      {stats.total > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="mb-6 rounded-xl border border-border/60 bg-gradient-to-r from-card via-card to-chart-sentiment-positive/5 p-4" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <motion.circle cx="24" cy="24" r="20" fill="none"
                  stroke={healthScore >= 70 ? SENTIMENT_COLORS.positive : healthScore >= 40 ? 'hsl(38,92%,50%)' : SENTIMENT_COLORS.negative}
                  strokeWidth="4" strokeLinecap="round"
                  initial={{ strokeDashoffset: 125.6 }}
                  animate={{ strokeDashoffset: 125.6 - (healthScore / 100) * 125.6 }}
                  transition={{ duration: 1 }}
                  style={{ strokeDasharray: 125.6 }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{healthScore}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Sentiment Health Score</h3>
              <p className="text-xs text-muted-foreground">
                {healthScore >= 70 ? 'Your audience sentiment is predominantly positive!' : healthScore >= 40 ? 'Mixed sentiment — monitor negative feedback.' : 'High negative sentiment — review and address concerns.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <EnhancedMetricCard label="Positive" value={`${stats.positive}%`} icon={Smile} delay={0.1} color="hsl(142,71%,45%)" />
        <EnhancedMetricCard label="Neutral" value={`${stats.neutral}%`} icon={Meh} delay={0.15} color="hsl(215,20%,55%)" />
        <EnhancedMetricCard label="Negative" value={`${stats.negative}%`} icon={Frown} delay={0.2} color="hsl(0,72%,51%)" />
        <EnhancedMetricCard label="Total Comments" value={String(stats.total)} icon={MessageCircle} delay={0.25} color="hsl(0,80%,50%)" />
      </div>

      {/* Sentiment Distribution + Spam */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <ChartCard title="Sentiment Distribution" subtitle="Comment sentiment breakdown" delay={0.3}>
          <div className="h-[280px] flex items-center justify-center relative">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground">{stats.total}</span>
                  <span className="text-[10px] text-muted-foreground">Comments</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <MessageCircle className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No data yet.</p>
              </div>
            )}
          </div>
          {pieData.length > 0 && (
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-muted-foreground">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        <ChartCard title={`AI Spam Filter${spamComments.length > 0 ? ` · ${spamComments.length} detected` : ''}`} subtitle="Detect bot, promotional, phishing comments" delay={0.35}>
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={handleScanSpam} disabled={detectSpam.isPending}>
              {detectSpam.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
              Scan for Spam
            </Button>
          </div>
          {loadingSpam ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : spamComments.length > 0 ? (
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {spamComments.map((comment: any, i: number) => (
                <motion.div key={comment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.03 }}
                  className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">{comment.author_name || 'Anonymous'}</p>
                        <span className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{comment.content}</p>
                    </div>
                    <Badge variant="destructive" className="text-[10px] shrink-0"><AlertTriangle className="h-3 w-3 mr-1" />{comment.spam_reason}</Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-8 w-8 mx-auto mb-2 text-chart-sentiment-positive/50" />
              <p className="text-sm font-medium text-foreground">No spam detected</p>
              <p className="text-xs text-muted-foreground mt-1">Click "Scan for Spam" to analyze comments.</p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* Recent Comments */}
      <ChartCard title={`Recent Comments${legitimateComments.length > 0 ? ` · ${legitimateComments.length} legitimate` : ''}`} subtitle="Latest imported YouTube comments (spam excluded)" delay={0.4}>
        {legitimateComments.length > 0 ? (
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {legitimateComments.slice(0, 20).map(c => (
              <div key={c.id} className="py-3 px-1 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-foreground">{c.author_name || 'Anonymous'}</span>
                    {c.sentiment && <SentimentBadge sentiment={c.sentiment} />}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium text-foreground">No comments data</p>
            <p className="text-xs text-muted-foreground mt-1">Import comments by connecting YouTube in Settings.</p>
          </div>
        )}
      </ChartCard>
    </>
  );
}
