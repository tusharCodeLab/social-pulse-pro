import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Facebook, Smile, Frown, Meh, MessageCircle, Shield, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { useFacebookComments } from '@/hooks/useFacebookData';
import { useAnalyzeSentimentApi } from '@/hooks/useSocialApi';
import { useSpamComments, useDetectSpam } from '@/hooks/useAIFeatures';
import { useToast } from '@/hooks/use-toast';

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

export default function FacebookSentiment() {
  const { data: comments = [], refetch: refetchComments } = useFacebookComments();
  const analyzeSentiment = useAnalyzeSentimentApi();
  const { data: spamComments = [], isLoading: loadingSpam } = useSpamComments('facebook');
  const detectSpam = useDetectSpam();
  const { toast } = useToast();

  const stats = useMemo(() => {
    const total = comments.length;
    const pos = comments.filter(c => c.sentiment === 'positive').length;
    const neg = comments.filter(c => c.sentiment === 'negative').length;
    const neu = comments.filter(c => c.sentiment === 'neutral').length;
    const spam = comments.filter(c => c.is_spam).length;
    return {
      total,
      positive: total > 0 ? Math.round((pos / total) * 100) : 0,
      negative: total > 0 ? Math.round((neg / total) * 100) : 0,
      neutral: total > 0 ? Math.round((neu / total) * 100) : 0,
      spam,
    };
  }, [comments]);

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSentiment.mutateAsync('facebook');
      await refetchComments();
      toast({
        title: 'Analysis complete',
        description: result.analyzed > 0
          ? `Analyzed ${result.analyzed} comment${result.analyzed !== 1 ? 's' : ''} with AI sentiment detection.`
          : 'All comments have already been analyzed.',
      });
    } catch (error) {
      toast({ title: 'Analysis failed', description: error instanceof Error ? error.message : 'Failed to analyze sentiment.', variant: 'destructive' });
    }
  };

  const handleScanSpam = async () => {
    try {
      const result = await detectSpam.mutateAsync();
      const spamFound = result?.spamFound || 0;
      const scanned = result?.scanned || 0;
      toast({
        title: 'Spam scan complete',
        description: spamFound > 0
          ? `Found ${spamFound} spam comment${spamFound !== 1 ? 's' : ''} out of ${scanned} scanned.`
          : `Scanned ${scanned} comments. No spam detected.`,
      });
    } catch (error) {
      toast({ title: 'Scan failed', description: error instanceof Error ? error.message : 'Failed to scan for spam.', variant: 'destructive' });
    }
  };

  const legitimateComments = comments.filter(c => !c.is_spam);

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[#1877F2]/10"><MessageCircle className="h-5 w-5 text-[#1877F2]" /></div>
              <h1 className="text-3xl font-bold text-foreground">Sentiment Analysis</h1>
              <Badge variant="outline" className="text-xs border-[#1877F2]/30 text-[#1877F2] gap-1"><Facebook className="h-3 w-3" /> Facebook</Badge>
            </div>
            <p className="text-muted-foreground">
              AI-powered analysis of Facebook comment reactions and feedback.
              {stats.total > 0 && <span className="text-foreground font-medium"> {stats.total} comments imported.</span>}
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzeSentiment.isPending}>
            {analyzeSentiment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze Comments
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Positive" value={`${stats.positive}%`} icon={Smile} delay={0.1} />
        <MetricCard title="Neutral" value={`${stats.neutral}%`} icon={Meh} delay={0.15} />
        <MetricCard title="Negative" value={`${stats.negative}%`} icon={Frown} delay={0.2} />
        <MetricCard title="Total Comments" value={String(stats.total)} icon={MessageCircle} delay={0.25} />
      </div>

      <ChartCard
        title={`AI Spam Comment Filter${spamComments.length > 0 ? ` · ${spamComments.length} detected` : ''}`}
        subtitle="Detect bot, promotional, and phishing comments"
        delay={0.3}
      >
        <div className="flex justify-end mb-4">
          <Button size="sm" onClick={handleScanSpam} disabled={detectSpam.isPending}>
            {detectSpam.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
            Scan for Spam
          </Button>
        </div>

        {loadingSpam ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : spamComments.length > 0 ? (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {spamComments.map((comment: any, i: number) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{comment.author_name || 'Anonymous'}</p>
                      <span className="text-[10px] text-muted-foreground">{formatRelativeDate(comment.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{comment.content}</p>
                  </div>
                  <Badge variant="destructive" className="text-[10px] shrink-0">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {comment.spam_reason}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-8 w-8 mx-auto mb-2 text-chart-sentiment-positive/50" />
            <p className="text-sm font-medium text-foreground">No spam detected</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Scan for Spam" to analyze your comments for bot or promotional content.</p>
          </div>
        )}
      </ChartCard>

      <div className="mt-6">
        <ChartCard title={`Recent Comments${legitimateComments.length > 0 ? ` · ${legitimateComments.length} legitimate` : ''}`} subtitle="Latest imported Facebook comments (spam excluded)" delay={0.35}>
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
              <p className="text-xs text-muted-foreground mt-1">Import comments by connecting Facebook in Settings.</p>
            </div>
          )}
        </ChartCard>
      </div>
    </>
  );
}
