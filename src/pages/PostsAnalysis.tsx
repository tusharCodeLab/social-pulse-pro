import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  FileText, TrendingUp, Eye, Heart, MessageCircle, Share2, Loader2,
  Wand2, Sparkles, Hash, Lightbulb, Target, Zap, ChevronRight, Brain,
  Image, Video, Layers, Type, PenTool, Copy, Check, Star,
} from 'lucide-react';

import { EnhancedMetricCard } from '@/components/dashboard/EnhancedMetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { PlatformBadge } from '@/components/dashboard/PlatformBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePostsApi, usePostStatsApi, useEngagementAnalyticsApi } from '@/hooks/useSocialApi';
import { useAIPostCoach, useAICaptionGenerator, PostCoaching, GeneratedCaption } from '@/hooks/useAIFeatures';
import { useToast } from '@/hooks/use-toast';

const COLORS = {
  likes: 'hsl(173, 80%, 45%)',
  comments: 'hsl(262, 83%, 58%)',
  shares: 'hsl(38, 92%, 50%)',
};

const POST_TYPE_LABELS: Record<string, { label: string; icon: typeof Image }> = {
  image: { label: 'Image Post', icon: Image },
  video: { label: 'Video Post', icon: Video },
  reel: { label: 'Reel', icon: Video },
  carousel: { label: 'Carousel', icon: Layers },
  story: { label: 'Story', icon: Layers },
  text: { label: 'Text Post', icon: Type },
};

function formatPostContent(content: string, type: string): string {
  if (content && content.trim().length > 0) return content;
  return POST_TYPE_LABELS[type]?.label || 'Untitled Post';
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export default function PostsAnalysis() {
  const { data: posts, isLoading: loadingPosts, error: postsError } = usePostsApi('instagram');
  const { data: stats, isLoading: loadingStats } = usePostStatsApi('instagram');
  const { data: engagementTrend, isLoading: loadingTrend } = useEngagementAnalyticsApi(14, 'instagram');
  const [coaching, setCoaching] = useState<PostCoaching | null>(null);
  const [captions, setCaptions] = useState<GeneratedCaption[] | null>(null);
  const [captionTopic, setCaptionTopic] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const aiCoach = useAIPostCoach();
  const aiCaption = useAICaptionGenerator();
  const { toast } = useToast();

  const isLoading = loadingPosts || loadingStats || loadingTrend;

  const handleCoach = async () => {
    try {
      const result = await aiCoach.mutateAsync();
      if (result.coaching) {
        // Validate required fields exist before setting
        const c = result.coaching;
        if (
          typeof c.overallScore === 'number' &&
          c.scoreLabel &&
          Array.isArray(c.captionTips) &&
          Array.isArray(c.hashtagSuggestions) &&
          Array.isArray(c.contentIdeas) &&
          c.performancePrediction &&
          c.topStrength &&
          c.biggestOpportunity
        ) {
          setCoaching(c);
        } else {
          toast({ title: 'Incomplete analysis', description: 'AI returned an incomplete response. Please try again.', variant: 'destructive' });
        }
      } else {
        toast({ title: 'No data', description: result.message || 'No posts to analyze. Import posts first via Settings.' });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get coaching.';
      if (message.includes('Rate limit')) {
        toast({ title: 'Rate Limited', description: 'Too many requests. Please wait a minute before trying again.', variant: 'destructive' });
      } else {
        toast({ title: 'Analysis Failed', description: message, variant: 'destructive' });
      }
    }
  };

  const handleGenerateCaptions = async () => {
    if (!captionTopic.trim()) {
      toast({ title: 'Topic required', description: 'Enter a topic or theme for caption generation.' });
      return;
    }
    try {
      const result = await aiCaption.mutateAsync({ topic: captionTopic.trim(), tone: 'professional' });
      if (result.captions) {
        setCaptions(result.captions);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to generate captions.';
      toast({ title: 'Generation Failed', description: msg, variant: 'destructive' });
    }
  };

  const handleCopyCaption = (caption: string, idx: number) => {
    navigator.clipboard.writeText(caption).then(() => {
      setCopiedIdx(idx);
      toast({ title: 'Copied!', description: 'Caption copied to clipboard.' });
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const trendData = engagementTrend?.map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    likes: e.likes,
    comments: e.comments,
    shares: e.shares,
  })) || [];

  // Sort by engagement rate, then by total interactions as tiebreaker
  const topPosts = [...(posts || [])].sort((a, b) => {
    const engDiff = b.metrics.engagementRate - a.metrics.engagementRate;
    if (Math.abs(engDiff) > 0.01) return engDiff;
    const totalA = a.metrics.likes + a.metrics.comments + a.metrics.shares;
    const totalB = b.metrics.likes + b.metrics.comments + b.metrics.shares;
    return totalB - totalA;
  });

  // Calculate actual engagement if DB rate is 0
  const getDisplayEngagement = (post: typeof topPosts[0]) => {
    if (post.metrics.engagementRate > 0) return post.metrics.engagementRate;
    // Fallback: calculate from interactions / reach (or followers)
    const totalInteractions = post.metrics.likes + post.metrics.comments + post.metrics.shares;
    if (post.metrics.reach > 0) return (totalInteractions / post.metrics.reach) * 100;
    return 0;
  };

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Posts Analysis</h1>
          <p className="text-muted-foreground">
            Track and analyze the performance of your Instagram posts.
            {stats && stats.totalPosts > 0 && (
              <span className="text-foreground font-medium"> {stats.totalPosts} posts tracked.</span>
            )}
          </p>
        </motion.div>
      </div>

      {postsError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-destructive font-medium">Failed to load posts data</p>
          <p className="text-sm text-muted-foreground">{postsError instanceof Error ? postsError.message : 'An unexpected error occurred.'}</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <EnhancedMetricCard label="Total Posts" value={stats?.totalPosts.toString() || '0'} icon={FileText} delay={0.1} color="hsl(340,82%,52%)" />
            <EnhancedMetricCard label="Total Likes" value={formatNumber(stats?.totalLikes || 0)} icon={Heart} delay={0.15} color="hsl(var(--primary))" sparkData={trendData.map(d => d.likes)} />
            <EnhancedMetricCard label="Total Comments" value={formatNumber(stats?.totalComments || 0)} icon={MessageCircle} delay={0.2} color="hsl(262,83%,58%)" sparkData={trendData.map(d => d.comments)} />
            <EnhancedMetricCard label="Avg Engagement" value={`${(stats?.avgEngagement || 0).toFixed(1)}%`} icon={TrendingUp} delay={0.25} color="hsl(38,92%,50%)" />
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
                    <p className="text-xs text-muted-foreground">
                      {coaching ? `Score: ${coaching.overallScore}/100 · ${coaching.scoreLabel}` : 'AI-powered growth analysis for your posts'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleCoach}
                  disabled={aiCoach.isPending || (stats?.totalPosts || 0) === 0}
                  className="gap-1.5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
                  title={(stats?.totalPosts || 0) === 0 ? 'Import posts first via Settings' : undefined}
                >
                  {aiCoach.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {coaching ? 'Re-analyze' : 'Analyze Posts'}
                </Button>
              </div>

              {coaching ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Lightbulb className="h-4 w-4 text-chart-impressions" />
                        <span className="text-sm font-semibold text-foreground">Caption Tips</span>
                      </div>
                      <div className="space-y-2">
                        {coaching.captionTips.slice(0, 5).map((tip, i) => (
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
                        {coaching.hashtagSuggestions.slice(0, 8).map((tag, i) => (
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
                        {coaching.contentIdeas.slice(0, 5).map((idea, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-chart-reach mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{idea}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
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
                  {(stats?.totalPosts || 0) === 0
                    ? 'No posts available. Connect your Instagram account in Settings to import posts.'
                    : 'Click "Analyze Posts" to get AI-powered coaching with caption tips, hashtag ideas, and performance predictions.'}
                </p>
              )}
            </div>
          </motion.div>

          {/* AI Caption Generator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 rounded-xl border border-chart-reach/20 bg-gradient-to-r from-card via-card to-chart-reach/5 overflow-hidden"
            style={{ boxShadow: '0 4px 30px -8px hsl(262 83% 58% / 0.12)' }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-chart-reach/20 to-primary/20 border border-chart-reach/30">
                    <PenTool className="h-5 w-5 text-chart-reach" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">AI Caption Generator</h3>
                    <p className="text-xs text-muted-foreground">Generate optimized captions based on your brand voice</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Enter topic or theme (e.g., 'product launch', 'behind the scenes')..."
                  value={captionTopic}
                  onChange={e => setCaptionTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateCaptions()}
                  className="flex-1"
                />
                <Button onClick={handleGenerateCaptions} disabled={aiCaption.isPending || !captionTopic.trim()} className="gap-1.5 bg-gradient-to-r from-chart-reach to-chart-reach/80 hover:from-chart-reach/90 hover:to-chart-reach/70 text-primary-foreground">
                  {aiCaption.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  Generate
                </Button>
              </div>

              {captions && captions.length > 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {captions.map((cap, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-muted/20 border border-border/50 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs bg-chart-reach/10 text-chart-reach border-chart-reach/20">{cap.style}</Badge>
                          <Badge variant="secondary" className={`text-xs ${
                            cap.estimatedEngagement === 'Very High' ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive' :
                            cap.estimatedEngagement === 'High' ? 'bg-primary/10 text-primary' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {cap.estimatedEngagement} Engagement
                          </Badge>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className={`h-3 w-3 ${s < Math.round(cap.hookStrength / 2) ? 'text-chart-impressions fill-chart-impressions' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                        </div>
                        <Button
                          size="sm" variant="ghost" className="gap-1.5 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleCopyCaption(cap.caption, i)}
                        >
                          {copiedIdx === i ? <Check className="h-3.5 w-3.5 text-chart-sentiment-positive" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedIdx === i ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-line leading-relaxed mb-3">{cap.caption}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cap.hashtags.map((tag, j) => (
                          <span key={j} className="text-xs text-chart-reach bg-chart-reach/10 px-2 py-0.5 rounded-md">#{tag}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : aiCaption.isPending ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-chart-reach" />
                  <span className="text-sm text-muted-foreground">Crafting captions from your brand voice...</span>
                </div>
              ) : null}
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
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No engagement data in the last 2 weeks.</p>
                  </div>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Engagement Distribution" subtitle="Breakdown by engagement type (last 7 days)" delay={0.35}>
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
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No data available for this period.</p>
                  </div>
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
          <ChartCard title="Top Performing Posts" subtitle={`${topPosts.length} posts ranked by engagement`} delay={0.4}>
            {topPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">#</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Post</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Platform</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Likes</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Comments</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Reach</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Eng. Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPosts.map((post, index) => {
                      const displayEng = getDisplayEngagement(post);
                      const PostIcon = POST_TYPE_LABELS[post.type]?.icon || FileText;
                      return (
                        <motion.tr
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 + index * 0.05 }}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-3 px-4 text-xs text-muted-foreground font-medium">{index + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              {post.mediaUrl ? (
                                <img
                                  src={post.mediaUrl}
                                  alt=""
                                  loading="lazy"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                  className="w-12 h-12 rounded-lg object-cover border border-border flex-shrink-0"
                                />
                              ) : null}
                              <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50 border border-border flex-shrink-0 ${post.mediaUrl ? 'hidden' : ''}`}>
                                <PostIcon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-foreground line-clamp-2 max-w-[280px]">
                                  {formatPostContent(post.content, post.type)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{formatRelativeDate(post.publishedAt)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4"><PlatformBadge platform={post.platform} /></td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Heart className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-foreground">{formatNumber(post.metrics.likes)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <MessageCircle className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-foreground">{formatNumber(post.metrics.comments)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Eye className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-foreground">{formatNumber(post.metrics.reach)}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`inline-flex items-center gap-1 text-sm font-medium ${displayEng > 0 ? 'text-chart-sentiment-positive' : 'text-muted-foreground'}`}>
                              {displayEng > 0 && <TrendingUp className="h-3 w-3" />}
                              {displayEng > 0 ? `${displayEng.toFixed(1)}%` : '—'}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">No posts data</p>
                <p className="text-sm text-muted-foreground mt-1">Connect your Instagram account in Settings to import posts.</p>
              </div>
            )}
          </ChartCard>
        </>
      )}
    </>
  );
}
