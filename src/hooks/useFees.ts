import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export interface FeeRecord {
  id: string;
  student_id: string;
  academic_year: string;
  term: string;
  total_fee: number;
  amount_paid: number;
  balance: number;
  status: "paid" | "owing" | "partial" | "scholarship" | "free_shs";
  notes?: string | null;
  updated_at: string;
  student?: {
    id: string;
    name: string;
    student_id: string;
    residency?: string;
    is_scholarship?: boolean;
    is_free_shs?: boolean;
    classes?: { name: string } | null;
  };
}

export function useFeeRecords(filters?: { academic_year?: string; term?: string; status?: string }) {
  return useQuery({
    queryKey: ["fee-records", filters],
    queryFn: async () => {
      let q = sb
        .from("fee_records")
        .select(`*, student:students(id, name, student_id, residency, is_scholarship, is_free_shs, classes(name))`)
        .order("updated_at", { ascending: false });
      if (filters?.academic_year) q = q.eq("academic_year", filters.academic_year);
      if (filters?.term) q = q.eq("term", filters.term);
      if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as FeeRecord[];
    },
  });
}

export function useUpsertFeeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      student_id: string;
      academic_year: string;
      term: string;
      total_fee: number;
      amount_paid: number;
      notes?: string;
    }) => {
      const payload = {
        student_id: input.student_id,
        academic_year: input.academic_year,
        term: input.term,
        total_fee: input.total_fee,
        amount_paid: input.amount_paid,
        notes: input.notes || null,
      };
      const { data, error } = await sb
        .from("fee_records")
        .upsert(payload, { onConflict: "student_id,academic_year,term" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-records"] });
      qc.invalidateQueries({ queryKey: ["fee-summary"] });
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      student_id: string;
      fee_record_id: string;
      amount: number;
      reference?: string;
      current_paid: number;
    }) => {
      // Update the fee record's amount_paid
      const { error: updateErr } = await sb
        .from("fee_records")
        .update({ amount_paid: input.current_paid + input.amount })
        .eq("id", input.fee_record_id);
      if (updateErr) throw updateErr;

      // Log payment event (will trigger SMS via cron later)
      const { data: { user } } = await supabase.auth.getUser();
      const { error: eventErr } = await sb.from("payment_events").insert({
        student_id: input.student_id,
        fee_record_id: input.fee_record_id,
        amount: input.amount,
        reference: input.reference || null,
        recorded_by: user?.id,
      });
      if (eventErr) throw eventErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-records"] });
      qc.invalidateQueries({ queryKey: ["payment-events"] });
    },
  });
}

export function useDeleteFeeRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("fee_records").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["fee-records"] }),
  });
}

export function useFeeSummary(academic_year?: string, term?: string) {
  return useQuery({
    queryKey: ["fee-summary", academic_year, term],
    queryFn: async () => {
      let q = sb.from("fee_records").select("status, total_fee, amount_paid, balance");
      if (academic_year) q = q.eq("academic_year", academic_year);
      if (term) q = q.eq("term", term);
      const { data, error } = await q;
      if (error) throw error;
      const rows = (data || []) as any[];
      return {
        totalStudents: rows.length,
        totalBilled: rows.reduce((s, r) => s + Number(r.total_fee || 0), 0),
        totalCollected: rows.reduce((s, r) => s + Number(r.amount_paid || 0), 0),
        totalOutstanding: rows.reduce((s, r) => s + Number(r.balance || 0), 0),
        paidCount: rows.filter((r) => r.status === "paid").length,
        owingCount: rows.filter((r) => r.status === "owing" || r.status === "partial").length,
        scholarshipCount: rows.filter((r) => r.status === "scholarship" || r.status === "free_shs").length,
      };
    },
  });
}
