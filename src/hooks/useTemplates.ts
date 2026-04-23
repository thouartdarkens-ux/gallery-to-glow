import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useTemplates() {
  return useQuery({
    queryKey: ["sms_templates"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("sms_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: { name: string; body: string }) => {
      const { data, error } = await sb.from("sms_templates").insert(t).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sms_templates"] }),
  });
}
