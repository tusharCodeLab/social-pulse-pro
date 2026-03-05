import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Smile, Frown, Meh, MessageCircle, Shield } from 'lucide-react';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { useYouTubeComments } from '@/hooks/useYouTubeData';

const emptyState = (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
    <Youtube className="h-8 w-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">Connect your YouTube channel to analyze comment sentiment</p>
    <p className="text-xs text-muted-foreground/60">Go to Settings → Connect YouTube</p>
  </div>
);

export default function YouTubeSentiment() {
  const { data: comments = [] } = useYouTubeComments();

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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#FF0000]/10"><MessageCircle className="h-5 w-5 text-[#FF0000]" /></div>
            <h1 className="text-3xl font-bold text-foreground">Sentiment Analysis</h1>
            <Badge variant="outline" className="text-xs border-[#FF0000]/30 text-[#FF0000] gap-1"><Youtube className="h-3 w-3" /> YouTube</Badge>
          </div>
          <p className="text-muted-foreground">AI-powered analysis of YouTube comment reactions and feedback.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Positive" value={`${stats.positive}%`} icon={Smile} delay={0.1} />
        <MetricCard title="Neutral" value={`${stats.neutral}%`} icon={Meh} delay={0.15} />
        <MetricCard title="Negative" value={`${stats.negative}%`} icon={Frown} delay={0.2} />
        <MetricCard title="Total Comments" value={String(stats.total)} icon={MessageCircle} delay={0.25} />
      </div>

      <ChartCard title="AI Spam Comment Filter" subtitle="Detect bot, promotional, and phishing comments" delay={0.3}>
        <div className="text-center py-8">
          <Shield className="h-8 w-8 mx-auto mb-2 text-chart-sentiment-positive/50" />
          <p className="text-sm font-medium text-foreground">{stats.spam > 0 ? `${stats.spam} spam comments detected` : 'No spam detected'}</p>
          <p className="text-xs text-muted-foreground mt-1">{stats.total === 0 ? 'Connect YouTube to scan comments for spam.' : 'Run sentiment analysis to classify comments.'}</p>
        </div>
      </ChartCard>

      <div className="mt-6">
        <ChartCard title="Recent Comments" subtitle="Latest imported YouTube comments" delay={0.35}>
          {comments.length > 0 ? (
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {comments.slice(0, 20).map(c => (
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
      </div>
    </DashboardLayout>
  );
}
