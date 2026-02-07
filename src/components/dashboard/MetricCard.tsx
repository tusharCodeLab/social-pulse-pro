import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedCounter } from '@/components/ui/animated-counter';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
  accentColor?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-primary',
  delay = 0,
  accentColor = 'hsl(var(--primary))',
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  const suffix = typeof value === 'string' ? value.replace(/[0-9.,]/g, '') : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative rounded-xl p-6 border border-border bg-card overflow-hidden"
      style={{
        boxShadow: '0 4px 24px -4px hsl(222 47% 4% / 0.5)',
      }}
    >
      {/* Gradient background on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none"
      />
      
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 60px -20px ${accentColor}40`,
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className={cn(
              'p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5',
              'border border-primary/20',
              iconColor
            )}
          >
            <Icon className="h-5 w-5" />
          </motion.div>
          {change !== undefined && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                'flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full',
                'backdrop-blur-sm',
                isPositive && 'text-chart-sentiment-positive bg-chart-sentiment-positive/15',
                isNegative && 'text-chart-sentiment-negative bg-chart-sentiment-negative/15',
                !isPositive && !isNegative && 'text-muted-foreground bg-muted/50'
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : isNegative ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              <span>{isPositive ? '+' : ''}{change}%</span>
            </motion.div>
          )}
        </div>
        <div>
          <div className="text-2xl font-bold text-foreground mb-1 tabular-nums">
            {!isNaN(numericValue) ? (
              <>
                <AnimatedCounter value={numericValue} duration={1.2} />
                {suffix}
              </>
            ) : (
              value
            )}
          </div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {change !== undefined && (
            <p className="text-xs text-muted-foreground/70 mt-2">{changeLabel}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
