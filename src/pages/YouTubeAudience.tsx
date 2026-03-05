import { motion } from 'framer-motion';
import { Youtube, Users, UserPlus, TrendingUp, Percent } from 'lucide-react';

import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Badge } from '@/components/ui/badge';
import { useYouTubeAccount, useYouTubeAudienceMetrics } from '@/hooks/useYouTubeData';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { format } from 'date-fns';

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

const emptyState = (
  <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
    <Youtube className="h-8 w-8 text-muted-foreground/40" />
    <p className="text-sm text-muted-foreground">Connect your YouTube channel to see audience data</p>
    <p className="text-xs text-muted-foreground/60">Go to Settings → Connect YouTube</p>
  </div>
);

export default function YouTubeAudience() {
  const { data: account } = useYouTubeAccount();
  const { data: metrics = [] } = useYouTubeAudienceMetrics();

  const chartData = metrics.map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    subscribers: m.followers_count || 0,
  }));

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[#FF0000]/10"><Users className="h-5 w-5 text-[#FF0000]" /></div>
            <h1 className="text-3xl font-bold text-foreground">Audience Insights</h1>
            <Badge variant="outline" className="text-xs border-[#FF0000]/30 text-[#FF0000] gap-1"><Youtube className="h-3 w-3" /> YouTube</Badge>
          </div>
          <p className="text-muted-foreground">Track your subscriber growth, demographics, and traffic sources.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title="Total Subscribers" value={formatNum(account?.followers_count || 0)} icon={Users} delay={0.1} />
        <MetricCard title="New This Week" value="+0" icon={UserPlus} delay={0.15} />
        <MetricCard title="Growth Rate" value="0%" icon={Percent} delay={0.2} />
        <MetricCard title="Avg Views/Video" value="0" icon={TrendingUp} delay={0.25} />
      </div>

      <ChartCard title="Subscriber Growth" subtitle="Subscriber count snapshots" delay={0.3}>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222,30%,15%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(215,20%,50%)" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="subscribers" stroke="hsl(0,80%,50%)" fill="hsl(0,80%,50%)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          ) : emptyState}
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}
