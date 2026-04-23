import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export interface Department {
  id: string;
  name: string;
  code: string | null;
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("departments")
        .select("id, name, code")
        .order("name");
      if (error) throw error;
      return (data || []) as Department[];
    },
  });
}

// Subjects assigned to a programme (department)
export function useDepartmentSubjects(departmentId?: string | null) {
  return useQuery({
    queryKey: ["department_subjects", departmentId || "none"],
    enabled: !!departmentId,
    queryFn: async () => {
      const { data, error } = await sb
        .from("department_subjects")
        .select("id, subject_id, subjects(id, name, code)")
        .eq("department_id", departmentId);
      if (error) throw error;
      return (data || []).map((r: any) => ({
        id: r.id,
        subject_id: r.subject_id,
        name: r.subjects?.name || "—",
        code: r.subjects?.code || null,
      }));
    },
  });
}

// All programme→subject links (for the academic setup grid)
export function useAllDepartmentSubjects() {
  return useQuery({
    queryKey: ["department_subjects", "all"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("department_subjects")
        .select("id, department_id, subject_id, departments(name), subjects(name, code)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

export function useLinkDepartmentSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { department_id: string; subject_id: string }) => {
      const { error } = await sb.from("department_subjects").insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department_subjects"] }),
  });
}

export function useUnlinkDepartmentSubject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("department_subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["department_subjects"] }),
  });
}
