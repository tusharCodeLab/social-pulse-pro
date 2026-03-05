import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Youtube,
  Facebook,
  Check,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { ChartCard } from '@/components/dashboard/ChartCard';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E4405F]', supported: true },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-[#FF0000]', supported: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-[#1877F2]', supported: true },
];

export default function Settings() {
  const { connectedPlatforms, togglePlatform } = useSettingsStore();
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [instagramSyncResult, setInstagramSyncResult] = useState<{
    posts: number;
    comments: number;
    username: string;
  } | null>(null);

  // YouTube state
  const [ytHandle, setYtHandle] = useState('');
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [ytSyncResult, setYtSyncResult] = useState<{
    videos: number;
    comments: number;
    title: string;
  } | null>(null);

  // Facebook state
  const [isConnectingFacebook, setIsConnectingFacebook] = useState(false);
  const [fbSyncResult, setFbSyncResult] = useState<{
    posts: number;
    comments: number;
    pageName: string;
  } | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnectInstagram = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to connect your Instagram account.', variant: 'destructive' });
      return;
    }
    setIsConnectingInstagram(true);
    setInstagramSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-instagram');
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setInstagramSyncResult({
        posts: data.imported?.posts || 0,
        comments: data.imported?.comments || 0,
        username: data.account?.username || 'Unknown',
      });
      if (!connectedPlatforms.includes('instagram')) togglePlatform('instagram');
      toast({ title: 'Instagram connected!', description: `Imported ${data.imported?.posts || 0} posts and ${data.imported?.comments || 0} comments from @${data.account?.username}` });
    } catch (error) {
      console.error('Instagram connection error:', error);
      toast({ title: 'Connection failed', description: error instanceof Error ? error.message : 'Failed to connect Instagram', variant: 'destructive' });
    } finally {
      setIsConnectingInstagram(false);
    }
  };

  const handleConnectYouTube = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in.', variant: 'destructive' });
      return;
    }
    if (!ytHandle.trim()) {
      toast({ title: 'Enter a channel identifier', description: 'Use @handle, channel ID (UC...), username, or a YouTube channel URL.', variant: 'destructive' });
      return;
    }
    setIsConnectingYouTube(true);
    setYtSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-youtube', {
        body: { channel_handle: ytHandle.trim() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setYtSyncResult({
        videos: data.imported?.videos || 0,
        comments: data.imported?.comments || 0,
        title: data.channel?.title || ytHandle,
      });
      if (!connectedPlatforms.includes('youtube')) togglePlatform('youtube');
      toast({ title: 'YouTube connected!', description: `Imported ${data.imported?.videos || 0} videos and ${data.imported?.comments || 0} comments from ${data.channel?.title}` });
    } catch (error) {
      console.error('YouTube connection error:', error);
      toast({ title: 'Connection failed', description: error instanceof Error ? error.message : 'Failed to connect YouTube', variant: 'destructive' });
    } finally {
      setIsConnectingYouTube(false);
    }
  };

  const handleConnectFacebook = async () => {
    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in.', variant: 'destructive' });
      return;
    }
    setIsConnectingFacebook(true);
    setFbSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-facebook');
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      setFbSyncResult({
        posts: data.imported?.posts || 0,
        comments: data.imported?.comments || 0,
        pageName: data.page?.name || 'Facebook Page',
      });
      if (!connectedPlatforms.includes('facebook')) togglePlatform('facebook');
      toast({ title: 'Facebook connected!', description: `Imported ${data.imported?.posts || 0} posts and ${data.imported?.comments || 0} comments from ${data.page?.name}` });
    } catch (error) {
      console.error('Facebook connection error:', error);
      toast({ title: 'Connection failed', description: error instanceof Error ? error.message : 'Failed to connect Facebook', variant: 'destructive' });
    } finally {
      setIsConnectingFacebook(false);
    }
  };

  const handlePlatformClick = (platformId: string, supported: boolean) => {
    if (platformId === 'instagram' && supported) {
      handleConnectInstagram();
    } else if (platformId === 'youtube') {
      return;
    } else if (platformId === 'facebook' && supported) {
      handleConnectFacebook();
    } else if (!supported) {
      toast({ title: 'Coming soon', description: `${platformId.charAt(0).toUpperCase() + platformId.slice(1)} integration is coming soon!` });
    } else {
      togglePlatform(platformId);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="flex items-center justify-between">
          <div>
            <motion.h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>Settings</motion.h1>
            <motion.p className="text-muted-foreground" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Connect your social media accounts to start analyzing performance.</motion.p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Connected Platforms */}
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
                  whileHover={platform.id !== 'youtube' ? { scale: 1.02 } : undefined}
                  onClick={() => !isLoading && handlePlatformClick(platform.id, platform.supported)}
                  className={cn(
                    'p-6 rounded-xl border transition-all relative',
                    platform.id !== 'youtube' && 'cursor-pointer',
                    isConnected ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-primary hover:bg-primary/5',
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
                      <div className={cn('p-3 rounded-xl', isConnected ? 'bg-primary/20' : 'bg-muted')}>
                        <platform.icon className={cn('h-8 w-8', isConnected ? platform.color : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <h3 className={cn('text-lg font-semibold', isConnected ? 'text-foreground' : 'text-muted-foreground')}>{platform.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {isConnected ? 'Connected and syncing data' : platform.id === 'youtube' ? 'Enter your channel handle below' : 'Click to connect your account'}
                        </p>
                      </div>
                    </div>
                    <span className={cn('px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2', isConnected ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive' : 'bg-primary/10 text-primary')}>
                      {isConnected ? (<><Wifi className="h-4 w-4" />Connected</>) : 'Connect'}
                    </span>
                  </div>

                  {/* YouTube handle input */}
                  {platform.id === 'youtube' && (
                    <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="@YourChannel, UC..., username, or YouTube URL"
                        value={ytHandle}
                        onChange={(e) => setYtHandle(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === 'Enter' && handleConnectYouTube()}
                      />
                      <Button onClick={handleConnectYouTube} disabled={isConnectingYouTube || !ytHandle.trim()}>
                        {isConnectingYouTube ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sync'}
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Instagram sync result */}
          {instagramSyncResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-chart-sentiment-positive/20"><Check className="h-5 w-5 text-chart-sentiment-positive" /></div>
                <div>
                  <p className="font-medium text-foreground">Successfully synced @{instagramSyncResult.username}</p>
                  <p className="text-sm text-muted-foreground">Imported {instagramSyncResult.posts} posts and {instagramSyncResult.comments} comments</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* YouTube sync result */}
          {ytSyncResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-chart-sentiment-positive/20"><Check className="h-5 w-5 text-chart-sentiment-positive" /></div>
                <div>
                  <p className="font-medium text-foreground">Successfully synced {ytSyncResult.title}</p>
                  <p className="text-sm text-muted-foreground">Imported {ytSyncResult.videos} videos and {ytSyncResult.comments} comments</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Facebook sync result */}
          {fbSyncResult && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-chart-sentiment-positive/20"><Check className="h-5 w-5 text-chart-sentiment-positive" /></div>
                <div>
                  <p className="font-medium text-foreground">Successfully synced {fbSyncResult.pageName}</p>
                  <p className="text-sm text-muted-foreground">Imported {fbSyncResult.posts} posts and {fbSyncResult.comments} comments</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Coming soon note */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">More platforms coming soon</p>
                <p className="text-xs text-muted-foreground">Twitter, Facebook, LinkedIn, and TikTok integrations are in development.</p>
              </div>
            </div>
          </motion.div>
        </ChartCard>
      </div>
    </>
  );
}
