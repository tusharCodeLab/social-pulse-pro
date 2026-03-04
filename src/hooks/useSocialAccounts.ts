import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export type SocialPlatform = "instagram" | "twitter" | "facebook" | "linkedin" | "youtube";

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  account_name: string;
  account_handle: string | null;
  profile_image_url: string | null;
  followers_count: number;
  following_count: number;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSocialAccountInput {
  platform: SocialPlatform;
  account_name: string;
  account_handle?: string;
  profile_image_url?: string;
  followers_count?: number;
  following_count?: number;
}

export function useSocialAccounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["social-accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("social_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SocialAccount[];
    },
    enabled: !!user,
  });
}

export function useCreateSocialAccount() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateSocialAccountInput) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("social_accounts")
        .insert({
          user_id: user.id,
          platform: input.platform,
          account_name: input.account_name,
          account_handle: input.account_handle || null,
          profile_image_url: input.profile_image_url || null,
          followers_count: input.followers_count || 0,
          following_count: input.following_count || 0,
          is_connected: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SocialAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
    },
  });
}

export function useDeleteSocialAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("social_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-accounts"] });
    },
  });
}
