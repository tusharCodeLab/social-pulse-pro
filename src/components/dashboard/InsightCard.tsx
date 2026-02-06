import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Info, CheckCircle } from 'lucide-react';
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
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-chart-impressions/10',
    iconClass: 'text-chart-impressions',
    borderClass: 'border-chart-impressions/20',
  },
  info: {
    icon: Info,
    bgClass: 'bg-chart-reach/10',
    iconClass: 'text-chart-reach',
    borderClass: 'border-chart-reach/20',
  },
};

export function InsightCard({ type, title, description, metric, delay = 0 }: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-4 rounded-xl border',
        config.bgClass,
        config.borderClass
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2 rounded-lg', config.bgClass)}>
          <Icon className={cn('h-5 w-5', config.iconClass)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold text-sm text-foreground truncate">{title}</h4>
            {metric && (
              <span className={cn('text-sm font-bold', config.iconClass)}>{metric}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
