import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useVoiceBroadcasts() {
  return useQuery({
    queryKey: ["voice-broadcasts"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("voice_broadcasts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useAddVoiceBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: {
      title: string;
      audio_url?: string;
      target_type: string;
      target_value?: string;
      status?: string;
      scheduled_at?: string | null;
    }) => {
      const { data, error } = await sb.from("voice_broadcasts").insert(b).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voice-broadcasts"] }),
  });
}
