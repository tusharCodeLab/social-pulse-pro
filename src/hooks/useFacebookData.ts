import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useFacebookAccount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["facebook-account", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("platform", "facebook")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useFacebookPosts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["facebook-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .eq("platform", "facebook")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useFacebookComments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["facebook-comments", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: posts } = await supabase
        .from("posts")
        .select("id")
        .eq("platform", "facebook");
      if (!posts || posts.length === 0) return [];
      const postIds = posts.map(p => p.id);
      const { data, error } = await supabase
        .from("post_comments")
        .select("*")
        .in("post_id", postIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}
