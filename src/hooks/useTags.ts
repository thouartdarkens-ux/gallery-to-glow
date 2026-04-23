import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export function useTags() {
  return useQuery({
    queryKey: ["student_tags_distinct"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("student_tags")
        .select("tag");
      if (error) throw error;
      const uniq = Array.from(new Set((data || []).map((t: any) => t.tag).filter(Boolean))).sort();
      return uniq as string[];
    },
  });
}
