import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useWallet() {
  return useQuery({
    queryKey: ["sms-wallet"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("sms_wallet")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as { id: string; balance: number; currency: string; updated_at: string };
    },
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("wallet_transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as any[];
    },
  });
}
