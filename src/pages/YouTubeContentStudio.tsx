import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Clock, Loader2, TrendingUp, Hash, FileText, Wand2, Search, PenLine, Copy, RotateCcw, Target, BarChart3, Users, Lightbulb, Award, Calendar, Zap, Star, Cpu, Heart, Film, Briefcase, Plane, UtensilsCrossed, Shirt, GraduationCap, Trophy, Leaf, Play, Smartphone, Clapperboard, Timer, Volume2 } from 'lucide-react';
import { ExpandableText } from '@/components/ui/expandable-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { YouTubeIcon } from '@/components/icons/PlatformIcons';

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

interface TrendingWorldTopic {
  title: string;
  context: string;
  whyTrending: string;
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

interface TopicExplanation {
  introduction: string;
  key_points: { heading: string; detail: string }[];
  conclusion: string;
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

type YouTubeFormat = 'video' | 'short';

const SCRIPT_SECTION_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  '🎣': { icon: Target, color: 'text-orange-500' },
  '📖': { icon: FileText, color: 'text-blue-500' },
  '💥': { icon: Zap, color: 'text-yellow-500' },
  '📢': { icon: Volume2, color: 'text-green-500' },
  '🎬': { icon: Clapperboard, color: 'text-destructive' },
  '📋': { icon: FileText, color: 'text-sky-500' },
  '📌': { icon: Target, color: 'text-primary' },
  '💡': { icon: Lightbulb, color: 'text-amber-500' },
  '🔄': { icon: RotateCcw, color: 'text-violet-500' },
};

function ScriptDisplay({ script, format }: { script: string; format: YouTubeFormat }) {
  // Parse script into sections based on emoji markers
  const sections = script.split(/\n(?=(?:🎣|📖|💥|📢|🎬|📋|📌|💡|🔄)\s)/).filter(Boolean);
  
  const hasSections = sections.length > 1;

  if (!hasSections) {
    return (
      <div className="text-sm text-foreground bg-muted/30 rounded-xl p-4 whitespace-pre-line leading-relaxed">
        {script}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Format indicator */}
      <div className="flex items-center gap-2">
        {format === 'video' ? (
          <Badge variant="outline" className="gap-1 text-xs border-destructive/30 text-destructive">
            <Play className="h-3 w-3" /> Full Video Script
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 text-xs border-destructive/30 text-destructive">
            <Smartphone className="h-3 w-3" /> Short Script
          </Badge>
        )}
        <Badge variant="secondary" className="text-xs gap-1">
          <Timer className="h-3 w-3" />
          {format === 'video' ? '8-15 min' : '≤60 sec'}
        </Badge>
      </div>

      {/* Script sections */}
      <div className="border border-border/50 rounded-xl overflow-hidden divide-y divide-border/30">
        {sections.map((section, idx) => {
          const firstLine = section.split('\n')[0];
          const emoji = firstLine.match(/^(🎣|📖|💥|📢|🎬|📋|📌|💡|🔄)/)?.[1] || '';
          const sectionConfig = SCRIPT_SECTION_ICONS[emoji];
          const Icon = sectionConfig?.icon || FileText;
          const iconColor = sectionConfig?.color || 'text-muted-foreground';
          
          // Extract section header and body
          const headerMatch = firstLine.match(/^(?:🎣|📖|💥|📢|🎬|📋|📌|💡|🔄)\s*(.+?)(?:\s*\([\d:]+.*?\))?\s*$/);
          const sectionTitle = headerMatch?.[1] || firstLine.replace(/^(?:🎣|📖|💥|📢|🎬|📋|📌|💡|🔄)\s*/, '');
          const timeMatch = firstLine.match(/\(([\d:]+[^)]*)\)/);
          const timeCode = timeMatch?.[1] || '';
          const bodyLines = section.split('\n').slice(1).join('\n').trim();

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="p-4 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-background border border-border/50", iconColor)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{sectionTitle}</span>
                    {timeCode && (
                      <Badge variant="secondary" className="text-[10px] font-mono px-1.5 py-0">
                        {timeCode}
                      </Badge>
                    )}
                  </div>
                  {bodyLines && (
                    <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {bodyLines.split(/(\[.*?\])/).map((part, i) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                          return <span key={i} className="text-xs italic text-destructive/70 bg-destructive/5 rounded px-1 py-0.5 mx-0.5">{part}</span>;
                        }
                        if (part.startsWith('(') && part.endsWith(')')) {
                          return <span key={i} className="text-xs italic text-primary/70">{part}</span>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function YouTubeContentStudio() {
  const [step, setStep] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState<YouTubeFormat | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<PostVersion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [strategy, setStrategy] = useState<PublishingStrategy | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [topicExplanation, setTopicExplanation] = useState<TopicExplanation | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [trendingWorldTopics, setTrendingWorldTopics] = useState<TrendingWorldTopic[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Auto-fetch publishing strategy and topic explanation when entering step 4
  useEffect(() => {
    if (step === 4 && selectedVersion && !strategy && !loadingStrategy) {
      fetchPublishingStrategy();
    }
    if (step === 4 && selectedTopic && !topicExplanation && !loadingExplanation) {
      fetchTopicExplanation();
    }
  }, [step]);

  const fetchTopicExplanation = async () => {
    if (!selectedTopic) return;
    setLoadingExplanation(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: { action: 'topic-explanation', topic: selectedTopic.title },
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
          platform: 'youtube',
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
    setStep(3);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: { topic: topicTitle, platform: 'youtube', format: selectedFormat },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setVersions(data.versions || []);
    } catch (e: any) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
      setStep(2);
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
    setStep(4);
  };

  const handleStartOver = () => {
    setStep(1);
    setSelectedFormat(null);
    setSelectedTopic(null);
    setVersions([]);
    setSelectedVersion(null);
    setStrategy(null);
    setTopicExplanation(null);
    setSelectedCategory(null);
    setTrendingWorldTopics([]);
  };

  const handleFormatSelect = (format: YouTubeFormat) => {
    setSelectedFormat(format);
    setStep(2);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied!`, description: 'Copied to clipboard' });
  };

  const stepLabels = ['Format', 'Topic', 'Versions', 'Strategy'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <YouTubeIcon className="h-6 w-6" />
            YouTube Content Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            AI-powered {selectedFormat === 'short' ? 'Shorts' : selectedFormat === 'video' ? 'Video' : ''} content creation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                s === step ? 'bg-destructive text-destructive-foreground shadow-lg' :
                s < step ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'
              )}>
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={cn('w-6 h-0.5', s < step ? 'bg-destructive' : 'bg-border')} />}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 1: Format Selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 py-4">
              <h2 className="text-xl font-semibold text-foreground">What type of content do you want to create?</h2>
              <p className="text-muted-foreground">Choose your YouTube format to get tailored content suggestions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Video Card */}
              <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="cursor-pointer hover:border-destructive/50 transition-all hover:shadow-xl hover:shadow-destructive/10 h-full"
                  onClick={() => handleFormatSelect('video')}
                >
                  <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <Play className="h-10 w-10 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">YouTube Video</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Long-form content (8-15 min). Full scripts with intro, body sections, and outro. Optimized for search & suggested videos.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <Badge variant="secondary" className="text-xs">Full Script</Badge>
                      <Badge variant="secondary" className="text-xs">Chapters</Badge>
                      <Badge variant="secondary" className="text-xs">SEO Optimized</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Short Card */}
              <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  className="cursor-pointer hover:border-destructive/50 transition-all hover:shadow-xl hover:shadow-destructive/10 h-full"
                  onClick={() => handleFormatSelect('short')}
                >
                  <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <Smartphone className="h-10 w-10 text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">YouTube Short</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Vertical short-form content (≤60 sec). Punchy hooks, fast-paced scripts. Optimized for Shorts feed discovery.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      <Badge variant="secondary" className="text-xs">≤60 Seconds</Badge>
                      <Badge variant="secondary" className="text-xs">Vertical</Badge>
                      <Badge variant="secondary" className="text-xs">Hook-Driven</Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Topic Selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => { setStep(1); setSelectedCategory(null); setTrendingWorldTopics([]); }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Badge variant="outline" className="text-xs">
                {selectedFormat === 'video' ? '🎬 Video' : '📱 Short'}
              </Badge>
            </div>

            {/* Custom Topic Input */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <PenLine className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-semibold text-foreground">
                    Describe the topic for your YouTube {selectedFormat === 'short' ? 'Short' : 'Video'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Top 10 AI tools, Day in my life, Quick cooking hack..."
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCustomTopicSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleCustomTopicSubmit} disabled={!customTopic.trim()} className="gap-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    <Wand2 className="h-4 w-4" /> Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category-Based Trending Topics */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-destructive" />
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
                        className="cursor-pointer hover:border-destructive/50 transition-all hover:shadow-lg group"
                        onClick={() => fetchTrendingForCategory(cat.label)}
                      >
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                            <Icon className="h-5 w-5 text-destructive" />
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
                  <Sparkles className="h-10 w-10 text-destructive" />
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
                        className="cursor-pointer hover:border-destructive/50 transition-all hover:shadow-lg hover:shadow-destructive/5 h-full"
                        onClick={() => {
                          setSelectedTopic({ id: `trending-${idx}`, title: topic.title, description: topic.context, direction: 'up', confidence_score: null, trend_type: selectedCategory || '' });
                          generateForTopic(topic.title);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-destructive shrink-0" />
                            <h3 className="font-semibold text-foreground line-clamp-1">{topic.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{topic.context}</p>
                          <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <Zap className="h-3 w-3 mt-0.5 shrink-0 text-destructive" />
                            <span>{topic.whyTrending}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-3 text-xs text-destructive font-medium">
                            <Wand2 className="h-3 w-3" />
                            <span>Create {selectedFormat === 'short' ? 'Short' : 'Video'}</span>
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

        {/* STEP 3: A/B Versions */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => { setStep(2); setVersions([]); }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Badge variant="outline" className="text-xs">
                {selectedFormat === 'video' ? '🎬 Video' : '📱 Short'}
              </Badge>
              <span className="text-sm text-muted-foreground">Topic: <strong className="text-foreground">{selectedTopic?.title}</strong></span>
            </div>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="h-10 w-10 text-destructive" />
                </motion.div>
                <p className="text-foreground font-medium mt-4">Generating A/B versions...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI is crafting two unique {selectedFormat === 'short' ? 'Short' : 'Video'} scripts
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {versions.map(version => (
                  <motion.div key={version.id} whileHover={{ y: -4 }}>
                    <Card className="h-full hover:border-destructive/50 transition-all hover:shadow-lg hover:shadow-destructive/5 overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-sm font-bold">
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
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</span>
                          </div>
                          <ExpandableText maxHeight={80}>
                            <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{version.caption}</p>
                          </ExpandableText>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {version.hashtags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Clapperboard className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {selectedFormat === 'video' ? 'Video Script' : 'Short Script'}
                            </span>
                          </div>
                          <ExpandableText maxHeight={200}>
                            <ScriptDisplay script={version.script} format={selectedFormat!} />
                          </ExpandableText>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 4: Strategy & Deep-Dive */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(3)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Badge variant="outline" className="text-xs">
                  {selectedFormat === 'video' ? '🎬 Video' : '📱 Short'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Selected: <strong className="text-foreground">Version {selectedVersion?.id}</strong>
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleStartOver} className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Start Over
              </Button>
            </div>

            {/* Post Preview */}
            <Card className="border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-destructive" />
                  Your {selectedFormat === 'short' ? 'Short' : 'Video'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-semibold text-foreground text-lg">{selectedVersion?.title}</h3>

                {/* Topic Deep-Dive */}
                {loadingExplanation && (
                  <div className="flex items-center gap-2 py-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                      <Lightbulb className="h-4 w-4 text-destructive" />
                    </motion.div>
                    <span className="text-sm text-muted-foreground">Generating topic explanation...</span>
                  </div>
                )}
                {topicExplanation && (
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-destructive" />
                      <span className="text-xs font-semibold text-destructive uppercase tracking-wider">Topic Deep-Dive</span>
                    </div>
                    <ExpandableText maxHeight={160}>
                      <p className="text-sm text-foreground/90 leading-relaxed">{topicExplanation.introduction}</p>
                      <div className="space-y-2.5 pl-1 mt-3">
                        {topicExplanation.key_points.map((point, i) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="h-5 w-5 rounded-full bg-destructive/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-destructive">{i + 1}</span>
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-foreground">{point.heading}: </span>
                              <span className="text-sm text-muted-foreground leading-relaxed">{point.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-border/40 pt-3 mt-3">
                        <div className="flex items-start gap-2">
                          <Star className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground/80 leading-relaxed italic">{topicExplanation.conclusion}</p>
                        </div>
                      </div>
                    </ExpandableText>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</span>
                  </div>
                  <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{selectedVersion?.caption}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedVersion?.hashtags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clapperboard className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {selectedFormat === 'video' ? 'Full Video Script' : 'Short Script'}
                    </span>
                  </div>
                  <ScriptDisplay script={selectedVersion?.script || ''} format={selectedFormat!} />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.caption || '', 'Description')}>
                    <Copy className="h-3.5 w-3.5" /> Copy Description
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5"
                    onClick={() => copyToClipboard(selectedVersion?.hashtags.map(t => '#' + t).join(' ') || '', 'Tags')}>
                    <Hash className="h-3.5 w-3.5" /> Copy Tags
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
                  <Target className="h-10 w-10 text-destructive" />
                </motion.div>
                <p className="text-foreground font-medium mt-4">Crafting your publishing strategy...</p>
                <p className="text-sm text-muted-foreground mt-1">AI is analyzing optimal timing and engagement patterns</p>
              </div>
            )}

            {/* Strategy Results */}
            {strategy && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-destructive" />
                      Best Times to Post
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {strategy.best_times.map((slot, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                          i === 0 ? 'bg-destructive text-destructive-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
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

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-destructive" />
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
                        <p className="text-xs text-muted-foreground mb-1">Views</p>
                        <p className="text-lg font-bold text-foreground">
                          {strategy.engagement_forecast.reach_min.toLocaleString()}-{strategy.engagement_forecast.reach_max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{strategy.engagement_forecast.explanation}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-destructive" />
                      Audience Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {strategy.audience_insights.map((insight, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-2.5 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                          <span className="text-foreground">{insight}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-destructive" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {strategy.pro_tips.map((tip, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          className="flex items-start gap-2.5 text-sm">
                          <Zap className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
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
