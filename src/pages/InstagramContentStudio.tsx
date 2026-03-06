import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Check, Calendar as CalendarIcon, Clock, Loader2, TrendingUp, Hash, FileText, Wand2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
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

const RECOMMENDED_HOURS = [9, 12, 15, 18, 20];

export default function InstagramContentStudio() {
  const [step, setStep] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState<TrendingTopic | null>(null);
  const [versions, setVersions] = useState<PostVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<PostVersion | null>(null);
  const [generating, setGenerating] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledHour, setScheduledHour] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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

  // Fetch best posting times
  const { data: bestTimes = [] } = useQuery({
    queryKey: ['best-posting-times', 'instagram'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('best_posting_times')
        .select('*')
        .eq('platform', 'instagram')
        .order('engagement_score', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: step === 3,
  });

  const handleTopicSelect = async (topic: TrendingTopic) => {
    setSelectedTopic(topic);
    setGenerating(true);
    setStep(2);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: { topic: topic.title, platform: 'instagram' },
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

  const handleVersionSelect = (version: PostVersion) => {
    setSelectedVersion(version);
    setStep(3);
  };

  const handleSchedule = async () => {
    if (!selectedVersion || !scheduledDate || scheduledHour === null || !user) return;
    setSaving(true);

    try {
      const { error } = await supabase.from('content_calendar').insert({
        user_id: user.id,
        title: selectedVersion.title,
        caption: selectedVersion.caption,
        hashtags: selectedVersion.hashtags,
        platform: 'instagram',
        scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
        scheduled_time: `${String(scheduledHour).padStart(2, '0')}:00`,
        content_type: 'post',
        status: 'scheduled',
        is_ai_generated: true,
        ai_reasoning: selectedVersion.script,
      });

      if (error) throw error;

      toast({ title: 'Post scheduled!', description: `Scheduled for ${format(scheduledDate, 'PPP')} at ${scheduledHour}:00` });
      // Reset
      setStep(1);
      setSelectedTopic(null);
      setVersions([]);
      setSelectedVersion(null);
      setScheduledDate(undefined);
      setScheduledHour(null);
    } catch (e: any) {
      toast({ title: 'Scheduling failed', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const recommendedHours = bestTimes.length > 0
    ? bestTimes.slice(0, 5).map(t => t.hour_of_day)
    : RECOMMENDED_HOURS;

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
        {/* Step indicator */}
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
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Select a Trending Topic</h2>
            </div>

            {loadingTopics ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : topics.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <p className="text-lg font-medium text-foreground">No trending topics yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Run Trend Intelligence first to discover topics</p>
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
                        {/* Caption */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Caption</span>
                          </div>
                          <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{version.caption}</p>
                        </div>
                        {/* Hashtags */}
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
                        {/* Script */}
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

        {/* STEP 3: Schedule */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <span className="text-sm text-muted-foreground">
                Selected: <strong className="text-foreground">Version {selectedVersion?.id}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Post Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Post Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-foreground">{selectedVersion?.title}</h3>
                  <p className="text-sm text-foreground">{selectedVersion?.caption}</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedVersion?.hashtags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Schedule Picker */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    Schedule Post
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Date */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Pick a date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn('w-full justify-start', !scheduledDate && 'text-muted-foreground')}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {scheduledDate ? format(scheduledDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Time slots */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      Recommended times
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {recommendedHours.map(hour => (
                        <Button
                          key={hour}
                          variant={scheduledHour === hour ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setScheduledHour(hour)}
                          className="text-xs"
                        >
                          {hour}:00
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    disabled={!scheduledDate || scheduledHour === null || saving}
                    onClick={handleSchedule}
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Schedule Post
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
