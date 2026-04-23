import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("classes")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useAddClass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cls: { name: string; level: string; section?: string; academic_year?: string }) => {
      const { data, error } = await (supabase as any).from("classes").insert(cls).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
}
