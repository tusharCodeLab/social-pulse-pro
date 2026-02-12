import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Instagram,
  Check,
  Loader2,
  Wifi,
  WifiOff,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { AddProfileDialog } from '@/components/dashboard/AddProfileDialog';
import { useSettingsStore } from '@/stores/settingsStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialAccounts, useDeleteSocialAccount } from '@/hooks/useSocialAccounts';
import { useQueryClient } from '@tanstack/react-query';

export default function Settings() {
  const { connectedPlatforms, togglePlatform } = useSettingsStore();
  const [syncingAccountId, setSyncingAccountId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: accounts, isLoading: accountsLoading } = useSocialAccounts();
  const deleteAccount = useDeleteSocialAccount();
  const queryClient = useQueryClient();

  const instagramAccounts = (accounts || []).filter(a => a.platform === 'instagram');

  const handleSyncAccount = async (accountId: string) => {
    if (!user) return;
    setSyncingAccountId(accountId);

    try {
      // Find the token for this account
      const { data: tokens } = await supabase
        .from('instagram_tokens')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      const tokenId = tokens?.[0]?.id;

      const { data, error } = await supabase.functions.invoke('fetch-instagram', {
        body: tokenId ? { token_id: tokenId } : {},
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: 'Sync complete!',
        description: `Synced ${data.imported?.posts || 0} posts from @${data.account?.username}`,
      });

      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      if (!connectedPlatforms.includes('instagram')) {
        togglePlatform('instagram');
      }
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync',
        variant: 'destructive',
      });
    } finally {
      setSyncingAccountId(null);
    }
  };

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    try {
      await deleteAccount.mutateAsync(accountId);
      toast({
        title: 'Profile removed',
        description: `Disconnected ${accountName}`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove profile',
        variant: 'destructive',
      });
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
        >
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
            Manage your connected Instagram profiles and analytics.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Connected Profiles */}
        <ChartCard
          title="Instagram Profiles"
          subtitle="Connect multiple Instagram accounts to analyze their performance"
          delay={0.2}
        >
          <div className="mt-4 flex justify-end">
            <AddProfileDialog />
          </div>

          <div className="mt-4 space-y-3">
            {accountsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : instagramAccounts.length === 0 ? (
              <div className="text-center py-8">
                <Instagram className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No profiles connected yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click "Add Profile" to connect your first Instagram account.
                </p>
              </div>
            ) : (
              instagramAccounts.map((account, index) => {
                const isSyncing = syncingAccountId === account.id;
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={cn(
                      'p-4 rounded-xl border transition-all',
                      account.is_connected
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-muted/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2.5 rounded-xl',
                          account.is_connected ? 'bg-primary/20' : 'bg-muted'
                        )}>
                          <Instagram className={cn(
                            'h-6 w-6',
                            account.is_connected ? 'text-[#E4405F]' : 'text-muted-foreground'
                          )} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {account.account_handle || account.account_name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {(account.followers_count || 0).toLocaleString()} followers
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5',
                          account.is_connected
                            ? 'bg-chart-sentiment-positive/10 text-chart-sentiment-positive'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          {account.is_connected ? (
                            <>
                              <Wifi className="h-3 w-3" />
                              Connected
                            </>
                          ) : (
                            <>
                              <WifiOff className="h-3 w-3" />
                              Disconnected
                            </>
                          )}
                        </span>

                        <button
                          onClick={() => handleSyncAccount(account.id)}
                          disabled={isSyncing}
                          className="p-2 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                          title="Sync data"
                        >
                          {isSyncing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(account.id, account.account_handle || account.account_name)}
                          disabled={deleteAccount.isPending}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          title="Remove profile"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

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
