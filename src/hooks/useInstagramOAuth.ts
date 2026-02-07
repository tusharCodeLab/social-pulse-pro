import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InstagramConnectionStatus {
  connected: boolean;
  instagram_username?: string;
  instagram_user_id?: string;
  expires_at?: string;
  is_expired?: boolean;
  days_until_expiry?: number;
  last_updated?: string;
}

interface UseInstagramOAuthReturn {
  connectionStatus: InstagramConnectionStatus | null;
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  isDisconnecting: boolean;
  error: string | null;
  startOAuthFlow: () => Promise<void>;
  handleOAuthCallback: (code: string) => Promise<boolean>;
  disconnectInstagram: () => Promise<void>;
  syncInstagramData: () => Promise<{ success: boolean; posts?: number; comments?: number }>;
  refreshToken: () => Promise<void>;
  checkConnectionStatus: () => Promise<void>;
}

export function useInstagramOAuth(): UseInstagramOAuthReturn {
  const { user, session } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<InstagramConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRedirectUri = useCallback(() => {
    return `${window.location.origin}/settings`;
  }, []);

  const checkConnectionStatus = useCallback(async () => {
    if (!user || !session) {
      setConnectionStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check connection status');
      }

      const statusData = await response.json();
      setConnectionStatus(statusData);
    } catch (err) {
      console.error('Error checking Instagram connection status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check connection status');
      setConnectionStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  }, [user, session]);

  const startOAuthFlow = useCallback(async () => {
    if (!user || !session) {
      setError('Please sign in to connect Instagram');
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const redirectUri = getRedirectUri();
      const state = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-auth?action=authorize&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start OAuth flow');
      }

      const { auth_url } = await response.json();
      
      // Redirect to Facebook OAuth
      window.location.href = auth_url;
    } catch (err) {
      console.error('Error starting OAuth flow:', err);
      setError(err instanceof Error ? err.message : 'Failed to start OAuth flow');
      setIsConnecting(false);
    }
  }, [user, session, getRedirectUri]);

  const handleOAuthCallback = useCallback(async (code: string): Promise<boolean> => {
    if (!user || !session) {
      setError('Please sign in to complete Instagram connection');
      return false;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const redirectUri = getRedirectUri();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-auth?action=callback&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete OAuth flow');
      }

      const result = await response.json();
      
      // Update connection status
      setConnectionStatus({
        connected: true,
        instagram_username: result.instagram_username,
        instagram_user_id: result.instagram_user_id,
        expires_at: result.expires_at,
        is_expired: false,
      });

      return true;
    } catch (err) {
      console.error('Error handling OAuth callback:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete OAuth flow');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [user, session, getRedirectUri]);

  const disconnectInstagram = useCallback(async () => {
    if (!user || !session) {
      setError('Please sign in to disconnect Instagram');
      return;
    }

    try {
      setIsDisconnecting(true);
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-auth?action=disconnect`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Instagram');
      }

      setConnectionStatus({ connected: false });
    } catch (err) {
      console.error('Error disconnecting Instagram:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect Instagram');
    } finally {
      setIsDisconnecting(false);
    }
  }, [user, session]);

  const syncInstagramData = useCallback(async () => {
    if (!user || !session) {
      setError('Please sign in to sync Instagram data');
      return { success: false };
    }

    try {
      setIsSyncing(true);
      setError(null);

      const { data, error: syncError } = await supabase.functions.invoke('fetch-instagram', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (syncError) {
        throw syncError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      return {
        success: true,
        posts: data.imported?.posts || 0,
        comments: data.imported?.comments || 0,
      };
    } catch (err) {
      console.error('Error syncing Instagram data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync Instagram data');
      return { success: false };
    } finally {
      setIsSyncing(false);
    }
  }, [user, session]);

  const refreshToken = useCallback(async () => {
    if (!user || !session) {
      setError('Please sign in to refresh token');
      return;
    }

    try {
      setError(null);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-auth?action=refresh`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refresh token');
      }

      // Refresh connection status
      await checkConnectionStatus();
    } catch (err) {
      console.error('Error refreshing token:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh token');
    }
  }, [user, session, checkConnectionStatus]);

  // Check connection status on mount and when user changes
  useEffect(() => {
    checkConnectionStatus();
  }, [checkConnectionStatus]);

  // Handle OAuth callback from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const errorParam = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || errorParam);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code && user && session) {
      handleOAuthCallback(code).then((success) => {
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (success) {
          // Auto-sync after successful connection
          syncInstagramData();
        }
      });
    }
  }, [user, session]); // Only run when user/session changes, not on every render

  return {
    connectionStatus,
    isLoading,
    isConnecting,
    isSyncing,
    isDisconnecting,
    error,
    startOAuthFlow,
    handleOAuthCallback,
    disconnectInstagram,
    syncInstagramData,
    refreshToken,
    checkConnectionStatus,
  };
}
