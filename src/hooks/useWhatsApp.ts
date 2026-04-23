import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useWhatsAppMessages() {
  return useQuery({
    queryKey: ["whatsapp-messages"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useSendWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (msg: { recipient_phone: string; recipient_name?: string; body: string; media_url?: string }) => {
      const { data, error } = await sb.from("whatsapp_messages").insert({
        ...msg,
        direction: "outbound",
        status: "pending",
      }).select().single();
      if (error) throw error;
      // Trigger edge function to actually send
      try {
        await supabase.functions.invoke("send-whatsapp", { body: { message_id: data.id } });
      } catch (e) {
        console.error("WhatsApp send error:", e);
      }
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-messages"] }),
  });
}
