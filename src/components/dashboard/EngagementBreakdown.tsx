import { motion } from 'framer-motion';
import { BarChart3, Heart, MessageCircle, Share2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface PlatformMetrics {
  platform: string;
  totalLikes: number;
  totalComments: number;
  totalReach: number;
}

const COLORS: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  facebook: '#1877F2',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-2.5 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1 capitalize">{label}</p>
      {payload.map((e: any) => (
        <div key={e.dataKey} className="flex justify-between gap-3 text-muted-foreground">
          <span className="capitalize">{e.dataKey}</span>
          <span className="font-medium text-foreground">{e.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export function EngagementBreakdown({ metrics }: { metrics: PlatformMetrics[] }) {
  const data = metrics.map(m => ({
    name: m.platform.charAt(0).toUpperCase() + m.platform.slice(1),
    platform: m.platform,
    likes: m.totalLikes,
    comments: m.totalComments,
  }));

  const totals = metrics.reduce((acc, m) => ({
    likes: acc.likes + m.totalLikes,
    comments: acc.comments + m.totalComments,
  }), { likes: 0, comments: 0 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-chart-reach/10 border border-chart-reach/20">
            <BarChart3 className="h-4 w-4 text-chart-reach" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Engagement Breakdown</h3>
            <p className="text-[10px] text-muted-foreground">Likes vs Comments per platform</p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex gap-2 mt-3 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/50">
            <Heart className="h-3 w-3 text-destructive" />
            <span className="text-[10px] font-semibold text-foreground">{totals.likes.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/50">
            <MessageCircle className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-foreground">{totals.comments.toLocaleString()}</span>
          </div>
        </div>

        <div className="h-[200px]">
          {data.some(d => d.likes > 0 || d.comments > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barGap={4}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 20%, 55%)' }} tickLine={false} axisLine={false} width={35} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="likes" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} barSize={16} opacity={0.85} />
                <Bar dataKey="comments" fill="hsl(173, 80%, 45%)" radius={[4, 4, 0, 0]} barSize={16} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No engagement data yet</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
            <span className="text-[10px] text-muted-foreground">Likes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
            <span className="text-[10px] text-muted-foreground">Comments</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
