import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Sparkles,
  Clock,
  Copy,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Loader2,
  Wand2,
  Image,
  Film,
  Layout,
  MessageSquare,
  Video,
  Zap,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useCalendarItems,
  useGenerateCalendar,
  useUpdateCalendarItem,
  useDeleteCalendarItem,
  type CalendarItem,
} from "@/hooks/useContentCalendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const platformIcons: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
};

const contentTypeIcons: Record<string, any> = {
  reel: Film,
  carousel: Layout,
  story: Image,
  post: MessageSquare,
  video: Video,
};

const contentTypeColors: Record<string, string> = {
  reel: "from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400",
  carousel: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
  story: "from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400",
  post: "from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400",
  video: "from-purple-500/20 to-violet-500/20 border-purple-500/30 text-purple-400",
};

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dayNamesFull = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function getWeekDates(offset: number) {
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "hsl(var(--chart-sentiment-positive))" : score >= 50 ? "hsl(var(--chart-impressions))" : "hsl(var(--destructive))";

  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
        <motion.circle
          cx="22" cy="22" r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
        {score}
      </span>
    </div>
  );
}

export default function ContentCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const { toast } = useToast();

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const { data: items = [], isLoading } = useCalendarItems(weekDates[0], weekDates[6]);
  const generateCalendar = useGenerateCalendar();
  const updateItem = useUpdateCalendarItem();
  const deleteItem = useDeleteCalendarItem();

  const itemsByDate = useMemo(() => {
    const map: Record<string, CalendarItem[]> = {};
    weekDates.forEach(d => (map[d] = []));
    items.forEach(item => {
      if (map[item.scheduled_date]) map[item.scheduled_date].push(item);
    });
    return map;
  }, [items, weekDates]);

  const today = new Date().toISOString().split("T")[0];

  const handleGenerate = async () => {
    try {
      const result = await generateCalendar.mutateAsync();
      toast({ title: "Calendar Generated!", description: `Created ${result.count} content items for the week.` });
    } catch (e: any) {
      toast({ title: "Generation Failed", description: e.message || "Please try again.", variant: "destructive" });
    }
  };

  const handleCopyCaption = (caption: string) => {
    navigator.clipboard.writeText(caption);
    toast({ title: "Copied!", description: "Caption copied to clipboard." });
  };

  const handleStatusChange = async (item: CalendarItem, status: string) => {
    await updateItem.mutateAsync({ id: item.id, updates: { status } });
    toast({ title: "Status Updated", description: `Marked as ${status}.` });
    setSelectedItem(null);
  };

  const handleDelete = async (id: string) => {
    await deleteItem.mutateAsync(id);
    toast({ title: "Deleted", description: "Calendar item removed." });
    setSelectedItem(null);
  };

  const weekLabel = useMemo(() => {
    const start = new Date(weekDates[0]);
    const end = new Date(weekDates[6]);
    const monthStart = start.toLocaleString("default", { month: "short" });
    const monthEnd = end.toLocaleString("default", { month: "short" });
    if (monthStart === monthEnd) return `${monthStart} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
    return `${monthStart} ${start.getDate()} – ${monthEnd} ${end.getDate()}, ${end.getFullYear()}`;
  }, [weekDates]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              AI Content Calendar
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI-generated weekly content plan based on your performance data
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateCalendar.isPending}
            className="bg-gradient-to-r from-primary to-primary/70 hover:from-primary/90 hover:to-primary/60 text-primary-foreground shadow-lg gap-2"
          >
            {generateCalendar.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {generateCalendar.isPending ? "Generating..." : "Generate Week Plan"}
          </Button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between px-1">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o - 1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">{weekLabel}</h2>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-primary hover:underline mt-0.5">
                Back to this week
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(o => o + 1)}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {weekDates.map((date, i) => {
            const isToday = date === today;
            const dayItems = itemsByDate[date] || [];

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border p-3 min-h-[260px] flex flex-col transition-colors ${
                  isToday
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card/50 border-border/50 hover:border-border"
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {dayNames[i]}
                    </span>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-foreground"}`}>
                      {new Date(date + "T12:00:00").getDate()}
                    </p>
                  </div>
                  {isToday && (
                    <Badge variant="outline" className="text-[9px] border-primary/40 text-primary bg-primary/10">
                      Today
                    </Badge>
                  )}
                </div>

                {/* Items */}
                <div className="flex-1 space-y-2">
                  <AnimatePresence>
                    {dayItems.map((item) => {
                      const PlatformIcon = platformIcons[item.platform] || Instagram;
                      const TypeIcon = contentTypeIcons[item.content_type] || MessageSquare;
                      const colorClass = contentTypeColors[item.content_type] || contentTypeColors.post;

                      return (
                        <motion.button
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.03 }}
                          onClick={() => setSelectedItem(item)}
                          className={`w-full text-left rounded-lg border p-2.5 bg-gradient-to-br ${colorClass} cursor-pointer transition-shadow hover:shadow-md`}
                        >
                          <div className="flex items-start gap-2">
                            <TypeIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-semibold truncate text-foreground">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <PlatformIcon className="h-3 w-3 text-muted-foreground" />
                                {item.scheduled_time && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-2.5 w-2.5" />
                                    {item.scheduled_time.slice(0, 5)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.ai_score && (
                              <span className="text-[10px] font-bold text-primary">{item.ai_score}</span>
                            )}
                          </div>
                          {item.status !== "draft" && (
                            <Badge
                              variant="outline"
                              className={`mt-1.5 text-[8px] ${
                                item.status === "published" ? "border-green-500/40 text-green-400" :
                                item.status === "scheduled" ? "border-blue-500/40 text-blue-400" :
                                "border-border"
                              }`}
                            >
                              {item.status}
                            </Badge>
                          )}
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>

                  {dayItems.length === 0 && !isLoading && (
                    <div className="flex items-center justify-center h-full opacity-30">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Loading calendar...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 rounded-xl border border-dashed border-border/50 bg-card/30"
          >
            <Sparkles className="h-12 w-12 mx-auto text-primary/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Content Planned Yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Click "Generate Week Plan" to have AI create a tailored 7-day content strategy based on your analytics data.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={generateCalendar.isPending}
              className="gap-2 bg-gradient-to-r from-primary to-primary/70"
            >
              <Wand2 className="h-4 w-4" />
              Generate Your First Plan
            </Button>
          </motion.div>
        )}

        {/* Stats Bar */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Posts", value: items.length, icon: Calendar },
              { label: "Avg AI Score", value: Math.round(items.reduce((s, i) => s + (i.ai_score || 0), 0) / items.length), icon: Zap },
              { label: "Published", value: items.filter(i => i.status === "published").length, icon: CheckCircle2 },
              { label: "Drafts", value: items.filter(i => i.status === "draft").length, icon: MessageSquare },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card/50 p-4 flex items-center gap-3">
                <stat.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          {selectedItem && (() => {
            const PlatformIcon = platformIcons[selectedItem.platform] || Instagram;
            const TypeIcon = contentTypeIcons[selectedItem.content_type] || MessageSquare;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TypeIcon className="h-5 w-5 text-primary" />
                    {selectedItem.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Meta row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <PlatformIcon className="h-3 w-3" />
                      {selectedItem.platform}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {selectedItem.content_type}
                    </Badge>
                    {selectedItem.scheduled_time && (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedItem.scheduled_time.slice(0, 5)}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {new Date(selectedItem.scheduled_date + "T12:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  </div>

                  {/* Score */}
                  {selectedItem.ai_score && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/50">
                      <ScoreRing score={selectedItem.ai_score} />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Predicted Engagement</p>
                        <p className="text-xs text-muted-foreground">{selectedItem.ai_reasoning}</p>
                      </div>
                    </div>
                  )}

                  {/* Caption */}
                  {selectedItem.caption && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Caption</h4>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleCopyCaption(selectedItem.caption!)}
                          className="gap-1 h-7 text-xs"
                        >
                          <Copy className="h-3 w-3" /> Copy
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground bg-muted/20 rounded-lg p-3 border border-border/30 leading-relaxed whitespace-pre-wrap">
                        {selectedItem.caption}
                      </p>
                    </div>
                  )}

                  {/* Hashtags */}
                  {selectedItem.hashtags && selectedItem.hashtags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground">Hashtags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedItem.hashtags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag.startsWith("#") ? tag : `#${tag}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleStatusChange(selectedItem, "scheduled")}
                      className="gap-1 flex-1"
                    >
                      <Clock className="h-3.5 w-3.5" /> Schedule
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => handleStatusChange(selectedItem, "published")}
                      className="gap-1 flex-1 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Published
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => handleDelete(selectedItem.id)}
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
