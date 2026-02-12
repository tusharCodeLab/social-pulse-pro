import { motion } from "framer-motion";
import {
  Shield,
  TrendingUp,
  Clock,
  Sparkles,
  Loader2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageCircle,
  Brain,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useSpamComments,
  useDetectSpam,
  usePersonalTrends,
  useDetectTrends,
  useCalculateBestTimes,
} from "@/hooks/useAIFeatures";
import {
  useBestPostingTimesApi,
  useAnalyzeSentimentApi,
  useSentimentStatsApi,
} from "@/hooks/useSocialApi";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const directionIcon = {
  up: <ArrowUp className="h-4 w-4 text-chart-sentiment-positive" />,
  down: <ArrowDown className="h-4 w-4 text-destructive" />,
  stable: <Minus className="h-4 w-4 text-muted-foreground" />,
};

const trendTypeColors: Record<string, string> = {
  content: "bg-primary/20 text-primary",
  engagement: "bg-chart-sentiment-positive/20 text-chart-sentiment-positive",
  audience: "bg-chart-reach/20 text-chart-reach",
  hashtag: "bg-chart-impressions/20 text-chart-impressions",
};

export default function AITools() {
  const { toast } = useToast();

  // Spam
  const { data: spamComments, isLoading: loadingSpam } = useSpamComments();
  const detectSpam = useDetectSpam();

  // Trends
  const { data: trends, isLoading: loadingTrends } = usePersonalTrends();
  const detectTrends = useDetectTrends();

  // Best Times
  const { data: bestTimes, isLoading: loadingBestTimes } = useBestPostingTimesApi();
  const calculateBestTimes = useCalculateBestTimes();

  // Sentiment
  const { data: sentimentStats } = useSentimentStatsApi();
  const analyzeSentiment = useAnalyzeSentimentApi();

  const handleAction = async (
    action: () => Promise<any>,
    successMsg: string,
    errorMsg: string
  ) => {
    try {
      await action();
      toast({ title: "Success", description: successMsg });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">AI Tools</h1>
        </div>
        <p className="text-muted-foreground">
          Gemini-powered analytics modules for your Instagram account.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============ Best Time to Post ============ */}
        <ChartCard
          title="Best Time to Post"
          subtitle="Engagement-based time analysis from your real posts"
          delay={0.1}
        >
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              onClick={() =>
                handleAction(
                  () => calculateBestTimes.mutateAsync(),
                  "Best posting times calculated!",
                  "Failed to calculate"
                )
              }
              disabled={calculateBestTimes.isPending}
            >
              {calculateBestTimes.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>

          {loadingBestTimes ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : bestTimes && bestTimes.length > 0 ? (
            <div className="space-y-3">
              {bestTimes.slice(0, 5).map((time, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">#{i + 1}</span>
                    <div>
                      <p className="font-medium text-foreground">
                        {DAYS[time.dayOfWeek]}{" "}
                        {`${time.hourOfDay.toString().padStart(2, "0")}:00`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {time.sampleSize} post{time.sampleSize !== 1 ? "s" : ""} analyzed
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Zap className="h-3 w-3 mr-1" />
                    {time.engagementScore.toFixed(0)} avg
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Click "Analyze" to calculate best posting times from your data.
            </p>
          )}
        </ChartCard>

        {/* ============ Sentiment Analysis ============ */}
        <ChartCard
          title="Comment Sentiment Analysis"
          subtitle="AI-powered sentiment classification"
          delay={0.15}
        >
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              onClick={() =>
                handleAction(
                  () => analyzeSentiment.mutateAsync(),
                  "Sentiment analysis complete!",
                  "Failed to analyze"
                )
              }
              disabled={analyzeSentiment.isPending}
            >
              {analyzeSentiment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Analyze Sentiment
            </Button>
          </div>

          {sentimentStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Positive", value: sentimentStats.positive, pct: sentimentStats.positivePercent, color: "text-chart-sentiment-positive" },
                  { label: "Neutral", value: sentimentStats.neutral, pct: sentimentStats.neutralPercent, color: "text-muted-foreground" },
                  { label: "Negative", value: sentimentStats.negative, pct: sentimentStats.negativePercent, color: "text-destructive" },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-muted/30">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.label} ({Math.round(s.pct)}%)
                    </p>
                  </div>
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {sentimentStats.total} comments analyzed • Avg score:{" "}
                {(sentimentStats.avgScore * 100).toFixed(0)}%
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No sentiment data yet. Click "Analyze Sentiment" to start.
            </p>
          )}
        </ChartCard>

        {/* ============ Spam Filter ============ */}
        <ChartCard
          title="AI Spam Comment Filter"
          subtitle="Detect bot, promotional, and phishing comments"
          delay={0.2}
        >
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              onClick={() =>
                handleAction(
                  () => detectSpam.mutateAsync(),
                  `Scan complete! ${detectSpam.data?.spamFound || 0} spam found.`,
                  "Failed to scan"
                )
              }
              disabled={detectSpam.isPending}
            >
              {detectSpam.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Shield className="h-4 w-4 mr-2" />
              )}
              Scan for Spam
            </Button>
          </div>

          {loadingSpam ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : spamComments && spamComments.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {spamComments.map((comment, i) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {comment.author_name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {comment.content}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-[10px] shrink-0">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {comment.spam_reason}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                No spam detected. Click "Scan for Spam" to analyze comments.
              </p>
            </div>
          )}
        </ChartCard>

        {/* ============ Personal Trends ============ */}
        <ChartCard
          title="Personal Trend Detection"
          subtitle="AI-detected patterns in your Instagram performance"
          delay={0.25}
        >
          <div className="flex justify-end mb-4">
            <Button
              size="sm"
              onClick={() =>
                handleAction(
                  () => detectTrends.mutateAsync(),
                  "Trends detected successfully!",
                  "Failed to detect trends"
                )
              }
              disabled={detectTrends.isPending}
            >
              {detectTrends.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Detect Trends
            </Button>
          </div>

          {loadingTrends ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : trends && trends.length > 0 ? (
            <div className="space-y-3">
              {trends.map((trend, i) => (
                <motion.div
                  key={trend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {directionIcon[trend.direction as keyof typeof directionIcon] || directionIcon.stable}
                      <span className="font-medium text-sm text-foreground">
                        {trend.title}
                      </span>
                    </div>
                    <Badge
                      className={`text-[10px] ${trendTypeColors[trend.trend_type] || "bg-muted text-muted-foreground"}`}
                    >
                      {trend.trend_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6">
                    {trend.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 ml-6">
                    <span className="text-[10px] text-muted-foreground">
                      Confidence: {(Number(trend.confidence_score) * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Click "Detect Trends" to analyze your account patterns.
              </p>
            </div>
          )}
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
