import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Info, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  metric?: string;
  delay?: number;
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-chart-sentiment-positive/10',
    iconClass: 'text-chart-sentiment-positive',
    borderClass: 'border-chart-sentiment-positive/20',
    glowColor: 'hsl(142, 71%, 45%)',
    gradientFrom: 'from-chart-sentiment-positive/10',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-chart-impressions/10',
    iconClass: 'text-chart-impressions',
    borderClass: 'border-chart-impressions/20',
    glowColor: 'hsl(38, 92%, 50%)',
    gradientFrom: 'from-chart-impressions/10',
  },
  info: {
    icon: Sparkles,
    bgClass: 'bg-chart-reach/10',
    iconClass: 'text-chart-reach',
    borderClass: 'border-chart-reach/20',
    glowColor: 'hsl(262, 83%, 58%)',
    gradientFrom: 'from-chart-reach/10',
  },
};

export function InsightCard({ type, title, description, metric, delay = 0 }: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02, x: 4 }}
      className={cn(
        'group relative p-4 rounded-xl border overflow-hidden cursor-pointer',
        'transition-all duration-300',
        config.bgClass,
        config.borderClass
      )}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className={cn(
          'absolute inset-0 bg-gradient-to-r via-transparent to-transparent pointer-events-none',
          config.gradientFrom
        )}
      />

      <div className="relative z-10 flex items-start gap-3">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className={cn(
            'p-2.5 rounded-xl backdrop-blur-sm',
            config.bgClass,
            'border',
            config.borderClass
          )}
        >
          <Icon className={cn('h-5 w-5', config.iconClass)} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground truncate">{title}</h4>
            {metric && (
              <motion.span 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={cn(
                  'text-sm font-bold px-2 py-0.5 rounded-md',
                  config.bgClass,
                  config.iconClass
                )}
              >
                {metric}
              </motion.span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="self-center"
        >
          <ArrowRight className={cn('h-4 w-4', config.iconClass)} />
        </motion.div>
      </div>
    </motion.div>
  );
}
