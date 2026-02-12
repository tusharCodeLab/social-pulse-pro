import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Users, UserPlus, TrendingUp, Clock, Zap } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SectionHeader } from '@/components/dashboard/SectionHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAudienceGrowthApi, useAudienceSummaryApi, useBestPostingTimesApi } from '@/hooks/useSocialApi';
import { useCalculateBestTimes } from '@/hooks/useAIFeatures';
import { useToast } from '@/hooks/use-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AudienceSection() {
  const { toast } = useToast();
  const { data: growth } = useAudienceGrowthApi(30);
  const { data: summary } = useAudienceSummaryApi();
  const { data: bestTimes } = useBestPostingTimesApi();
  const calculateBestTimes = useCalculateBestTimes();

  const growthData = growth?.map(g => ({
    date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    followers: g.followersCount,
  })).slice(-14) || [];

  const handleCalcTimes = async () => {
    try {
      await calculateBestTimes.mutateAsync();
      toast({ title: 'Success', description: 'Best posting times calculated!' });
    } catch {
      toast({ title: 'Error', description: 'Failed to calculate', variant: 'destructive' });
    }
  };

  return (
    <section>
      <SectionHeader icon={Users} title="Audience Insights" subtitle="Follower growth & engagement patterns" delay={0.55} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        <MetricCard title="Total Followers" value={summary?.totalFollowers.toLocaleString() || '0'} icon={Users} delay={0.57} />
        <MetricCard title="New This Week" value={`+${summary?.newFollowersWeek.toLocaleString() || '0'}`} icon={UserPlus} delay={0.59} />
        <MetricCard title="Following" value={summary?.totalFollowing.toLocaleString() || '0'} icon={TrendingUp} delay={0.61} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Follower Growth" subtitle="Last 2 weeks" delay={0.63}>
          <div className="h-[240px]">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="clFollowers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(173, 80%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(173, 80%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                  <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(215, 20%, 55%)" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                  <Area type="monotone" dataKey="followers" stroke="hsl(173, 80%, 45%)" fill="url(#clFollowers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">No growth data yet.</div>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Best Posting Times"
          subtitle="AI-calculated optimal schedule"
          delay={0.65}
          action={
            <Button size="sm" variant="outline" onClick={handleCalcTimes} disabled={calculateBestTimes.isPending}>
              {calculateBestTimes.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Clock className="h-3.5 w-3.5 mr-1.5" />}
              Analyze
            </Button>
          }
        >
          {bestTimes && bestTimes.length > 0 ? (
            <div className="space-y-2.5">
              {bestTimes.slice(0, 5).map((time, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.04 }}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-primary">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{DAYS[time.dayOfWeek]} {`${time.hourOfDay.toString().padStart(2, '0')}:00`}</p>
                      <p className="text-[10px] text-muted-foreground">{time.sampleSize} posts</p>
                    </div>
                  </div>
                  <Badge variant="secondary"><Zap className="h-3 w-3 mr-1" />{time.engagementScore.toFixed(0)} avg</Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
              Click "Analyze" to calculate best posting times.
            </div>
          )}
        </ChartCard>
      </div>
    </section>
  );
}
