import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Check,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E4405F]', supported: true },
];

export default function Settings() {
  const { connectedPlatforms, togglePlatform } = useSettingsStore();
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [instagramSyncResult, setInstagramSyncResult] = useState<{
    posts: number;
    comments: number;
    username: string;
  } | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnectInstagram = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to connect your Instagram account.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnectingInstagram(true);
    setInstagramSyncResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-instagram');
      
      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setInstagramSyncResult({
        posts: data.imported?.posts || 0,
        comments: data.imported?.comments || 0,
        username: data.account?.username || 'Unknown',
      });

      // Update the connected platforms store
      if (!connectedPlatforms.includes('instagram')) {
        togglePlatform('instagram');
      }

      toast({
        title: 'Instagram connected!',
        description: `Imported ${data.imported?.posts || 0} posts and ${data.imported?.comments || 0} comments from @${data.account?.username}`,
      });

    } catch (error) {
      console.error('Instagram connection error:', error);
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect Instagram',
        variant: 'destructive',
      });
    } finally {
      setIsConnectingInstagram(false);
    }
  };

  const handlePlatformClick = (platformId: string, supported: boolean) => {
    if (platformId === 'instagram' && supported) {
      handleConnectInstagram();
    } else if (!supported) {
      toast({
        title: 'Coming soon',
        description: `${platformId.charAt(0).toUpperCase() + platformId.slice(1)} integration is coming soon!`,
      });
    } else {
      togglePlatform(platformId);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          <div>
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Settings
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Connect your Instagram account to start analyzing your social media performance.
            </motion.p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-2xl">
        {/* Connected Platforms */}
        <ChartCard
          title="Connected Platforms"
          subtitle="Connect your social media accounts to import analytics data"
          delay={0.2}
        >
          <div className="mt-4">
            {platforms.map((platform, index) => {
              const isConnected = connectedPlatforms.includes(platform.id);
              const isInstagramConnecting = platform.id === 'instagram' && isConnectingInstagram;
              
              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => !isInstagramConnecting && handlePlatformClick(platform.id, platform.supported)}
                  className={cn(
                    'p-6 rounded-xl border cursor-pointer transition-all relative',
                    isConnected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/30 hover:border-primary hover:bg-primary/5',
                    isInstagramConnecting && 'pointer-events-none'
                  )}
                >
                  {/* Loading overlay */}
                  {isInstagramConnecting && (
                    <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center z-10">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Connecting to Instagram...</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'p-3 rounded-xl',
                        isConnected ? 'bg-primary/20' : 'bg-muted'
                      )}>
                        <platform.icon className={cn('h-8 w-8', isConnected ? platform.color : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <h3 className={cn('text-lg font-semibold', isConnected ? 'text-foreground' : 'text-muted-foreground')}>
                          {platform.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {isConnected ? 'Connected and syncing data' : 'Click to connect your account'}
                        </p>
                      </div>
                    </div>
                    
                    <span className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2',
                      isConnected
                        ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive'
                        : 'bg-primary/10 text-primary'
                    )}>
                      {isConnected ? (
                        <>
                          <Wifi className="h-4 w-4" />
                          Connected
                        </>
                      ) : (
                        'Connect'
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Instagram sync result */}
          {instagramSyncResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-chart-sentiment-positive/10 border border-chart-sentiment-positive/20"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-chart-sentiment-positive/20">
                  <Check className="h-5 w-5 text-chart-sentiment-positive" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Successfully synced @{instagramSyncResult.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Imported {instagramSyncResult.posts} posts and {instagramSyncResult.comments} comments
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Coming soon note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 p-4 rounded-lg bg-muted/30 border border-border"
          >
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">More platforms coming soon</p>
                <p className="text-xs text-muted-foreground">
                  Twitter, Facebook, LinkedIn, and TikTok integrations are in development.
                </p>
              </div>
            </div>
          </motion.div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
