import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AppRole } from "@/lib/roles";

export type { AppRole };

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data || []).map((r: any) => r.role as AppRole);
    },
  });
}

export function useHasRole(role: AppRole) {
  const { data: roles } = useUserRole();
  return roles?.includes(role) ?? false;
}

export function useHasAnyRole(checkRoles: AppRole[]) {
  const { data: roles } = useUserRole();
  return roles?.some((r) => checkRoles.includes(r)) ?? false;
}
