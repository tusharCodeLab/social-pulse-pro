import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Clock, Loader2, TrendingUp, Hash, FileText, Wand2, Search, PenLine, Copy, RotateCcw, Target, BarChart3, Users, Lightbulb, Award, Calendar, Zap, Star, Cpu, Heart, Film, Briefcase, Plane, UtensilsCrossed, Shirt, GraduationCap, Trophy, Leaf } from 'lucide-react';
import { ExpandableSection } from '@/components/ui/expandable-section';
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

interface ContentIdea {
  title: string;
  description: string;
  format: string;
  priority: string;
  basedOn: string;
  estimatedImpact: string;
  bestDay: string;
}

interface ContentIdeasResult {
  ideas: ContentIdea[];
  strategy: string;
}

interface TrendingWorldTopic {
  title: string;
  context: string;
  whyTrending: string;
}

const CATEGORIES = [
  { label: 'Technology', icon: Cpu, color: 'hsl(var(--primary))' },
  { label: 'Health & Fitness', icon: Heart, color: 'hsl(0 84% 60%)' },
  { label: 'Entertainment', icon: Film, color: 'hsl(280 84% 60%)' },
  { label: 'Business & Finance', icon: Briefcase, color: 'hsl(45 93% 47%)' },
  { label: 'Travel', icon: Plane, color: 'hsl(199 89% 48%)' },
  { label: 'Food & Cooking', icon: UtensilsCrossed, color: 'hsl(25 95% 53%)' },
  { label: 'Fashion & Beauty', icon: Shirt, color: 'hsl(330 81% 60%)' },
  { label: 'Education', icon: GraduationCap, color: 'hsl(142 71% 45%)' },
  { label: 'Sports', icon: Trophy, color: 'hsl(210 79% 46%)' },
  { label: 'Science & Environment', icon: Leaf, color: 'hsl(160 84% 39%)' },
] as const;

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

interface TopicExplanation {
  introduction: string;
  key_points: { heading: string; detail: string }[];
  conclusion: string;
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
  const [topicExplanation, setTopicExplanation] = useState<TopicExplanation | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [contentIdeas, setContentIdeas] = useState<ContentIdeasResult | null>(null);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [trendingWorldTopics, setTrendingWorldTopics] = useState<TrendingWorldTopic[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
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

  // Auto-fetch publishing strategy and topic explanation when entering step 3
  useEffect(() => {
    if (step === 3 && selectedVersion && !strategy && !loadingStrategy) {
      fetchPublishingStrategy();
    }
    if (step === 3 && selectedTopic && !topicExplanation && !loadingExplanation) {
      fetchTopicExplanation();
    }
  }, [step]);

  const fetchTopicExplanation = async () => {
    if (!selectedTopic) return;
    setLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: {
          action: 'topic-explanation',
          topic: selectedTopic.title,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTopicExplanation(data as TopicExplanation);
    } catch (e: any) {
      toast({ title: 'Explanation generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingExplanation(false);
    }
  };

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

  const fetchContentIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-ideas');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.message) {
        toast({ title: 'No data available', description: data.message, variant: 'destructive' });
        return;
      }
      setContentIdeas(data as ContentIdeasResult);
      toast({ title: 'Ideas generated!', description: `${data.ideas?.length || 0} strategic content ideas ready` });
    } catch (e: any) {
      toast({ title: 'Failed to generate ideas', description: e.message, variant: 'destructive' });
    } finally {
      setLoadingIdeas(false);
    }
  };

  const fetchTrendingForCategory = async (category: string) => {
    setSelectedCategory(category);
    setTrendingWorldTopics([]);
    setLoadingTrending(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-trending-topics', {
        body: { category },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTrendingWorldTopics(data.topics || []);
    } catch (e: any) {
      toast({ title: 'Failed to fetch trending topics', description: e.message, variant: 'destructive' });
      setSelectedCategory(null);
    } finally {
      setLoadingTrending(false);
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
    setTopicExplanation(null);
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
                  <span className="text-sm font-semibold text-foreground">Describe the topic and niche you want to target so the system can generate more relevant content ideas.</span>
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

            {/* Category-Based Trending Topics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Trending Topics by Category</h2>
              </div>
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => { setSelectedCategory(null); setTrendingWorldTopics([]); }} className="gap-1.5">
                  <ArrowLeft className="h-4 w-4" /> All Categories
                </Button>
              )}
            </div>

            {!selectedCategory ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {CATEGORIES.map((cat, idx) => {
                  const Icon = cat.icon;
                  return (
                    <motion.div key={cat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                      <Card
                        className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
                        onClick={() => fetchTrendingForCategory(cat.label)}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{cat.label}</span>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : loadingTrending ? (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="h-10 w-10 text-primary" />
                </motion.div>
                <p className="text-foreground font-medium mt-4">Finding trending topics...</p>
                <p className="text-sm text-muted-foreground mt-1">Discovering what's hot in {selectedCategory}</p>
              </div>
            ) : trendingWorldTopics.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Trending in <strong className="text-foreground">{selectedCategory}</strong> — click any topic to create content</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trendingWorldTopics.map((topic, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Card
                        className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full"
                        onClick={() => {
                          setSelectedTopic({ id: `trending-${idx}`, title: topic.title, description: topic.context, direction: 'up', confidence_score: null, trend_type: selectedCategory || '' });
                          generateForTopic(topic.title);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                            <h3 className="font-semibold text-foreground line-clamp-1">{topic.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{topic.context}</p>
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                            <span>{topic.whyTrending}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                            <Wand2 className="h-3 w-3" />
                            <span>Create content</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Lightbulb className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-base font-medium text-foreground">No topics found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try selecting another category</p>
                </CardContent>
              </Card>
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
                    <Card className="h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-sm font-bold">
                            Version {version.id}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleVersionSelect(version)}
                          >
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
                          <ExpandableSection maxHeight={100}>
                            <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{version.caption}</p>
                          </ExpandableSection>
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
                          <ExpandableSection maxHeight={120}>
                            <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 whitespace-pre-line">
                              {version.script}
                            </div>
                          </ExpandableSection>
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
              <CardContent className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">{selectedVersion?.title}</h3>
                
                {/* Topic Deep-Dive Explanation */}
                {loadingExplanation && (
                  <div className="flex items-center gap-2 py-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                      <Lightbulb className="h-4 w-4 text-primary" />
                    </motion.div>
                    <span className="text-sm text-muted-foreground">Generating topic explanation...</span>
                  </div>
                )}
                {topicExplanation && (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">Topic Deep-Dive</span>
                    </div>
                    
                    {/* Introduction */}
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {topicExplanation.introduction}
                    </p>
                    
                    {/* Key Points */}
                    <div className="space-y-2.5 pl-1">
                      {topicExplanation.key_points.map((point, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">{point.heading}: </span>
                            <span className="text-sm text-muted-foreground leading-relaxed">{point.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Conclusion */}
                    <div className="border-t border-border/40 pt-3 mt-1">
                      <div className="flex items-start gap-2">
                        <Star className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground/80 leading-relaxed italic">
                          {topicExplanation.conclusion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caption</span>
                  </div>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{selectedVersion?.caption}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Hashtags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVersion?.hashtags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Script</span>
                  </div>
                  <div className="text-sm text-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-line max-h-48 overflow-y-auto">
                    {selectedVersion?.script}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.caption || '', 'Caption')}>
                    <Copy className="h-3.5 w-3.5" /> Copy Caption
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.hashtags.map(t => '#' + t).join(' ') || '', 'Hashtags')}>
                    <Hash className="h-3.5 w-3.5" /> Copy Hashtags
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.script || '', 'Script')}>
                    <Copy className="h-3.5 w-3.5" /> Copy Script
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
