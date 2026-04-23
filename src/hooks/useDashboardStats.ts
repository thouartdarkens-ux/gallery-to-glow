import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [students, contacts, messages, campaigns] = await Promise.all([
        sb.from("students").select("id", { count: "exact", head: true }),
        sb.from("contacts").select("id", { count: "exact", head: true }),
        sb.from("messages").select("id, status", { count: "exact", head: false }),
        sb.from("campaigns").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

      const totalStudents = students.count || 0;
      const totalContacts = contacts.count || 0;
      const msgs = messages.data || [];
      const totalMessages = msgs.length;
      const delivered = msgs.filter((m: any) => m.status === "delivered").length;
      const deliveryRate = totalMessages > 0 ? ((delivered / totalMessages) * 100).toFixed(1) : "0";

      return {
        totalStudents,
        totalContacts,
        totalMessages,
        deliveryRate: `${deliveryRate}%`,
        recentCampaigns: campaigns.data || [],
      };
    },
  });
}
