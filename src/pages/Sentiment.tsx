import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import {
  Heart,
  Smile,
  Frown,
  Meh,
  Sparkles,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { InsightCard } from '@/components/dashboard/InsightCard';
import { sentimentData, topicData, postsData } from '@/lib/demoData';

const COLORS = {
  positive: 'hsl(142, 71%, 45%)',
  negative: 'hsl(0, 72%, 51%)',
  neutral: 'hsl(215, 20%, 55%)',
  primary: 'hsl(173, 80%, 45%)',
};

const overallSentiment = {
  positive: 68,
  neutral: 22,
  negative: 10,
};

const radarData = topicData.map((t) => ({
  topic: t.topic,
  sentiment: t.sentiment * 100,
  mentions: Math.min(t.mentions / 10, 100),
}));

export default function Sentiment() {
  const recentMentions = postsData.slice(0, 5);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Sentiment Analysis</h1>
          <p className="text-muted-foreground">
            AI-powered sentiment analysis of your social media mentions and conversations.
          </p>
        </motion.div>
      </div>

      {/* AI Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-chart-reach/20 border border-primary/20"
      >
        <Sparkles className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">
          Powered by Advanced NLP & Machine Learning
        </span>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Overall Sentiment"
          value={`${overallSentiment.positive}%`}
          change={5.2}
          icon={Heart}
          delay={0.15}
        />
        <MetricCard
          title="Positive Mentions"
          value="2,456"
          change={12.3}
          icon={Smile}
          delay={0.2}
        />
        <MetricCard
          title="Negative Mentions"
          value="324"
          change={-8.5}
          icon={Frown}
          delay={0.25}
        />
        <MetricCard
          title="Neutral Mentions"
          value="890"
          change={2.1}
          icon={Meh}
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sentiment Trend */}
        <ChartCard
          title="Sentiment Trend"
          subtitle="Daily sentiment breakdown"
          delay={0.35}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentData}>
                <defs>
                  <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.positive} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.positive} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#colorPositive)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="negative"
                  stroke={COLORS.negative}
                  fill="url(#colorNegative)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Topic Sentiment Radar */}
        <ChartCard
          title="Topic Sentiment Analysis"
          subtitle="Sentiment by topic category"
          delay={0.4}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(222, 30%, 15%)" />
                <PolarAngleAxis dataKey="topic" stroke="hsl(215, 20%, 55%)" fontSize={10} />
                <PolarRadiusAxis stroke="hsl(215, 20%, 55%)" fontSize={10} />
                <Radar
                  name="Sentiment"
                  dataKey="sentiment"
                  stroke={COLORS.primary}
                  fill={COLORS.primary}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Sentiment Gauge and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sentiment Gauge */}
        <ChartCard title="Sentiment Breakdown" subtitle="Distribution overview" delay={0.45}>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Positive', value: overallSentiment.positive, color: COLORS.positive, icon: Smile },
              { label: 'Neutral', value: overallSentiment.neutral, color: COLORS.neutral, icon: Meh },
              { label: 'Negative', value: overallSentiment.negative, color: COLORS.negative, icon: Frown },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <item.icon className="h-5 w-5" style={{ color: item.color }} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className="text-sm font-medium" style={{ color: item.color }}>
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* AI Insights */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4 flex items-center gap-2"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">AI Sentiment Insights</h3>
          </motion.div>
          <div className="grid gap-4">
            <InsightCard
              type="success"
              title="Positive Trend Detected"
              description="Your brand sentiment has improved by 15% this week. The customer appreciation campaign is showing great results."
              metric="+15%"
              delay={0.55}
            />
            <InsightCard
              type="warning"
              title="Pricing Concerns"
              description="There's an uptick in negative sentiment around pricing discussions. Consider addressing this in your next communication."
              metric="38%"
              delay={0.6}
            />
            <InsightCard
              type="info"
              title="Peak Engagement Topic"
              description="'Community' related posts receive 95% positive sentiment. Double down on community-focused content."
              metric="95%"
              delay={0.65}
            />
          </div>
        </div>
      </div>

      {/* Recent Mentions */}
      <ChartCard
        title="Recent Mentions"
        subtitle="Latest analyzed social media mentions"
        delay={0.7}
      >
        <div className="space-y-3 mt-4">
          {recentMentions.map((mention, index) => (
            <motion.div
              key={mention.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 + index * 0.05 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div
                className={`p-2 rounded-lg ${
                  mention.sentiment === 'positive'
                    ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive'
                    : mention.sentiment === 'negative'
                    ? 'bg-chart-sentiment-negative/10 text-chart-sentiment-negative'
                    : 'bg-chart-sentiment-neutral/10 text-chart-sentiment-neutral'
                }`}
              >
                {mention.sentiment === 'positive' ? (
                  <Smile className="h-5 w-5" />
                ) : mention.sentiment === 'negative' ? (
                  <Frown className="h-5 w-5" />
                ) : (
                  <Meh className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground mb-1">{mention.content}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{mention.date}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {mention.comments}
                  </span>
                  <span
                    className={`font-medium ${
                      mention.sentiment === 'positive'
                        ? 'text-chart-sentiment-positive'
                        : mention.sentiment === 'negative'
                        ? 'text-chart-sentiment-negative'
                        : 'text-chart-sentiment-neutral'
                    }`}
                  >
                    {Math.round(mention.sentimentScore * 100)}% confidence
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ChartCard>
    </DashboardLayout>
  );
}
