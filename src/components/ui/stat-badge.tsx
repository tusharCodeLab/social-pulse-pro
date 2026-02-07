import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatBadgeProps {
  value: number;
  suffix?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function StatBadge({ value, suffix = '%', showIcon = true, size = 'sm' }: StatBadgeProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isNeutral = value === 0;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        isPositive && 'text-chart-sentiment-positive bg-chart-sentiment-positive/10',
        isNegative && 'text-chart-sentiment-negative bg-chart-sentiment-negative/10',
        isNeutral && 'text-muted-foreground bg-muted'
      )}
    >
      {showIcon && (
        isPositive ? (
          <TrendingUp className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        ) : isNegative ? (
          <TrendingDown className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        ) : (
          <Minus className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4')} />
        )
      )}
      <span>{isPositive ? '+' : ''}{value}{suffix}</span>
    </motion.div>
  );
}
