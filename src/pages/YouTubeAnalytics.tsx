import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Youtube, Eye, ThumbsUp, MessageCircle, Users, Clock,
  TrendingUp, PlayCircle, BarChart3, Activity, Film,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const COLORS = {
  views: 'hsl(0, 80%, 50%)',
  likes: 'hsl(210, 80%, 55%)',
  comments: 'hsl(142, 71%, 45%)',
  subscribers: 'hsl(38, 92%, 50%)',
  watchTime: 'hsl(262, 83%, 58%)',
};

const tooltipStyle = {
  backgroundColor: 'hsl(222, 47%, 10%)',
  border: '1px solid hsl(222, 30%, 15%)',
  borderRadius: '8px',
  color: 'hsl(210, 40%, 98%)',
};

// Placeholder metrics for YouTube analytics display
function MetricTile({ icon: Icon, label, value, change, color }: {
  icon: any; label: string; value: string; change?: string; color?: string;
}) {
  const isPositive = change && !change.startsWith('-');
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card p-4"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('p-1.5 rounded-lg', color || 'bg-primary/10')}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {change && (
        <span className={cn(
          'text-xs font-medium mt-1 inline-block',
          isPositive ? 'text-chart-sentiment-positive' : 'text-destructive'
        )}>
          {change} vs last period
        </span>
      )}
    </motion.div>
  );
}

export default function YouTubeAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');

  // Zero-state: No data yet. Show structure with empty states.
  const hasData = false;

  const emptyChartMessage = (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-center py-8">
      <Youtube className="h-8 w-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">Connect your YouTube channel to see analytics</p>
      <p className="text-xs text-muted-foreground/60">Go to Settings → Connect YouTube</p>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FF0000]/10">
            <Youtube className="h-6 w-6 text-[#FF0000]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">YouTube Analytics</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Channel performance & video insights
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs border-[#FF0000]/30 text-[#FF0000]">
          <PlayCircle className="h-3 w-3" />
          YouTube
        </Badge>
      </motion.div>

      {/* Top Metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
      >
        <MetricTile icon={Eye} label="Total Views" value="0" color="bg-[#FF0000]/10" />
        <MetricTile icon={Clock} label="Watch Time (hrs)" value="0" color="bg-chart-reach/10" />
        <MetricTile icon={Users} label="Subscribers" value="0" color="bg-chart-impressions/10" />
        <MetricTile icon={ThumbsUp} label="Likes" value="0" color="bg-primary/10" />
        <MetricTile icon={MessageCircle} label="Comments" value="0" color="bg-chart-sentiment-positive/10" />
        <MetricTile icon={Film} label="Videos" value="0" color="bg-chart-sentiment-neutral/10" />
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-5 bg-muted/50">
          <TabsTrigger value="overview" className="gap-1.5 text-xs">
            <BarChart3 className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" /> Engagement
          </TabsTrigger>
          <TabsTrigger value="audience" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Audience
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-1.5 text-xs">
            <PlayCircle className="h-3.5 w-3.5" /> Top Videos
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Views Trend */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-[#FF0000]" />
                <h3 className="text-sm font-semibold text-foreground">Views Trend</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Daily views over the last 30 days</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            {/* Watch Time */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-chart-reach" />
                <h3 className="text-sm font-semibold text-foreground">Watch Time</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Hours watched per day</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            {/* Subscriber Growth */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-chart-impressions" />
                <h3 className="text-sm font-semibold text-foreground">Subscriber Growth</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Net subscriber changes</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            {/* Content Type Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Film className="h-4 w-4 text-chart-sentiment-neutral" />
                <h3 className="text-sm font-semibold text-foreground">Content Breakdown</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Videos, Shorts & Live streams</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <ThumbsUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Likes & Dislikes Ratio</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Engagement quality over time</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="h-4 w-4 text-chart-sentiment-positive" />
                <h3 className="text-sm font-semibold text-foreground">Comments Activity</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">Comment volume and sentiment</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            {/* Engagement Rate Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5 lg:col-span-2"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-chart-reach" />
                <h3 className="text-sm font-semibold text-foreground">Engagement Rate Trend</h3>
              </div>
              <p className="text-[10px] text-muted-foreground mb-4">
                (Likes + Comments) / Views × 100
              </p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-1">Age & Gender</h3>
              <p className="text-[10px] text-muted-foreground mb-4">Viewer demographics</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-1">Top Countries</h3>
              <p className="text-[10px] text-muted-foreground mb-4">Where your viewers are from</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <h3 className="text-sm font-semibold text-foreground mb-1">Traffic Sources</h3>
              <p className="text-[10px] text-muted-foreground mb-4">How viewers find your content</p>
              <div className="h-[220px]">{emptyChartMessage}</div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Top Videos Tab */}
        <TabsContent value="videos">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-5"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <PlayCircle className="h-4 w-4 text-[#FF0000]" />
              <h3 className="text-sm font-semibold text-foreground">Top Performing Videos</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Video', 'Views', 'Likes', 'Comments', 'Watch Time', 'Eng. Rate'].map(h => (
                      <th key={h} className={cn(
                        'py-2.5 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider',
                        h === 'Video' ? 'text-left' : 'text-right'
                      )}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      {emptyChartMessage}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
