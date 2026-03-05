import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, MessageSquareText, TrendingUp, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAIContentIdeas, useDetectTrends, ContentIdea } from '@/hooks/useAIFeatures';
import { useAnalyzeSentimentApi } from '@/hooks/useSocialApi';

export function QuickActionsRow() {
  const { toast } = useToast();
  const contentIdeas = useAIContentIdeas();
  const detectTrends = useDetectTrends();
  const analyzeSentiment = useAnalyzeSentimentApi();

  const [ideasResult, setIdeasResult] = useState<ContentIdea[] | null>(null);
  const [trendsResult, setTrendsResult] = useState<number | null>(null);
  const [sentimentResult, setSentimentResult] = useState<boolean>(false);

  const actions = [
    {
      icon: Lightbulb,
      title: 'Content Ideas',
      desc: ideasResult ? `${ideasResult.length} ideas generated` : 'AI-powered content suggestions',
      color: 'hsl(var(--chart-impressions))',
      isPending: contentIdeas.isPending,
      done: !!ideasResult,
      preview: ideasResult?.[0]?.title,
      onClick: async () => {
        try {
          const result = await contentIdeas.mutateAsync();
          if (result.ideas) setIdeasResult(result.ideas);
          else toast({ title: 'No ideas', description: result.message || 'Import data first.' });
        } catch { toast({ title: 'Failed', description: 'Could not generate ideas.', variant: 'destructive' }); }
      },
    },
    {
      icon: TrendingUp,
      title: 'Detect Trends',
      desc: trendsResult !== null ? `${trendsResult} trends found` : 'Find patterns in your data',
      color: 'hsl(var(--chart-engagement))',
      isPending: detectTrends.isPending,
      done: trendsResult !== null,
      preview: null,
      onClick: async () => {
        try {
          const result = await detectTrends.mutateAsync(undefined);
          setTrendsResult(result.trends?.length || 0);
          toast({ title: 'Trends detected', description: `Found ${result.trends?.length || 0} trends.` });
        } catch { toast({ title: 'Failed', description: 'Could not detect trends.', variant: 'destructive' }); }
      },
    },
    {
      icon: MessageSquareText,
      title: 'Analyze Sentiment',
      desc: sentimentResult ? 'Analysis complete' : 'Bulk comment analysis',
      color: 'hsl(var(--chart-sentiment-positive))',
      isPending: analyzeSentiment.isPending,
      done: sentimentResult,
      preview: null,
      onClick: async () => {
        try {
          await analyzeSentiment.mutateAsync(undefined);
          setSentimentResult(true);
          toast({ title: 'Sentiment analyzed', description: 'All comments have been analyzed.' });
        } catch { toast({ title: 'Failed', description: 'Could not analyze sentiment.', variant: 'destructive' }); }
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-3"
    >
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <div
            key={action.title}
            className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/30 transition-all cursor-pointer"
            style={{ boxShadow: 'var(--shadow-card)' }}
            onClick={action.isPending ? undefined : action.onClick}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg border border-border/50" style={{ backgroundColor: `${action.color}15` }}>
                  {action.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : action.done ? (
                    <CheckCircle2 className="h-4 w-4 text-chart-sentiment-positive" />
                  ) : (
                    <Icon className="h-4 w-4" style={{ color: action.color }} />
                  )}
                </div>
                <h4 className="text-xs font-bold text-foreground">{action.title}</h4>
              </div>
              <Sparkles className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
            </div>
            <p className="text-[10px] text-muted-foreground">{action.desc}</p>
            {action.preview && (
              <p className="text-[10px] text-primary mt-1.5 truncate font-medium">💡 {action.preview}</p>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
