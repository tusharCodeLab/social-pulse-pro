import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CalendarItem {
  id: string;
  user_id: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string;
  content_type: string;
  title: string;
  caption: string | null;
  hashtags: string[] | null;
  status: string;
  ai_score: number | null;
  ai_reasoning: string | null;
  is_ai_generated: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useCalendarItems(startDate?: string, endDate?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["content-calendar", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("content_calendar")
        .select("*")
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (startDate) query = query.gte("scheduled_date", startDate);
      if (endDate) query = query.lte("scheduled_date", endDate);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CalendarItem[];
    },
    enabled: !!user,
  });
}

export function useGenerateCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-content-calendar");
      if (error) throw error;
      return data as { success: boolean; count: number; items: any[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
    },
  });
}

export function useUpdateCalendarItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CalendarItem> }) => {
      const { data, error } = await supabase
        .from("content_calendar")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
    },
  });
}

export function useDeleteCalendarItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_calendar")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-calendar"] });
    },
  });
}
