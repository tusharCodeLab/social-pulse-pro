import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { Users, TrendingUp, UserPlus, Loader2, Clock, Zap, Percent } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  useAudienceGrowthApi, 
  useAudienceSummaryApi,
  useBestPostingTimesApi,
} from '@/hooks/useSocialApi';
import { useCalculateBestTimes } from '@/hooks/useAIFeatures';

const COLORS = {
  primary: 'hsl(173, 80%, 45%)',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AudienceInsights() {
  const { toast } = useToast();
  const { data: growth, isLoading: loadingGrowth } = useAudienceGrowthApi(30);
  const { data: summary, isLoading: loadingSummary } = useAudienceSummaryApi();
  const { data: bestTimes, isLoading: loadingTimes } = useBestPostingTimesApi();
  const calculateBestTimes = useCalculateBestTimes();

  const isLoading = loadingGrowth || loadingSummary || loadingTimes;

  const growthData = growth?.map(g => ({
    date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    followers: g.followersCount,
    newFollowers: g.newFollowers,
    netChange: g.netChange,
  })).slice(-14) || [];

  const handleCalculateTimes = async () => {
    try {
      const result = await calculateBestTimes.mutateAsync();
      const count = result?.bestTimes?.length || 0;
      toast({ 
        title: 'Analysis complete', 
        description: count > 0 
          ? `Identified ${count} optimal posting time${count !== 1 ? 's' : ''} from ${result?.totalPostsAnalyzed || 0} posts.`
          : 'Not enough post data to determine best times. Keep posting!',
      });
    } catch (error) {
      toast({ title: 'Calculation failed', description: error instanceof Error ? error.message : 'Failed to calculate best posting times.', variant: 'destructive' });
    }
  };

  const growthRateDisplay = summary?.growthRate 
    ? `${summary.growthRate > 0 ? '+' : ''}${summary.growthRate.toFixed(1)}%`
    : '0%';

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Audience Insights</h1>
          <p className="text-muted-foreground">
            Track your follower growth, engagement patterns, and optimal posting schedule.
          </p>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Total Followers" value={summary?.totalFollowers.toLocaleString() || '0'} icon={Users} delay={0.1} />
            <MetricCard title="New This Week" value={`+${summary?.newFollowersWeek.toLocaleString() || '0'}`} icon={UserPlus} delay={0.15} />
            <MetricCard title="Following" value={summary?.totalFollowing.toLocaleString() || '0'} icon={TrendingUp} delay={0.2} />
            <MetricCard title="Growth Rate" value={growthRateDisplay} icon={Percent} delay={0.25} />
          </div>

          {/* Follower Growth Chart */}
          <ChartCard title="Follower Growth" subtitle="Follower count over the last 14 data points" delay={0.3}>
            <div className="h-[300px]">
              {growthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                    <Area type="monotone" dataKey="followers" stroke={COLORS.primary} fill="url(#colorFollowers)" strokeWidth={2} name="Followers" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Users className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No audience growth data yet.</p>
                  <p className="text-xs text-muted-foreground">Data appears after syncing your Instagram account in Settings.</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Best Time to Post — AI Feature */}
          <div className="mt-6">
            <ChartCard 
              title={`Best Time to Post${bestTimes && bestTimes.length > 0 ? ` · ${bestTimes.length} time slots` : ''}`} 
              subtitle="AI-calculated engagement-based time analysis from your actual post data" 
              delay={0.35}
            >
              <div className="flex justify-end mb-4">
                <Button
                  size="sm"
                  onClick={handleCalculateTimes}
                  disabled={calculateBestTimes.isPending}
                >
                  {calculateBestTimes.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  {bestTimes && bestTimes.length > 0 ? 'Recalculate' : 'Analyze Times'}
                </Button>
              </div>

              {bestTimes && bestTimes.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {bestTimes.slice(0, 5).map((time, i) => (
                      <motion.div
                        key={`${time.dayOfWeek}-${time.hourOfDay}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-primary w-8">#{i + 1}</span>
                          <div>
                            <p className="font-medium text-foreground">
                              {DAYS[time.dayOfWeek]} at {`${time.hourOfDay.toString().padStart(2, '0')}:00`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Based on {time.sampleSize} post{time.sampleSize !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" />
                          {time.engagementScore.toFixed(0)} avg engagement
                        </Badge>
                      </motion.div>
                    ))}
                  </div>

                  {/* Heatmap */}
                  <div className="grid grid-cols-7 gap-2 mt-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => {
                      const adjustedDay = dayIndex === 6 ? 0 : dayIndex + 1;
                      return (
                        <div key={day} className="text-center">
                          <span className="text-xs text-muted-foreground mb-2 block">{day}</span>
                          <div className="space-y-1">
                            {[9, 12, 15, 18, 21].map((hour) => {
                              const match = bestTimes.find(
                                t => t.dayOfWeek === adjustedDay && t.hourOfDay === hour
                              );
                              const maxScore = Math.max(...bestTimes.map(t => t.engagementScore), 1);
                              const opacity = match ? match.engagementScore / maxScore : 0.05;
                              return (
                                <motion.div
                                  key={hour}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5 + (dayIndex * 5 + [9, 12, 15, 18, 21].indexOf(hour)) * 0.02 }}
                                  className="h-6 rounded-sm cursor-default"
                                  style={{
                                    backgroundColor: match
                                      ? `hsla(173, 80%, 45%, ${opacity * 0.8 + 0.1})`
                                      : 'hsla(222, 30%, 15%, 0.3)',
                                  }}
                                  title={match
                                    ? `${day} ${hour}:00 — ${match.engagementScore.toFixed(0)} avg engagement (${match.sampleSize} post${match.sampleSize !== 1 ? 's' : ''})`
                                    : `${day} ${hour}:00 — No data`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-primary/10" />
                        <span className="text-xs text-muted-foreground">Low</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-primary/50" />
                        <span className="text-xs text-muted-foreground">Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-primary" />
                        <span className="text-xs text-muted-foreground">High</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Time slots: 9AM, 12PM, 3PM, 6PM, 9PM</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-foreground">No posting time data yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Analyze Times" to calculate optimal posting windows from your historical post data.
                  </p>
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
