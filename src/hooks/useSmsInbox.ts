import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useSmsInbox() {
  return useQuery({
    queryKey: ["sms-inbox"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("sms_inbox")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("sms_inbox").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sms-inbox"] }),
  });
}

export function useReplyToSms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reply_body }: { id: string; reply_body: string }) => {
      const { error } = await sb.from("sms_inbox").update({
        replied: true,
        reply_body,
        replied_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sms-inbox"] }),
  });
}
