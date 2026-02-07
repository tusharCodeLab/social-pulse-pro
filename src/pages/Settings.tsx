import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Check,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useInstagramOAuth } from '@/hooks/useInstagramOAuth';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    connectionStatus,
    isLoading,
    isConnecting,
    isSyncing,
    isDisconnecting,
    error,
    startOAuthFlow,
    disconnectInstagram,
    syncInstagramData,
    refreshToken,
  } = useInstagramOAuth();

  const handleConnectInstagram = async () => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be signed in to connect your Instagram account.',
        variant: 'destructive',
      });
      return;
    }

    await startOAuthFlow();
  };

  const handleSyncData = async () => {
    const result = await syncInstagramData();
    if (result.success) {
      toast({
        title: 'Sync complete!',
        description: `Imported ${result.posts} posts and ${result.comments} comments.`,
      });
    } else {
      toast({
        title: 'Sync failed',
        description: error || 'Failed to sync Instagram data',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnectInstagram();
    toast({
      title: 'Disconnected',
      description: 'Your Instagram account has been disconnected.',
    });
  };

  const handleRefreshToken = async () => {
    await refreshToken();
    toast({
      title: 'Token refreshed',
      description: 'Your Instagram connection has been refreshed.',
    });
  };

  const isConnected = connectionStatus?.connected ?? false;
  const isExpiringSoon = connectionStatus?.days_until_expiry !== undefined && 
    connectionStatus.days_until_expiry <= 7 && 
    connectionStatus.days_until_expiry > 0;

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

      <div className="max-w-2xl space-y-6">
        {/* Connected Platforms */}
        <ChartCard
          title="Connected Platforms"
          subtitle="Connect your social media accounts to import analytics data"
          delay={0.2}
        >
          <div className="mt-4">
            {/* Instagram Connection Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={cn(
                'p-6 rounded-xl border transition-all relative',
                isConnected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30'
              )}
            >
              {/* Loading overlay */}
              {(isConnecting || isLoading) && (
                <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center z-10">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {isConnecting ? 'Connecting to Instagram...' : 'Loading...'}
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'p-3 rounded-xl',
                    isConnected ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <Instagram className={cn('h-8 w-8', isConnected ? 'text-[#E4405F]' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <h3 className={cn('text-lg font-semibold', isConnected ? 'text-foreground' : 'text-muted-foreground')}>
                      Instagram
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnected 
                        ? `Connected as @${connectionStatus?.instagram_username}`
                        : 'Click to connect your account'
                      }
                    </p>
                  </div>
                </div>
                
                {!isConnected ? (
                  <Button
                    onClick={handleConnectInstagram}
                    disabled={isConnecting || !user}
                    className="gap-2"
                  >
                    Connect
                  </Button>
                ) : (
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 bg-chart-sentiment-positive/10 text-chart-sentiment-positive">
                    <Wifi className="h-4 w-4" />
                    Connected
                  </span>
                )}
              </div>

              {/* Connected account actions */}
              {isConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-border"
                >
                  {/* Token expiry warning */}
                  {connectionStatus?.is_expired && (
                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Token expired</p>
                        <p className="text-xs text-muted-foreground">Please reconnect your Instagram account</p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={handleConnectInstagram}>
                        Reconnect
                      </Button>
                    </div>
                  )}

                  {isExpiringSoon && !connectionStatus?.is_expired && (
                    <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-yellow-600">Token expiring soon</p>
                        <p className="text-xs text-muted-foreground">
                          Expires in {connectionStatus?.days_until_expiry} days
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={handleRefreshToken}>
                        Refresh
                      </Button>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncData}
                      disabled={isSyncing}
                      className="gap-2"
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                      {isSyncing ? 'Syncing...' : 'Sync Data'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isDisconnecting}
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          {isDisconnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <LogOut className="h-4 w-4" />
                          )}
                          Disconnect
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Disconnect Instagram?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove your Instagram connection. Your existing data will remain, but you won't receive new updates until you reconnect.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDisconnect}>
                            Disconnect
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Last sync info */}
                  {connectionStatus?.last_updated && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Last updated: {new Date(connectionStatus.last_updated).toLocaleString()}
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Connection Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
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

        {/* OAuth Info Card */}
        <ChartCard
          title="How it works"
          subtitle="Secure Instagram connection using OAuth"
          delay={0.3}
        >
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">1</div>
              <p>Click "Connect" to securely log in with your Facebook account</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">2</div>
              <p>Grant permission to access your Instagram Business/Creator account</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">3</div>
              <p>Your data syncs automatically and tokens refresh every 60 days</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Instagram integration requires a Business or Creator account linked to a Facebook Page. 
              Personal Instagram accounts are not supported by the Instagram API.
            </p>
          </div>
        </ChartCard>
      </div>
    </DashboardLayout>
  );
}
