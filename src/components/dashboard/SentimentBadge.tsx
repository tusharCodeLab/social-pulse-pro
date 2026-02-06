import { cn } from '@/lib/utils';

interface SentimentBadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  showScore?: boolean;
}

export function SentimentBadge({ sentiment, score, showScore = false }: SentimentBadgeProps) {
  const config = {
    positive: {
      label: 'Positive',
      bgClass: 'bg-chart-sentiment-positive/10',
      textClass: 'text-chart-sentiment-positive',
    },
    negative: {
      label: 'Negative',
      bgClass: 'bg-chart-sentiment-negative/10',
      textClass: 'text-chart-sentiment-negative',
    },
    neutral: {
      label: 'Neutral',
      bgClass: 'bg-chart-sentiment-neutral/10',
      textClass: 'text-chart-sentiment-neutral',
    },
  };

  const { label, bgClass, textClass } = config[sentiment];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        bgClass,
        textClass
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', textClass.replace('text-', 'bg-'))} />
      {label}
      {showScore && score !== undefined && (
        <span className="opacity-75">({Math.round(score * 100)}%)</span>
      )}
    </span>
  );
}
