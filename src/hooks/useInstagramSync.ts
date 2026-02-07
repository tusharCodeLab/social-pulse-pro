// Hook for automatic Instagram data synchronization
// Uses Supabase Realtime + Background polling to keep data fresh

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { queryKeys } from './useSocialApi';
import { toast } from 'sonner';

const SYNC_INTERVAL_MS = 60000; // Poll every 60 seconds (reduced from 15s since we now rely on user-initiated syncs)
const MIN_SYNC_INTERVAL_MS = 30000; // Minimum 30 seconds between syncs

export function useInstagramSync() {
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const lastSyncRef = useRef<number>(0);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check if Instagram is connected
  const checkConnection = useCallback(async () => {
    if (!user || !session) {
      setIsConnected(false);
      return false;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-auth?action=status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected === true);
        return data.connected === true;
      }
    } catch (err) {
      console.log('[InstagramSync] Connection check failed:', err);
    }
    
    setIsConnected(false);
    return false;
  }, [user, session]);

  // Trigger Instagram data fetch from the edge function
  const syncInstagramData = useCallback(async (showToast = false) => {
    if (!user || !session) return;

    // Prevent too frequent syncs
    const now = Date.now();
    if (now - lastSyncRef.current < MIN_SYNC_INTERVAL_MS) {
      console.log('[InstagramSync] Skipping sync - too soon since last sync');
      return;
    }

    // Check if connected before syncing
    const connected = await checkConnection();
    if (!connected) {
      console.log('[InstagramSync] Skipping sync - Instagram not connected');
      return;
    }

    lastSyncRef.current = now;

    try {
      console.log('[InstagramSync] Triggering Instagram data sync...');
      
      const { data, error } = await supabase.functions.invoke('fetch-instagram', {
        body: { user_id: user.id },
      });

      if (error) {
        console.log('[InstagramSync] Sync skipped:', error.message);
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
      console.log('[InstagramSync] Failed to sync:', err);
    }
  }, [user, session, queryClient, checkConnection]);

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

  // Check connection on mount and periodically
  useEffect(() => {
    if (!user) return;

    // Initial connection check
    checkConnection();

    // Set up recurring sync (only if connected)
    const interval = setInterval(async () => {
      const connected = await checkConnection();
      if (connected) {
        syncInstagramData(false);
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [user, checkConnection, syncInstagramData]);

  return {
    syncNow: () => syncInstagramData(true),
    isConnected,
    checkConnection,
  };
}
