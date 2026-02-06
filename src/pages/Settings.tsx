import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Upload,
  Download,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Video,
  Check,
  X,
  FileUp,
  AlertCircle,
  Sparkles,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const platforms = [
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-[#1DA1F2]', supported: false },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-[#E4405F]', supported: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-[#1877F2]', supported: false },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-[#0A66C2]', supported: false },
  { id: 'tiktok', name: 'TikTok', icon: Video, color: 'text-foreground', supported: false },
];

export default function Settings() {
  const { demoMode, setDemoMode, connectedPlatforms, togglePlatform } = useSettingsStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [instagramSyncResult, setInstagramSyncResult] = useState<{
    posts: number;
    comments: number;
    username: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
      setIsUploading(true);
      
      // Simulate upload
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: 'File uploaded successfully',
          description: `${file.name} has been processed for analytics.`,
        });
      }, 2000);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
        return;
      }
      setUploadedFile(file);
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        toast({
          title: 'File uploaded successfully',
          description: `${file.name} has been processed for analytics.`,
        });
      }, 2000);
    }
  };

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

      // Turn off demo mode since we have real data
      if (demoMode) {
        setDemoMode(false);
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
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Configure your dashboard preferences, data sources, and integrations.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demo Mode */}
        <ChartCard title="Demo Mode" subtitle="Toggle between demo and live data" delay={0.1}>
          <div className="flex items-center justify-between mt-4 p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                demoMode ? 'bg-primary/10' : 'bg-muted'
              )}>
                <Sparkles className={cn('h-5 w-5', demoMode ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div>
                <p className="font-medium text-foreground">Demo Mode</p>
                <p className="text-sm text-muted-foreground">
                  {demoMode ? 'Using sample data for demonstration' : 'Using live data from connected platforms'}
                </p>
              </div>
            </div>
            <Switch
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
          </div>
          {demoMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs text-primary">
                  Demo mode is active. All data shown is simulated for demonstration purposes.
                </p>
              </div>
            </motion.div>
          )}
        </ChartCard>

        {/* CSV Upload */}
        <ChartCard title="Data Import" subtitle="Upload CSV files for analytics processing" delay={0.15}>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'mt-4 p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer',
              'hover:border-primary hover:bg-primary/5',
              isUploading ? 'border-primary bg-primary/5' : 'border-border'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-center">
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Upload className="h-10 w-10 text-primary mx-auto mb-3" />
                </motion.div>
              ) : (
                <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              )}
              <p className="text-sm font-medium text-foreground mb-1">
                {isUploading ? 'Processing file...' : 'Drop your CSV file here'}
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse
              </p>
              {uploadedFile && !isUploading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-primary">
                  <Check className="h-4 w-4" />
                  <span>{uploadedFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Connected Platforms */}
        <ChartCard
          title="Connected Platforms"
          subtitle="Manage your social media integrations"
          delay={0.2}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            {platforms.map((platform, index) => {
              const isConnected = connectedPlatforms.includes(platform.id);
              const isInstagramConnecting = platform.id === 'instagram' && isConnectingInstagram;
              
              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => !isInstagramConnecting && handlePlatformClick(platform.id, platform.supported)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all relative',
                    isConnected
                      ? 'border-primary bg-primary/10'
                      : platform.supported
                        ? 'border-border bg-muted/30 hover:border-primary hover:bg-primary/5'
                        : 'border-border bg-muted/30 hover:border-muted-foreground opacity-60',
                    isInstagramConnecting && 'pointer-events-none'
                  )}
                >
                  {/* Loading overlay for Instagram */}
                  {isInstagramConnecting && (
                    <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center z-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center text-center">
                    <platform.icon className={cn('h-8 w-8 mb-2', isConnected ? platform.color : 'text-muted-foreground')} />
                    <span className={cn('text-sm font-medium', isConnected ? 'text-foreground' : 'text-muted-foreground')}>
                      {platform.name}
                    </span>
                    
                    {platform.supported ? (
                      <span className={cn(
                        'text-xs mt-1 px-2 py-0.5 rounded-full flex items-center gap-1',
                        isConnected
                          ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive'
                          : 'bg-primary/10 text-primary'
                      )}>
                        {isConnected ? (
                          <>
                            <Wifi className="h-3 w-3" />
                            Connected
                          </>
                        ) : (
                          'Click to connect'
                        )}
                      </span>
                    ) : (
                      <span className="text-xs mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                        <WifiOff className="h-3 w-3" />
                        Coming soon
                      </span>
                    )}
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
        </ChartCard>

        {/* Export Settings */}
        <ChartCard title="Data Export" subtitle="Download your analytics data" delay={0.3}>
          <div className="space-y-3 mt-4">
            {[
              { label: 'Engagement Data', description: 'Export all engagement metrics' },
              { label: 'Audience Data', description: 'Export demographic information' },
              { label: 'Sentiment Analysis', description: 'Export sentiment reports' },
              { label: 'Full Report', description: 'Export complete analytics package' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </motion.div>
            ))}
          </div>
        </ChartCard>

        {/* Notification Preferences */}
        <ChartCard title="Notifications" subtitle="Configure alert preferences" delay={0.35}>
          <div className="space-y-4 mt-4">
            {[
              { label: 'Sentiment Alerts', description: 'Get notified of significant sentiment changes' },
              { label: 'Engagement Spikes', description: 'Alert when posts go viral' },
              { label: 'Weekly Summary', description: 'Receive weekly performance digest' },
              { label: 'Report Ready', description: 'Notify when scheduled reports are ready' },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Switch defaultChecked={index < 2} />
              </motion.div>
            ))}
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
