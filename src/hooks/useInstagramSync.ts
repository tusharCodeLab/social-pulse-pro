// Hook for automatic Instagram data synchronization
// Uses Supabase Realtime + Background polling to keep data fresh

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from './useSocialApi';
import { toast } from 'sonner';

const SYNC_INTERVAL_MS = 10 * 60 * 1000; // Poll every 10 minutes to avoid Facebook API rate limits
const MIN_SYNC_INTERVAL_MS = 5 * 60 * 1000; // Minimum 5 minutes between syncs
const RATE_LIMIT_BACKOFF_MS = 15 * 60 * 1000; // Back off 15 minutes on rate limit

export function useInstagramSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const lastSyncRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rateLimitedRef = useRef<boolean>(false);

  // Trigger Instagram data fetch from the edge function
  const syncInstagramData = useCallback(async (showToast = false) => {
    if (!user) return;

    // If rate limited, skip entirely
    if (rateLimitedRef.current) {
      console.log('[InstagramSync] Skipping sync - rate limited, waiting for backoff');
      return;
    }

    // Prevent too frequent syncs
    const now = Date.now();
    if (now - lastSyncRef.current < MIN_SYNC_INTERVAL_MS) {
      console.log('[InstagramSync] Skipping sync - too soon since last sync');
      return;
    }
    lastSyncRef.current = now;

    try {
      // Refresh session to ensure a valid JWT is sent
      const { data: { session } } = await supabase.auth.refreshSession();
      if (!session) {
        console.log('[InstagramSync] No valid session after refresh, skipping sync');
        return;
      }

      console.log('[InstagramSync] Triggering Instagram data sync...');
      
      const { data, error } = await supabase.functions.invoke('fetch-instagram', {
        body: { user_id: user.id },
      });

      if (error) {
        console.error('[InstagramSync] Sync error:', error);
        // Check if rate limited - back off significantly
        if (error.message?.includes('429') || error.message?.includes('rate limit')) {
          console.log('[InstagramSync] Rate limited - backing off for 15 minutes');
          rateLimitedRef.current = true;
          setTimeout(() => {
            rateLimitedRef.current = false;
            console.log('[InstagramSync] Rate limit backoff expired, resuming syncs');
          }, RATE_LIMIT_BACKOFF_MS);
        }
        return;
      }

      if (data?.success === false || data?.error) {
        console.warn('[InstagramSync] Sync skipped:', data?.reason || data?.error || 'Unknown reason');

        if (showToast) {
          toast.warning(
            data?.hint || 'Instagram is not linked to a Facebook Page yet. Link it first, then sync again.'
          );
        }
        return;
      }

      console.log('[InstagramSync] Sync completed:', data);

      // Invalidate all related queries to refresh UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.posts() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.postStats }),
        queryClient.invalidateQueries({ queryKey: queryKeys.comments() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary }),
        queryClient.invalidateQueries({ queryKey: queryKeys.audienceSummary }),
      ]);

      if (showToast && data?.imported?.posts > 0) {
        toast.success(`Synced ${data.imported.posts} posts from Instagram`);
      }
    } catch (err) {
      console.error('[InstagramSync] Failed to sync:', err);
    }
  }, [user, queryClient]);

  // Set up Realtime subscriptions for instant UI updates
  useEffect(() => {
    if (!user) return;

    console.log('[InstagramSync] Setting up Realtime subscriptions...');

    // Subscribe to posts table changes
    const postsChannel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          console.log('[InstagramSync] Posts change detected:', payload.eventType);
          // Immediately invalidate posts queries when DB changes
          queryClient.invalidateQueries({ queryKey: queryKeys.posts() });
          queryClient.invalidateQueries({ queryKey: queryKeys.postStats });
          queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
        }
      )
      .subscribe((status) => {
        console.log('[InstagramSync] Posts channel status:', status);
      });

    // Subscribe to social_accounts table changes
    const accountsChannel = supabase
      .channel('accounts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_accounts',
        },
        (payload) => {
          console.log('[InstagramSync] Accounts change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
          queryClient.invalidateQueries({ queryKey: queryKeys.audienceSummary });
        }
      )
      .subscribe((status) => {
        console.log('[InstagramSync] Accounts channel status:', status);
      });

    // Subscribe to comments table changes
    const commentsChannel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        (payload) => {
          console.log('[InstagramSync] Comments change detected:', payload.eventType);
          queryClient.invalidateQueries({ queryKey: queryKeys.comments() });
          queryClient.invalidateQueries({ queryKey: queryKeys.sentimentStats });
        }
      )
      .subscribe((status) => {
        console.log('[InstagramSync] Comments channel status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[InstagramSync] Cleaning up Realtime subscriptions...');
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(accountsChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, queryClient]);

  // Set up background polling interval
  useEffect(() => {
    if (!user) return;

    console.log('[InstagramSync] Starting background polling...');

    // Verify session is valid before initial sync
    const checkAndSync = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('[InstagramSync] No valid session, skipping sync');
        return;
      }
      syncInstagramData(false);
    };

    checkAndSync();

    // Set up recurring sync
    syncIntervalRef.current = setInterval(() => {
      syncInstagramData(false);
    }, SYNC_INTERVAL_MS);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [user, syncInstagramData]);

  return {
    syncNow: () => syncInstagramData(true),
  };
}
