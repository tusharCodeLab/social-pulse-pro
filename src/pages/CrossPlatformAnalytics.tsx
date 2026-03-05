import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Instagram,
  Youtube,
  Facebook,
  TrendingUp,
  Eye,
  FileText,
  Users,
  Sparkles,
  Image as ImageIcon,
  Film,
  Heart,
  MessageCircle,
  BarChart3,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import { format } from 'date-fns';
import {
  usePlatformComparison,
  useReachTrends,
  useTopContentByReach,
  useCrossPlatformInsights,
} from '@/hooks/useCrossPlatformData';

const platformConfig = {
  instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram', bgClass: 'bg-[#E4405F]/10', textClass: 'text-[#E4405F]' },
  youtube: { icon: Youtube, color: '#FF0000', label: 'YouTube', bgClass: 'bg-[#FF0000]/10', textClass: 'text-[#FF0000]' },
  facebook: { icon: Facebook, color: '#1877F2', label: 'Facebook', bgClass: 'bg-[#1877F2]/10', textClass: 'text-[#1877F2]' },
} as const;

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function CrossPlatformAnalytics() {
  const { data: comparison, isLoading: compLoading } = usePlatformComparison();
  const { data: trends, isLoading: trendsLoading } = useReachTrends();
  const { data: topContent, isLoading: topLoading } = useTopContentByReach();
  const { data: insights, isLoading: insightsLoading } = useCrossPlatformInsights();

  const totalReach = comparison?.reduce((s, p) => s + p.totalReach, 0) || 0;

  const donutData = comparison
    ?.filter(p => p.totalReach > 0)
    .map(p => ({
      name: platformConfig[p.platform].label,
      value: p.totalReach,
      color: platformConfig[p.platform].color,
      pct: totalReach ? Math.round((p.totalReach / totalReach) * 100) : 0,
    })) || [];

  const engagementData = comparison?.map(p => ({
    platform: platformConfig[p.platform].label,
    rate: p.avgEngagementRate,
    fill: platformConfig[p.platform].color,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Cross-Platform Analytics</h1>
              <p className="text-sm text-muted-foreground">Compare performance across Instagram, YouTube & Facebook</p>
            </div>
          </div>
        </motion.div>

        {/* Platform Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {compLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-6 w-24" />
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <Skeleton key={j} className="h-12 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            : comparison?.map((p, i) => {
                const cfg = platformConfig[p.platform];
                const Icon = cfg.icon;
                return (
                  <motion.div
                    key={p.platform}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-border/50 hover:border-border transition-colors h-full">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className={`p-2.5 rounded-xl ${cfg.bgClass}`}>
                            <Icon className={`h-5 w-5 ${cfg.textClass}`} />
                          </div>
                          <span className="font-semibold text-foreground">{cfg.label}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <MetricBlock icon={Eye} label="Total Reach" value={formatNumber(p.totalReach)} />
                          <MetricBlock icon={TrendingUp} label="Impressions" value={formatNumber(p.totalImpressions)} />
                          <MetricBlock icon={FileText} label="Posts" value={p.postsCount.toString()} />
                          <MetricBlock icon={Users} label="Followers" value={formatNumber(p.followers)} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Multi-Line Reach Trend */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Reach Trends</CardTitle>
              <CardDescription>Daily reach across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : !trends?.length ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  No reach data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={v => format(new Date(v), 'MMM d')}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={formatNumber}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                      labelFormatter={v => format(new Date(v as string), 'MMM d, yyyy')}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="instagram" stroke="#E4405F" strokeWidth={2} dot={false} name="Instagram" />
                    <Line type="monotone" dataKey="youtube" stroke="#FF0000" strokeWidth={2} dot={false} name="YouTube" />
                    <Line type="monotone" dataKey="facebook" stroke="#1877F2" strokeWidth={2} dot={false} name="Facebook" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Platform Distribution Donut */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Reach Distribution</CardTitle>
              <CardDescription>Share of total reach by platform</CardDescription>
            </CardHeader>
            <CardContent>
              {compLoading ? (
                <Skeleton className="h-[280px] w-full" />
              ) : !donutData.length ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  No reach data yet
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {donutData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatNumber(value)}
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    {donutData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name} ({d.pct}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Engagement + Top Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Engagement Rate Comparison */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Avg. Engagement Rate</CardTitle>
              <CardDescription>Normalized comparison across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {compLoading ? (
                <Skeleton className="h-[250px] w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={engagementData} layout="vertical" barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={v => `${v}%`}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="platform"
                      tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Engagement']}
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                      {engagementData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Top Content by Reach */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Top Content by Reach</CardTitle>
              <CardDescription>Best performing posts across all platforms</CardDescription>
            </CardHeader>
            <CardContent>
              {topLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !topContent?.length ? (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  No posts yet
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topContent.map((post, i) => {
                    const cfg = platformConfig[post.platform];
                    const PlatformIcon = cfg.icon;
                    const FallbackIcon = post.platform === 'youtube' ? Film : ImageIcon;
                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                      >
                        <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                          {i + 1}
                        </span>
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                          {post.mediaUrl ? (
                            <img
                              src={post.mediaUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={e => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.classList.add('fallback-shown');
                              }}
                            />
                          ) : (
                            <FallbackIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">
                            {post.content || 'Untitled post'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <PlatformIcon className={`h-3 w-3 ${cfg.textClass}`} />
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Heart className="h-2.5 w-2.5" /> {formatNumber(post.likesCount)}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <MessageCircle className="h-2.5 w-2.5" /> {formatNumber(post.commentsCount)}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs font-semibold">
                          {formatNumber(post.reach)} reach
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">AI Cross-Platform Insights</CardTitle>
            </div>
            <CardDescription>AI-generated observations across your connected platforms</CardDescription>
          </CardHeader>
          <CardContent>
            {insightsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : !insights?.length ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                No AI insights generated yet. Connect your accounts and sync data to receive cross-platform insights.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {insights.map(insight => {
                  const pCfg = insight.platform ? platformConfig[insight.platform as keyof typeof platformConfig] : null;
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {pCfg && <pCfg.icon className={`h-3.5 w-3.5 ${pCfg.textClass}`} />}
                        <Badge
                          variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-3">{insight.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricBlock({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-wide font-medium">{label}</span>
      </div>
      <p className="text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
