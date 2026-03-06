import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Clock, Loader2, TrendingUp, Hash, FileText, Wand2, Search, PenLine, Copy, RotateCcw, Target, BarChart3, Users, Lightbulb, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface PostVersion {
  id: string;
  title: string;
  caption: string;
  hashtags: string[];
  script: string;
}

interface TrendingTopic {
  id: string;
  title: string;
  description: string;
  direction: string;
  confidence_score: number | null;
  trend_type: string;
}

interface BestTime {
  rank: number;
  day: string;
  time: string;
  reasoning: string;
}

interface EngagementForecast {
  likes_min: number;
  likes_max: number;
  comments_min: number;
  comments_max: number;
  reach_min: number;
  reach_max: number;
  explanation: string;
}

interface PublishingStrategy {
  best_times: BestTime[];
  engagement_forecast: EngagementForecast;
  audience_insights: string[];
  pro_tips: string[];
}

export default function InstagramContentStudio() {
  const [step, setStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<PostVersion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [strategy, setStrategy] = useState<PublishingStrategy | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch trending topics
  const { data: topics = [], isLoading: loadingTopics } = useQuery({
    queryKey: ['trending-topics', 'instagram'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('personal_trends')
        .select('*')
        .eq('platform', 'instagram')
        .order('detected_at', { ascending: false })
        .limit(12);
      if (error) throw error;
      return data as TrendingTopic[];
    },
  });

  // Auto-fetch publishing strategy when entering step 3
  useEffect(() => {
    if (step === 3 && selectedVersion && !strategy && !loadingStrategy) {
      fetchPublishingStrategy();
    }
  }, [step]);

  const fetchPublishingStrategy = async () => {
    if (!selectedVersion) return;
    setLoadingStrategy(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: {
          action: 'publishing-strategy',
          platform: 'instagram',
          post: {
            title: selectedVersion.title,
            caption: selectedVersion.caption,
            hashtags: selectedVersion.hashtags,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStrategy(data as PublishingStrategy);
    } catch (e: any) {
      toast({ title: 'Strategy generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingStrategy(false);
    }
  };

  // Discover trending topics via AI
  const handleDiscoverTopics = async () => {
    setDiscovering(true);
    try {
      const { data, error } = await supabase.functions.invoke('detect-trends', {
        body: { platform: 'instagram' },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const count = data?.trends?.length || 0;
      toast({ title: 'Topics discovered!', description: `Found ${count} trending topics from your data` });
      queryClient.invalidateQueries({ queryKey: ['trending-topics', 'instagram'] });
    } catch (e: any) {
      toast({ title: 'Discovery failed', description: e.message, variant: 'destructive' });
    } finally {
      setDiscovering(false);
    }
  };

  const generateForTopic = async (topicTitle: string) => {
    setGenerating(true);
    setStep(2);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: { topic: topicTitle, platform: 'instagram' },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setVersions(data.versions || []);
    } catch (e: any) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
      setStep(1);
    } finally {
      setGenerating(false);
    }
  };

  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    generateForTopic(topic.title);
  };

  const handleCustomTopicSubmit = () => {
    if (!customTopic.trim()) return;
    setSelectedTopic({ id: 'custom', title: customTopic.trim(), description: 'Custom topic', direction: 'up', confidence_score: null, trend_type: 'custom' });
    generateForTopic(customTopic.trim());
    setCustomTopic('');
  };

  const handleVersionSelect = (version: PostVersion) => {
    setSelectedVersion(version);
    setStrategy(null);
    setStep(3);
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedTopic(null);
    setVersions([]);
    setSelectedVersion(null);
    setStrategy(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!`, description: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Content Studio
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered post creation from trending topics</p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                s === step ? 'bg-primary text-primary-foreground shadow-lg' :
                s < step ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              )}>
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={cn('w-8 h-0.5', s < step ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Trending Topics */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PenLine className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Enter your own topic</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Summer fitness tips, AI in marketing, Travel hacks..."
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCustomTopicSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleCustomTopicSubmit} disabled={!customTopic.trim()} className="gap-1.5">
                    <Wand2 className="h-4 w-4" /> Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Or pick a Trending Topic</h2>
              </div>
              <Button variant="outline" size="sm" onClick={handleDiscoverTopics} disabled={discovering} className="gap-1.5">
                {discovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {discovering ? 'Analyzing...' : 'Discover Topics'}
              </Button>
            </div>

            {loadingTopics ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : topics.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-base font-medium text-foreground">No trending topics yet</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">Click "Discover Topics" to analyze your Instagram data, or enter a custom topic above</p>
                  <Button onClick={handleDiscoverTopics} disabled={discovering} className="gap-1.5">
                    {discovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {discovering ? 'Analyzing your data...' : 'Discover Trending Topics'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topics.map(topic => (
                  <motion.div key={topic.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
                      onClick={() => handleTopicSelect(topic)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant="outline" className="text-xs capitalize">{topic.trend_type}</Badge>
                          <Badge className={cn(
                            'text-xs',
                            topic.direction === 'up' ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive border-chart-sentiment-positive/20' :
                            'bg-chart-sentiment-negative/10 text-chart-sentiment-negative border-chart-sentiment-negative/20'
                          )}>
                            {topic.direction === 'up' ? '↑' : '↓'} {topic.confidence_score ? `${Math.round(topic.confidence_score * 100)}%` : 'N/A'}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{topic.description}</p>
                        <div className="flex items-center gap-1 mt-3 text-xs text-primary">
                          <Wand2 className="h-3 w-3" />
                          <span>Click to generate posts</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 2: A/B Post Versions */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => { setStep(1); setVersions([]); }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <span className="text-sm text-muted-foreground">Topic: <strong className="text-foreground">{selectedTopic?.title}</strong></span>
            </div>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="h-10 w-10 text-primary" />
                </motion.div>
                <p className="text-foreground font-medium mt-4">Generating A/B versions...</p>
                <p className="text-sm text-muted-foreground mt-1">AI is crafting two unique post variations</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {versions.map(version => (
                  <motion.div key={version.id} whileHover={{ y: -4 }}>
                    <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer"
                          onClick={() => handleVersionSelect(version)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm font-bold">
                            Version {version.id}
                          </Badge>
                          <Button size="sm" variant="outline" className="gap-1">
                            Select <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg mt-2">{version.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caption</span>
                          </div>
                          <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{version.caption}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hashtags</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {version.hashtags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Script</span>
                          </div>
                          <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-line line-clamp-6">
                            {version.script}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 3: AI Publishing Strategy */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  Selected: <strong className="text-foreground">Version {selectedVersion?.id}</strong>
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleStartOver} className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Start Over
              </Button>
            </div>

            {/* Post Preview + Quick Actions */}
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Your Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-foreground">{selectedVersion?.title}</h3>
                <p className="text-sm text-foreground">{selectedVersion?.caption}</p>
                <div className="flex flex-wrap gap-1">
                  {selectedVersion?.hashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.caption || '', 'Caption')}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Caption
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.hashtags.map(t => '#' + t).join(' ') || '', 'Hashtags')}
                  >
                    <Hash className="h-3.5 w-3.5" /> Copy Hashtags
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Loading */}
            {loadingStrategy && (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Target className="h-10 w-10 text-primary" />
                </motion.div>
                <p className="text-foreground font-medium mt-4">Crafting your publishing strategy...</p>
                <p className="text-sm text-muted-foreground mt-1">AI is analyzing optimal timing and engagement patterns</p>
              </div>
            )}

            {/* Strategy Results */}
            {strategy && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Times to Post */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Best Times to Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strategy.best_times.map((slot, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                        )}>
                          {i === 0 ? <Award className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-foreground">{slot.day}</span>
                            <Badge variant="outline" className="text-xs">{slot.time}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{slot.reasoning}</p>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>

                {/* Engagement Forecast */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Engagement Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Likes</p>
                        <p className="text-lg font-bold text-foreground">
                          {strategy.engagement_forecast.likes_min.toLocaleString()}-{strategy.engagement_forecast.likes_max.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Comments</p>
                        <p className="text-lg font-bold text-foreground">
                          {strategy.engagement_forecast.comments_min.toLocaleString()}-{strategy.engagement_forecast.comments_max.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Reach</p>
                        <p className="text-lg font-bold text-foreground">
                          {strategy.engagement_forecast.reach_min.toLocaleString()}-{strategy.engagement_forecast.reach_max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{strategy.engagement_forecast.explanation}</p>
                  </CardContent>
                </Card>

                {/* Audience Insights */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Audience Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {strategy.audience_insights.map((insight, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          <span className="text-foreground">{insight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Pro Tips */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {strategy.pro_tips.map((tip, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 mt-0.5">{i + 1}</Badge>
                          <span className="text-foreground">{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
