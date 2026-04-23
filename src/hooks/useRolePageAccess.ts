import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/roles";

export interface RolePageAccessRow {
  id: string;
  role: AppRole;
  path: string;
  allowed: boolean;
}

export function useRolePageAccess() {
  return useQuery({
    queryKey: ["role-page-access"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("role_page_access")
        .select("id, role, path, allowed");
      if (error) throw error;
      return (data || []) as RolePageAccessRow[];
    },
    staleTime: 30_000,
  });
}

/** Merge DB overrides on top of default canAccessPath result. */
export function applyOverrides(
  path: string,
  userRoles: AppRole[],
  overrides: RolePageAccessRow[],
  defaultAllowed: boolean
): boolean {
  const relevant = overrides.filter(
    (o) => o.path === path && userRoles.includes(o.role)
  );
  if (relevant.length === 0) return defaultAllowed;
  // If ANY of the user's roles is explicitly allowed → allow.
  // Else if ALL relevant entries are explicitly denied → deny.
  if (relevant.some((o) => o.allowed)) return true;
  return false;
}
