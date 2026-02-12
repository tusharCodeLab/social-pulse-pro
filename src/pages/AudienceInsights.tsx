import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Users, TrendingUp, UserPlus, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { 
  useAudienceGrowthApi, 
  useAudienceSummaryApi,
  useBestPostingTimesApi,
} from '@/hooks/useSocialApi';

const COLORS = {
  primary: 'hsl(173, 80%, 45%)',
};

export default function AudienceInsights() {
  const { data: growth, isLoading: loadingGrowth } = useAudienceGrowthApi(30);
  const { data: summary, isLoading: loadingSummary } = useAudienceSummaryApi();
  const { data: bestTimes, isLoading: loadingTimes } = useBestPostingTimesApi();

  const isLoading = loadingGrowth || loadingSummary || loadingTimes;

  const growthData = growth?.map(g => ({
    date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    followers: g.followersCount,
  })).slice(-14) || [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Audience Insights</h1>
          <p className="text-muted-foreground">
            Track your follower growth and engagement patterns.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MetricCard
              title="Total Followers"
              value={summary?.totalFollowers.toLocaleString() || '0'}
              icon={Users}
              delay={0.1}
            />
            <MetricCard
              title="New This Week"
              value={`+${summary?.newFollowersWeek.toLocaleString() || '0'}`}
              icon={UserPlus}
              delay={0.15}
            />
            <MetricCard
              title="Following"
              value={summary?.totalFollowing.toLocaleString() || '0'}
              icon={TrendingUp}
              delay={0.2}
            />
          </div>

          {/* Follower Growth Chart */}
          <ChartCard
            title="Follower Growth"
            subtitle="Follower count over time"
            delay={0.3}
          >
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
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                    <Area type="monotone" dataKey="followers" stroke={COLORS.primary} fill="url(#colorFollowers)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No audience growth data yet. Data will appear after syncing your Instagram account.
                </div>
              )}
            </div>
          </ChartCard>

          {/* Best Posting Times Heatmap */}
          {bestTimes && bestTimes.length > 0 && (
            <div className="mt-6">
              <ChartCard
                title="Best Posting Times"
                subtitle="When your audience engages most (based on your post data)"
                delay={0.4}
              >
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
                                className="h-6 rounded-sm"
                                style={{
                                  backgroundColor: match
                                    ? `hsla(173, 80%, 45%, ${opacity * 0.8 + 0.1})`
                                    : 'hsla(222, 30%, 15%, 0.3)',
                                }}
                                title={match
                                  ? `${day} ${hour}:00 — ${match.engagementScore.toFixed(0)} avg engagement (${match.sampleSize} posts)`
                                  : `${day} ${hour}:00 — No data`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
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
              </ChartCard>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
