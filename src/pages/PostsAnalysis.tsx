import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  FileText, TrendingUp, Eye, Heart, MessageCircle, Share2, Loader2,
  Wand2, Sparkles, Hash, Lightbulb, Target, Zap, ChevronRight, Brain,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { PlatformBadge } from '@/components/dashboard/PlatformBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePostsApi, usePostStatsApi, useEngagementAnalyticsApi } from '@/hooks/useSocialApi';
import { useAIPostCoach, PostCoaching } from '@/hooks/useAIFeatures';
import { useToast } from '@/hooks/use-toast';

const COLORS = {
  likes: 'hsl(173, 80%, 45%)',
  comments: 'hsl(262, 83%, 58%)',
  shares: 'hsl(38, 92%, 50%)',
};

export default function PostsAnalysis() {
  const { data: posts, isLoading: loadingPosts } = usePostsApi();
  const { data: stats, isLoading: loadingStats } = usePostStatsApi();
  const { data: engagementTrend, isLoading: loadingTrend } = useEngagementAnalyticsApi(14);
  const [coaching, setCoaching] = useState<PostCoaching | null>(null);
  const aiCoach = useAIPostCoach();
  const { toast } = useToast();

  const isLoading = loadingPosts || loadingStats || loadingTrend;

  const handleCoach = async () => {
    try {
      const result = await aiCoach.mutateAsync();
      if (result.coaching) {
        setCoaching(result.coaching);
      } else {
        toast({ title: 'No data', description: result.message || 'No posts to analyze.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to get coaching.', variant: 'destructive' });
    }
  };

  const trendData = engagementTrend?.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    likes: e.likes,
    comments: e.comments,
    shares: e.shares,
  })) || [];

  const topPosts = [...(posts || [])].sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Posts Analysis</h1>
          <p className="text-muted-foreground">Track and analyze the performance of your Instagram posts.</p>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard title="Total Posts" value={stats?.totalPosts.toString() || '0'} icon={FileText} delay={0.1} />
            <MetricCard title="Total Likes" value={stats?.totalLikes.toLocaleString() || '0'} icon={Heart} delay={0.15} />
            <MetricCard title="Total Comments" value={stats?.totalComments.toLocaleString() || '0'} icon={MessageCircle} delay={0.2} />
            <MetricCard title="Avg Engagement" value={`${(stats?.avgEngagement || 0).toFixed(1)}%`} icon={TrendingUp} delay={0.25} />
          </div>

          {/* AI Post Coach */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="mb-8 rounded-xl border border-primary/20 bg-gradient-to-r from-card via-card to-primary/5 overflow-hidden"
            style={{ boxShadow: '0 4px 30px -8px hsl(173 80% 45% / 0.15)' }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-chart-reach/20 border border-primary/30">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">AI Post Coach</h3>
                    <p className="text-xs text-muted-foreground">AI-powered growth analysis for your posts</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleCoach}
                  disabled={aiCoach.isPending}
                  className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                >
                  {aiCoach.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {coaching ? 'Re-analyze' : 'Analyze Posts'}
                </Button>
              </div>

              {coaching ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  {/* Score + Strength + Opportunity */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="relative w-14 h-14 flex-shrink-0">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                            strokeDasharray={`${(coaching.overallScore / 100) * 125.6} 125.6`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">{coaching.overallScore}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{coaching.scoreLabel}</p>
                        <p className="text-xs text-muted-foreground">Overall Score</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-sentiment-positive/5 border border-chart-sentiment-positive/20">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Target className="h-3.5 w-3.5 text-chart-sentiment-positive" />
                        <span className="text-xs font-semibold text-chart-sentiment-positive uppercase">Top Strength</span>
                      </div>
                      <p className="text-sm text-foreground">{coaching.topStrength}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-chart-impressions/5 border border-chart-impressions/20">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Zap className="h-3.5 w-3.5 text-chart-impressions" />
                        <span className="text-xs font-semibold text-chart-impressions uppercase">Opportunity</span>
                      </div>
                      <p className="text-sm text-foreground">{coaching.biggestOpportunity}</p>
                    </div>
                  </div>
                  {/* Tips, Hashtags, Ideas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Lightbulb className="h-4 w-4 text-chart-impressions" />
                        <span className="text-sm font-semibold text-foreground">Caption Tips</span>
                      </div>
                      <div className="space-y-2">
                        {coaching.captionTips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Hash className="h-4 w-4 text-chart-reach" />
                        <span className="text-sm font-semibold text-foreground">Hashtag Ideas</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {coaching.hashtagSuggestions.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs bg-chart-reach/10 text-chart-reach border-chart-reach/20">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">Content Ideas</span>
                      </div>
                      <div className="space-y-2">
                        {coaching.contentIdeas.map((idea, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-chart-reach mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{idea}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Prediction */}
                  <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-chart-reach/5 border border-primary/10">
                    <p className="text-xs text-center text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-primary inline mr-1" />
                      <span className="font-medium text-foreground">Prediction:</span> {coaching.performancePrediction}
                    </p>
                  </div>
                </motion.div>
              ) : aiCoach.isPending ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing your posts with AI...</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Click "Analyze Posts" to get AI-powered coaching with caption tips, hashtag ideas, and performance predictions.
                </p>
              )}
            </div>
          </motion.div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ChartCard title="Engagement Trend" subtitle="Daily engagement over the last 2 weeks" delay={0.3}>
              <div className="h-[300px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorLikesPost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.likes} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.likes} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                      <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      <Area type="monotone" dataKey="likes" stroke={COLORS.likes} fill="url(#colorLikesPost)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No engagement data yet.</div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Engagement Distribution" subtitle="Breakdown by engagement type" delay={0.35}>
              <div className="h-[300px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 15%)" />
                      <XAxis dataKey="date" stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(222, 47%, 10%)', border: '1px solid hsl(222, 30%, 15%)', borderRadius: '8px', color: 'hsl(210, 40%, 98%)' }} />
                      <Bar dataKey="likes" fill={COLORS.likes} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="comments" fill={COLORS.comments} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="shares" fill={COLORS.shares} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data available.</div>
                )}
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {[{ label: 'Likes', color: COLORS.likes }, { label: 'Comments', color: COLORS.comments }, { label: 'Shares', color: COLORS.shares }].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                    <span className="text-sm text-muted-foreground">{l.label}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Top Posts Table */}
          <ChartCard title="Top Performing Posts" subtitle="Ranked by engagement rate" delay={0.4}>
            {topPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Post</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Platform</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Likes</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Comments</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Reach</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase">Eng. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((post, index) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 + index * 0.05 }}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <p className="text-sm text-foreground line-clamp-2 max-w-[300px]">{post.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(post.publishedAt).toLocaleDateString()}</p>
                        </td>
                        <td className="py-3 px-4"><PlatformBadge platform={post.platform} /></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{post.metrics.likes.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <MessageCircle className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">{post.metrics.comments.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-foreground">
                              {post.metrics.reach >= 1000 ? `${(post.metrics.reach / 1000).toFixed(1)}K` : post.metrics.reach}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-chart-sentiment-positive">
                            <TrendingUp className="h-3 w-3" />
                            {post.metrics.engagementRate.toFixed(1)}%
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">No posts data. Connect Instagram in Settings to import posts.</div>
            )}
          </ChartCard>
        </>
      )}
    </DashboardLayout>
  );
}
