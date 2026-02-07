// Hook for automatic Instagram data synchronization
// Uses Supabase Realtime + Background polling to keep data fresh

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from './useSocialApi';
import { toast } from 'sonner';

const SYNC_INTERVAL_MS = 15000; // Poll every 15 seconds for new Instagram data
const MIN_SYNC_INTERVAL_MS = 10000; // Minimum 10 seconds between syncs

export function useInstagramSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const lastSyncRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger Instagram data fetch from the edge function
  const syncInstagramData = useCallback(async (showToast = false) => {
    if (!user) return;

    // Prevent too frequent syncs
    const now = Date.now();
    if (now - lastSyncRef.current < MIN_SYNC_INTERVAL_MS) {
      console.log('[InstagramSync] Skipping sync - too soon since last sync');
      return;
    }
    lastSyncRef.current = now;

    try {
      console.log('[InstagramSync] Triggering Instagram data sync...');
      
      const { data, error } = await supabase.functions.invoke('fetch-instagram', {
        body: { user_id: user.id },
      });

      if (error) {
        console.error('[InstagramSync] Sync error:', error);
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

    // Initial sync when user logs in
    syncInstagramData(false);

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
