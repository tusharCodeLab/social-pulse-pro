import { motion } from 'framer-motion';
import { Bell, Lightbulb, AlertTriangle, TrendingUp, Zap, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Insight {
  id: string;
  title: string;
  description: string;
  insight_type: string;
  priority: string | null;
  is_read: boolean | null;
  created_at: string | null;
  platform: string | null;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string }> = {
  trend: { icon: TrendingUp, color: 'hsl(var(--chart-engagement))' },
  tip: { icon: Lightbulb, color: 'hsl(var(--chart-impressions))' },
  alert: { icon: AlertTriangle, color: 'hsl(var(--destructive))' },
  opportunity: { icon: Zap, color: 'hsl(var(--chart-reach))' },
};

export function ActivityFeed({ insights }: { insights: Insight[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-lg bg-chart-reach/10 border border-chart-reach/20">
            <Bell className="h-4 w-4 text-chart-reach" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
            <p className="text-[10px] text-muted-foreground">Latest AI insights & alerts</p>
          </div>
          {insights.some(i => !i.is_read) && (
            <span className="ml-auto text-[9px] font-semibold px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
              {insights.filter(i => !i.is_read).length} new
            </span>
          )}
        </div>

        {insights.length > 0 ? (
          <div className="space-y-1.5">
            {insights.slice(0, 5).map((insight) => {
              const config = TYPE_CONFIG[insight.insight_type] || TYPE_CONFIG.tip;
              const IIcon = config.icon;
              return (
                <div key={insight.id} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/30 transition-colors group">
                  <div className="p-1.5 rounded-md mt-0.5 flex-shrink-0" style={{ backgroundColor: `${config.color}15` }}>
                    <IIcon className="h-3 w-3" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[11px] font-semibold text-foreground truncate">{insight.title}</p>
                      {!insight.is_read && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{insight.description}</p>
                  </div>
                  {insight.created_at && (
                    <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground/60 flex-shrink-0 mt-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(new Date(insight.created_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center">
            <Bell className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No insights yet. Run AI analysis to generate insights.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
