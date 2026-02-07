import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Smile,
  Frown,
  Meh,
  MessageCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { SentimentBadge } from '@/components/dashboard/SentimentBadge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  useSentimentStatsApi,
  useSentimentTrendApi,
  useCommentsApi,
  useAnalyzeSentimentApi,
} from '@/hooks/useSocialApi';

const COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
};

export default function Sentiment() {
  const { toast } = useToast();
  
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = useSentimentStatsApi();
  const { data: trend, isLoading: loadingTrend } = useSentimentTrendApi(14);
  const { data: comments, isLoading: loadingComments, refetch: refetchComments } = useCommentsApi();
  const analyzeSentiment = useAnalyzeSentimentApi();

  const isLoading = loadingStats || loadingTrend || loadingComments;

  // Transform trend data for chart
  const trendData = trend?.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    positive: t.positive,
    negative: t.negative,
    neutral: t.neutral,
  })) || [];

  // Pie chart data
  const pieData = stats ? [
    { name: 'Positive', value: stats.positive, color: COLORS.positive },
    { name: 'Neutral', value: stats.neutral, color: COLORS.neutral },
    { name: 'Negative', value: stats.negative, color: COLORS.negative },
  ] : [];

  const handleAnalyze = async () => {
    try {
      const result = await analyzeSentiment.mutateAsync();
      
      // Refetch data to update UI
      await Promise.all([refetchStats(), refetchComments()]);
      
      toast({
        title: "Analysis complete!",
        description: result.analyzed > 0 
          ? `Analyzed ${result.analyzed} comments with AI sentiment detection.`
          : "All comments have already been analyzed.",
      });
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to analyze sentiment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sentiment Analysis</h1>
            <p className="text-muted-foreground">
              AI-powered analysis of audience reactions and feedback.
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzeSentiment.isPending}>
            {analyzeSentiment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Analyze Comments
          </Button>
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
            <MetricCard
              title="Positive"
              value={`${Math.round(stats?.positivePercent || 0)}%`}
              change={5.2}
              icon={Smile}
              delay={0.1}
            />
            <MetricCard
              title="Neutral"
              value={`${Math.round(stats?.neutralPercent || 0)}%`}
              change={-2.1}
              icon={Meh}
              delay={0.15}
            />
            <MetricCard
              title="Negative"
              value={`${Math.round(stats?.negativePercent || 0)}%`}
              change={-3.1}
              icon={Frown}
              delay={0.2}
            />
            <MetricCard
              title="Total Comments"
              value={stats?.total.toString() || '0'}
              change={12.4}
              icon={MessageCircle}
              delay={0.25}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sentiment Trend */}
            <ChartCard
              title="Sentiment Trend"
              subtitle="Daily sentiment distribution"
              delay={0.3}
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorPositiveSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNegativeSent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.negative} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.negative} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                    <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 15%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stroke={COLORS.positive}
                      fill="url(#colorPositiveSent)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stroke={COLORS.negative}
                      fill="url(#colorNegativeSent)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Sentiment Distribution */}
            <ChartCard
              title="Overall Distribution"
              subtitle="Comment sentiment breakdown"
              delay={0.35}
            >
              <div className="h-[300px] flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222, 47%, 10%)',
                        border: '1px solid hsl(222, 30%, 15%)',
                        borderRadius: '8px',
                        color: 'hsl(210, 40%, 98%)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground">
                    {stats?.total || 0}
                  </span>
                  <span className="text-sm text-muted-foreground">Comments</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Recent Comments */}
          <ChartCard
            title="Recent Comments"
            subtitle="Latest analyzed feedback"
            delay={0.4}
          >
            <div className="space-y-4">
              {comments?.slice(0, 8).map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{comment.authorName}</span>
                        {comment.authorUsername && (
                          <span className="text-sm text-muted-foreground">@{comment.authorUsername}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{comment.likes} likes</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {comment.sentiment && <SentimentBadge sentiment={comment.sentiment} />}
                      {comment.sentimentScore && (
                        <span className="text-xs text-muted-foreground">
                          Score: {(comment.sentimentScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </>
      )}
    </DashboardLayout>
  );
}
