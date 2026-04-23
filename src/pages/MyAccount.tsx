import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ROLES, ROLE_LABEL_MAP, type AppRole } from "@/lib/roles";
import AppLayout from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, ShieldCheck, ArrowUp, ArrowDown, Mail, Calendar } from "lucide-react";

/**
 * GES school hierarchy – each role maps to its direct supervisor.
 * The Headmaster sits at the top (no supervisor).
 */
const HIERARCHY: Record<AppRole, AppRole | null> = {
  headmaster: null,
  asst_head_academic: "headmaster",
  asst_head_admin: "headmaster",
  asst_head_domestic: "headmaster",
  // Academic domain → reports to Asst Head Academic
  senior_housemaster: "asst_head_academic",
  hod: "asst_head_academic",
  subject_teacher: "hod",
  form_master: "asst_head_academic",
  guidance_counselor: "asst_head_academic",
  library_officer: "asst_head_academic",
  lab_technician: "hod",
  housemaster: "senior_housemaster",
  chaplain: "asst_head_academic",
  // Support domain → reports to Asst Head Admin
  bursar: "asst_head_admin",
  internal_auditor: "asst_head_admin",
  school_secretary: "asst_head_admin",
  supply_officer: "asst_head_admin",
  ict_coordinator: "asst_head_admin",
  technical_officer: "asst_head_admin",
  // Domestic domain → reports to Asst Head Domestic
  domestic_bursar: "asst_head_domestic",
  chief_cook: "domestic_bursar",
  assistant_cook: "chief_cook",
  pantry_steward: "domestic_bursar",
  security_officer: "asst_head_domestic",
  school_driver: "asst_head_domestic",
  general_labourer: "asst_head_domestic",
  // Legacy roles (kept for backward compat, report to headmaster)
  super_admin: null,
  school_admin: "headmaster",
  accounts: "bursar",
  marketing: "asst_head_admin",
};

function getSubordinateRoles(role: AppRole): AppRole[] {
  return (Object.entries(HIERARCHY) as [AppRole, AppRole | null][])
    .filter(([, supervisor]) => supervisor === role)
    .map(([r]) => r);
}

function getSupervisorRole(role: AppRole): AppRole | null {
  return HIERARCHY[role] ?? null;
}

export default function MyAccount() {
  const { user } = useAuth();
  const { data: roles, isLoading: rolesLoading } = useUserRole();

  // Fetch profile info
  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch users who hold subordinate roles
  const subordinateRoles = (roles || []).flatMap(getSubordinateRoles);
  const supervisorRoles = (roles || []).map(getSupervisorRole).filter(Boolean) as AppRole[];

  const { data: subordinates } = useQuery({
    queryKey: ["subordinates", subordinateRoles],
    enabled: subordinateRoles.length > 0,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_roles")
        .select("user_id, role")
        .in("role", subordinateRoles);
      if (!data || data.length === 0) return [];
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds as string[]);
      return data.map((r: any) => ({
        ...r,
        display_name: profiles?.find((p) => p.user_id === r.user_id)?.display_name || "Unknown",
      }));
    },
  });

  const { data: supervisors } = useQuery({
    queryKey: ["supervisors", supervisorRoles],
    enabled: supervisorRoles.length > 0,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("user_roles")
        .select("user_id, role")
        .in("role", supervisorRoles);
      if (!data || data.length === 0) return [];
      const userIds = [...new Set(data.map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds as string[]);
      return data.map((r: any) => ({
        ...r,
        display_name: profiles?.find((p) => p.user_id === r.user_id)?.display_name || "Unknown",
      }));
    },
  });

  const initials = (profile?.display_name || user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const userRoles = roles || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">My Account</h1>

        {/* Profile card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-5">
              <Avatar className="h-16 w-16 text-lg">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {profile?.display_name || "—"}
                </h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </div>
                {profile?.school_name && (
                  <p className="text-sm text-muted-foreground">{profile.school_name}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {new Date(user?.created_at || "").toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
              My Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {rolesLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : userRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No roles assigned yet. Contact the Headmaster.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {userRoles.map((role) => {
                  const meta = ALL_ROLES.find((r) => r.value === role);
                  return (
                    <Badge key={role} variant="secondary" className="text-sm py-1 px-3">
                      {meta?.label || role}
                      <span className="ml-1.5 text-xs text-muted-foreground capitalize">
                        ({meta?.domain})
                      </span>
                    </Badge>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supervisor (above) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowUp className="w-5 h-5 text-amber-500" />
              Reports To
            </CardTitle>
          </CardHeader>
          <CardContent>
            {supervisorRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {userRoles.includes("headmaster") ? "You are at the top of the hierarchy." : "No supervisor defined."}
              </p>
            ) : (supervisors || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Expected supervisor role{supervisorRoles.length > 1 ? "s" : ""}: {supervisorRoles.map((r) => ROLE_LABEL_MAP[r] || r).join(", ")} — not yet assigned to anyone.
              </p>
            ) : (
              <div className="space-y-2">
                {(supervisors || []).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.display_name}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_LABEL_MAP[s.role] || s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subordinates (below) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowDown className="w-5 h-5 text-emerald-500" />
              Staff Under You
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subordinateRoles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subordinate roles for your position.</p>
            ) : (subordinates || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Subordinate role{subordinateRoles.length > 1 ? "s" : ""} ({subordinateRoles.map((r) => ROLE_LABEL_MAP[r] || r).join(", ")}) — not yet assigned to anyone.
              </p>
            ) : (
              <div className="space-y-2">
                {(subordinates || []).map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.display_name}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_LABEL_MAP[s.role] || s.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
