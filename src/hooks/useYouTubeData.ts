import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useYouTubeAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['youtube-account', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('platform', 'youtube')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useYouTubeVideos() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['youtube-videos', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('platform', 'youtube')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useYouTubeComments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['youtube-comments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*, posts!inner(platform)')
        .eq('user_id', user!.id)
        .eq('posts.platform', 'youtube')
        .order('created_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useYouTubeAudienceMetrics() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['youtube-audience-metrics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audience_metrics')
        .select('*')
        .eq('user_id', user!.id)
        .eq('platform', 'youtube')
        .order('date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
