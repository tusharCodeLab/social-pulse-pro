import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface EnhancedMetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  sparkData?: number[];
  color?: string;
  delay?: number;
}

export function EnhancedMetricCard({ label, value, icon: Icon, change, sparkData, color = 'hsl(var(--primary))', delay = 0 }: EnhancedMetricCardProps) {
  const chartData = (sparkData || [0, 1, 2, 1, 3, 2, 4]).map((v, i) => ({ v, i }));
  const isPositive = (change || 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="metric-card relative rounded-xl border border-border/60 bg-card p-4 overflow-hidden group"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${color}08, transparent 60%)` }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg border border-border/50" style={{ backgroundColor: `${color}15` }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            {change !== undefined && (
              <span className={cn(
                'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                isPositive
                  ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive'
                  : 'bg-destructive/10 text-destructive'
              )}>
                {isPositive ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground tracking-tight leading-none">{value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
        </div>

        {/* Mini sparkline */}
        <div className="w-20 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="v"
                stroke={color} strokeWidth={1.5}
                fill={`url(#spark-${label.replace(/\s/g, '')})`}
                dot={false} isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}
