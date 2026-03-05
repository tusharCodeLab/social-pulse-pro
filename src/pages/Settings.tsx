import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check, Loader2, Wifi, WifiOff, TrendingUp,
  User, Database, Bell, LogOut, Shield, Clock, Download, Trash2, Mail,
  Sun, Moon, Monitor,
} from 'lucide-react';
import { InstagramIcon, YouTubeIcon, FacebookIcon } from '@/components/icons/PlatformIcons';

import { ChartCard } from '@/components/dashboard/ChartCard';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '', supported: true },
  { id: 'youtube', name: 'YouTube', icon: YouTubeIcon, color: '', supported: true },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon, color: '', supported: true },
];

export default function Settings() {
  const { connectedPlatforms, togglePlatform, theme, setTheme } = useSettingsStore();
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [instagramSyncResult, setInstagramSyncResult] = useState<{ posts: number; comments: number; username: string } | null>(null);
  const [ytHandle, setYtHandle] = useState('');
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [ytSyncResult, setYtSyncResult] = useState<{ videos: number; comments: number; title: string } | null>(null);
  const [isConnectingFacebook, setIsConnectingFacebook] = useState(false);
  const [fbSyncResult, setFbSyncResult] = useState<{ posts: number; comments: number; pageName: string } | null>(null);
  const [notifMilestones, setNotifMilestones] = useState(true);
  const [notifDigest, setNotifDigest] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(false);

  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleConnectInstagram = async () => {
    if (!user) { toast({ title: 'Please sign in', description: 'You need to be signed in to connect your Instagram account.', variant: 'destructive' }); return; }
    setIsConnectingInstagram(true);
    setInstagramSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-instagram');
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setInstagramSyncResult({ posts: data.imported?.posts || 0, comments: data.imported?.comments || 0, username: data.account?.username || 'Unknown' });
      if (!connectedPlatforms.includes('instagram')) togglePlatform('instagram');
      toast({ title: 'Instagram connected!', description: `Imported ${data.imported?.posts || 0} posts and ${data.imported?.comments || 0} comments from @${data.account?.username}` });
    } catch (error) {
      toast({ title: 'Connection failed', description: error instanceof Error ? error.message : 'Failed to connect Instagram', variant: 'destructive' });
    } finally { setIsConnectingInstagram(false); }
  };

  const handleConnectYouTube = async () => {
    if (!user) { toast({ title: 'Please sign in', variant: 'destructive' }); return; }
    if (!ytHandle.trim()) { toast({ title: 'Enter a channel identifier', description: 'Use @handle, channel ID (UC...), username, or a YouTube channel URL.', variant: 'destructive' }); return; }
    setIsConnectingYouTube(true);
    setYtSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube', { body: { channel_handle: ytHandle.trim() } });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setYtSyncResult({ videos: data.imported?.videos || 0, comments: data.imported?.comments || 0, title: data.channel?.title || ytHandle });
      if (!connectedPlatforms.includes('youtube')) togglePlatform('youtube');
      toast({ title: 'YouTube connected!', description: `Imported ${data.imported?.videos || 0} videos and ${data.imported?.comments || 0} comments` });
    } catch (error) {
      toast({ title: 'Connection failed', description: error instanceof Error ? error.message : 'Failed to connect YouTube', variant: 'destructive' });
    } finally { setIsConnectingYouTube(false); }
  };

  const handleConnectFacebook = async () => {
    if (!user) { toast({ title: 'Please sign in', variant: 'destructive' }); return; }
    setIsConnectingFacebook(true);
    setFbSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-facebook');
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setFbSyncResult({ posts: data.imported?.posts || 0, comments: data.imported?.comments || 0, pageName: data.page?.name || 'Facebook Page' });
      if (!connectedPlatforms.includes('facebook')) togglePlatform('facebook');
      toast({ title: 'Facebook connected!', description: `Imported ${data.imported?.posts || 0} posts and ${data.imported?.comments || 0} comments` });
    } catch (error) {
      toast({ title: 'Connection failed', description: error instanceof Error ? error.message : 'Failed to connect Facebook', variant: 'destructive' });
    } finally { setIsConnectingFacebook(false); }
  };

  const handlePlatformClick = (platformId: string, supported: boolean) => {
    if (platformId === 'instagram' && supported) handleConnectInstagram();
    else if (platformId === 'youtube') return;
    else if (platformId === 'facebook' && supported) handleConnectFacebook();
    else if (!supported) toast({ title: 'Coming soon', description: `${platformId.charAt(0).toUpperCase() + platformId.slice(1)} integration is coming soon!` });
    else togglePlatform(platformId);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'You have been signed out successfully.' });
  };

  const handleExportData = () => {
    toast({ title: 'Export started', description: 'Your data export is being prepared. This may take a moment.' });
  };

  return (
    <>
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">Manage your account, platforms, and preferences.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ChartCard title="Profile" subtitle="Your account information" delay={0.1}>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-foreground truncate">{user?.user_metadata?.full_name || 'User'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground truncate">{user?.email || 'No email'}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs border-chart-sentiment-positive/30 text-chart-sentiment-positive bg-chart-sentiment-positive/10">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</span>
              </div>
            </div>
          </ChartCard>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <ChartCard title="Appearance" subtitle="Customize the look and feel" delay={0.15}>
            <div className="mt-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-primary" />}
                  <div>
                    <Label htmlFor="theme-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </Label>
                    <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === 'light'}
                  onCheckedChange={(checked) => setTheme(checked ? 'light' : 'dark')}
                />
              </div>
            </div>
          </ChartCard>
        </motion.div>

        {/* Connected Platforms */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <ChartCard title="Connected Platforms" subtitle="Connect your social media accounts to import analytics data" delay={0.2}>
            <div className="mt-4 space-y-3">
              {platforms.map((platform, index) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                const isLoading = (platform.id === 'instagram' && isConnectingInstagram) || (platform.id === 'youtube' && isConnectingYouTube) || (platform.id === 'facebook' && isConnectingFacebook);

                return (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                    whileHover={platform.id !== 'youtube' ? { scale: 1.01 } : undefined}
                    onClick={() => !isLoading && handlePlatformClick(platform.id, platform.supported)}
                    className={cn(
                      'p-5 rounded-xl border transition-all relative',
                      platform.id !== 'youtube' && 'cursor-pointer',
                      isConnected ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20 hover:border-primary/20 hover:bg-primary/5',
                      isLoading && 'pointer-events-none'
                    )}
                  >
                    {isLoading && (
                      <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center z-10">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Connecting to {platform.name}...</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn('p-3 rounded-xl', isConnected ? 'bg-primary/10' : 'bg-muted/50')}>
                          <platform.icon className={cn('h-7 w-7', isConnected ? platform.color : 'text-muted-foreground')} />
                        </div>
                        <div>
                          <h3 className={cn('text-base font-semibold', isConnected ? 'text-foreground' : 'text-muted-foreground')}>{platform.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {isConnected ? 'Connected and syncing data' : platform.id === 'youtube' ? 'Enter your channel handle below' : 'Click to connect your account'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn('text-xs', isConnected ? 'border-chart-sentiment-positive/30 text-chart-sentiment-positive bg-chart-sentiment-positive/10' : 'border-primary/30 text-primary')}>
                        {isConnected ? (<><Wifi className="h-3.5 w-3.5 mr-1" />Connected</>) : 'Connect'}
                      </Badge>
                    </div>

                    {platform.id === 'youtube' && (
                      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input placeholder="@YourChannel, UC..., username, or YouTube URL" value={ytHandle} onChange={(e) => setYtHandle(e.target.value)} className="flex-1" onKeyDown={(e) => e.key === 'Enter' && handleConnectYouTube()} />
                        <Button onClick={handleConnectYouTube} disabled={isConnectingYouTube || !ytHandle.trim()}>
                          {isConnectingYouTube ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sync'}
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Sync Results */}
            {[
              instagramSyncResult && { label: `@${instagramSyncResult.username}`, detail: `${instagramSyncResult.posts} posts and ${instagramSyncResult.comments} comments` },
              ytSyncResult && { label: ytSyncResult.title, detail: `${ytSyncResult.videos} videos and ${ytSyncResult.comments} comments` },
              fbSyncResult && { label: fbSyncResult.pageName, detail: `${fbSyncResult.posts} posts and ${fbSyncResult.comments} comments` },
            ].filter(Boolean).map((result, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20">
                <div className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-chart-sentiment-positive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Synced {result!.label}</p>
                    <p className="text-xs text-muted-foreground">Imported {result!.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-5 p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Twitter, LinkedIn, and TikTok integrations are in development.</p>
              </div>
            </motion.div>
          </ChartCard>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ChartCard title="Notifications" subtitle="Control what alerts you receive" delay={0.25}>
            <div className="mt-4 space-y-4">
              {[
                { id: 'milestones', label: 'Follower Milestones', desc: 'Get notified when you hit follower milestones', icon: TrendingUp, checked: notifMilestones, onChange: setNotifMilestones },
                { id: 'digest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your analytics', icon: Mail, checked: notifDigest, onChange: setNotifDigest },
                { id: 'alerts', label: 'Engagement Alerts', desc: 'Alert when a post gets unusual engagement', icon: Bell, checked: notifAlerts, onChange: setNotifAlerts },
              ].map((n) => (
                <div key={n.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-center gap-3">
                    <n.icon className="h-4 w-4 text-primary" />
                    <div>
                      <Label htmlFor={n.id} className="text-sm font-medium text-foreground cursor-pointer">{n.label}</Label>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                  </div>
                  <Switch id={n.id} checked={n.checked} onCheckedChange={n.onChange} />
                </div>
              ))}
            </div>
          </ChartCard>
        </motion.div>

        {/* Data Management */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <ChartCard title="Data Management" subtitle="Export or manage your analytics data" delay={0.3}>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50">
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Export All Data</p>
                    <p className="text-xs text-muted-foreground">Download all your analytics data as CSV</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Clear Analytics Data</p>
                    <p className="text-xs text-muted-foreground">Remove all imported posts, comments, and metrics</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
              </div>
            </div>
          </ChartCard>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ChartCard title="Account" subtitle="Manage your account settings" delay={0.35}>
            <div className="mt-4">
              <Separator className="mb-4" />
              <Button variant="outline" onClick={handleSignOut} className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </ChartCard>
        </motion.div>
      </div>
    </>
  );
}
