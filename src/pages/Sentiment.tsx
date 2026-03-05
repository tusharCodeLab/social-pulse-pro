import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Smile, Frown, Meh, MessageCircle, Sparkles, Loader2, Shield, AlertTriangle, Clock,
} from 'lucide-react';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  useSentimentStatsApi, useSentimentTrendApi, useCommentsApi, useAnalyzeSentimentApi,
} from '@/hooks/useSocialApi';
import { useSpamComments, useDetectSpam } from '@/hooks/useAIFeatures';

const COLORS = {
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

export default function Sentiment() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useSentimentStatsApi('instagram');
  const { data: trend, isLoading: loadingTrend } = useSentimentTrendApi(14, 'instagram');
  const { data: comments, isLoading: loadingComments, refetch: refetchComments } = useCommentsApi(undefined, 'instagram');
  const analyzeSentiment = useAnalyzeSentimentApi();

  const { data: spamComments, isLoading: loadingSpam } = useSpamComments('instagram');
  const detectSpam = useDetectSpam();

  const isLoading = loadingStats || loadingTrend || loadingComments;

  const trendData = trend?.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    positive: t.positive,
    negative: t.negative,
    neutral: t.neutral,
  })) || [];

  const pieData = stats ? [
    { name: 'Positive', value: stats.positive, color: COLORS.positive },
    { name: 'Neutral', value: stats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: stats.negative, color: COLORS.negative },
  ] : [];

  // Filter out spam comments from the recent comments list
  const legitimateComments = (comments || []).filter(c => {
    // Check if this comment appears in the spam list
    const isSpam = spamComments?.some(s => s.id === c.id);
    return !isSpam;
  });

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSentiment.mutateAsync('instagram');
      await Promise.all([refetchStats(), refetchComments()]);
      toast({
        title: 'Analysis complete',
        description: result.analyzed > 0 
          ? `Analyzed ${result.analyzed} new comment${result.analyzed !== 1 ? 's' : ''} with AI sentiment detection.`
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

  return (
    <>
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sentiment Analysis</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of audience reactions and feedback.
              {stats && stats.total > 0 && (
                <span className="text-foreground font-medium"> {stats.total} comments analyzed.</span>
              )}
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzeSentiment.isPending}>
            {analyzeSentiment.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Analyze Comments
          </Button>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <EnhancedMetricCard label="Positive" value={`${Math.round(stats?.positivePercent || 0)}%`} icon={Smile} delay={0.1} color="hsl(142,71%,45%)" />
            <EnhancedMetricCard label="Neutral" value={`${Math.round(stats?.neutralPercent || 0)}%`} icon={Meh} delay={0.15} color="hsl(215,20%,55%)" />
            <EnhancedMetricCard label="Negative" value={`${Math.round(stats?.negativePercent || 0)}%`} icon={Frown} delay={0.2} color="hsl(0,72%,51%)" />
            <EnhancedMetricCard label="Total Comments" value={stats?.total.toString() || '0'} icon={MessageCircle} delay={0.25} color="hsl(var(--primary))" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Sentiment Trend" subtitle="Daily sentiment distribution (14 days)" delay={0.3}>
              <div className="h-[300px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorPositiveSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNegativeSent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.negative} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.negative} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                      <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      <Area type="monotone" dataKey="positive" stroke={COLORS.positive} fill="url(#colorPositiveSent)" strokeWidth={2} name="Positive" />
                      <Area type="monotone" dataKey="negative" stroke={COLORS.negative} fill="url(#colorNegativeSent)" strokeWidth={2} name="Negative" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No sentiment trend data. Click "Analyze Comments" to start.</p>
                  </div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Overall Distribution" subtitle="Comment sentiment breakdown" delay={0.35}>
              <div className="h-[300px] flex items-center justify-center relative">
                {stats && stats.total > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-bold text-foreground">{stats.total}</span>
                      <span className="text-sm text-muted-foreground">Comments</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <MessageCircle className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No data yet. Analyze comments to see distribution.</p>
                  </div>
                )}
              </div>
              {stats && stats.total > 0 && (
                <div className="flex justify-center gap-6 mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          {/* AI Spam Comment Filter */}
          <ChartCard 
            title={`AI Spam Comment Filter${spamComments && spamComments.length > 0 ? ` · ${spamComments.length} detected` : ''}`} 
            subtitle="Detect bot, promotional, and phishing comments" 
            delay={0.38}
          >
            <div className="flex justify-end mb-4">
              <Button
                size="sm"
                onClick={handleScanSpam}
                disabled={detectSpam.isPending}
              >
                {detectSpam.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Shield className="h-4 w-4 mr-2" />
                )}
                Scan for Spam
              </Button>
            </div>

            {loadingSpam ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : spamComments && spamComments.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {spamComments.map((comment, i) => (
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

          {/* Recent Comments — filtered to exclude spam */}
          <div className="mt-6">
            <ChartCard 
              title={`Recent Comments${legitimateComments.length > 0 ? ` · ${legitimateComments.length} legitimate` : ''}`} 
              subtitle="Latest analyzed feedback (spam excluded)" 
              delay={0.4}
            >
              {legitimateComments.length > 0 ? (
                <div className="space-y-4">
                  {legitimateComments.slice(0, 10).map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + index * 0.05 }}
                      className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-foreground">{comment.authorName}</span>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">{formatRelativeDate(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {comment.sentiment && <SentimentBadge sentiment={comment.sentiment} />}
                          {comment.sentimentScore != null && (
                            <span className="text-xs text-muted-foreground">
                              {(comment.sentimentScore * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">No comments data</p>
                  <p className="text-xs text-muted-foreground mt-1">Import comments by syncing Instagram in Settings.</p>
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </>
  );
}
