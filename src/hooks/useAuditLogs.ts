import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const sb = supabase as any;

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as any[];
    },
  });
}

export function useLogAction() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: { action: string; entity_type: string; entity_id?: string; details?: Record<string, any> }) => {
      if (!user) return;
      const { error } = await sb.from("audit_logs").insert({
        user_id: user.id,
        ...log,
      });
      if (error) console.error("Audit log error:", error);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audit-logs"] }),
  });
}
