import { useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { useHasAnyRole } from "@/hooks/useUserRole";
import { ADMIN_ROLES, ALL_ROLES, ROLE_LABEL_MAP, NAV_PERMISSIONS, canAccessPath, type AppRole } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRolePageAccess, type RolePageAccessRow } from "@/hooks/useRolePageAccess";

const PAGE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/students": "Students",
  "/messaging": "SMS",
  "/sms-inbox": "SMS Inbox",
  "/whatsapp": "WhatsApp",
  "/voice": "Voice Calls",
  "/campaigns": "Campaigns",
  "/contacts": "Contacts",
  "/reminders": "Reminders",
  "/fees": "Fees",
  "/billing": "Billing",
  "/reports": "Reports",
  "/ussd": "USSD",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
  "/setup/academic": "Academic Setup",
  "/setup/domestic": "Domestic Setup",
  "/setup/admin": "Admin Setup",
  "/user-management": "User Management",
  "/my-account": "My Account",
  "/staff-details": "Staff Details",
};

export default function StaffDetails() {
  const hasAccess = useHasAnyRole(ADMIN_ROLES);
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [search, setSearch] = useState("");

  const { data: overrides = [] } = useRolePageAccess();

  // Staff list for selected role (so admin sees who is affected)
  const { data: staffByRole = [] } = useQuery({
    queryKey: ["staff-by-role", selectedRole],
    enabled: !!selectedRole,
    queryFn: async () => {
      const { data: rolesData } = await (supabase as any)
        .from("user_roles")
        .select("user_id")
        .eq("role", selectedRole);
      const ids = (rolesData || []).map((r: any) => r.user_id);
      if (ids.length === 0) return [];
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", ids);
      return profiles || [];
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ role, path, allowed }: { role: AppRole; path: string; allowed: boolean }) => {
      const { error } = await (supabase as any)
        .from("role_page_access")
        .upsert({ role, path, allowed }, { onConflict: "role,path" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-page-access"] });
      toast.success("Permission updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: async ({ role, path }: { role: AppRole; path: string }) => {
      const { error } = await (supabase as any)
        .from("role_page_access")
        .delete()
        .eq("role", role)
        .eq("path", path);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role-page-access"] });
      toast.success("Reset to default");
    },
    onError: (e: any) => toast.error(e.message),
  });

  // For each path, compute current access for the selected role
  const rows = useMemo(() => {
    if (!selectedRole) return [];
    return NAV_PERMISSIONS
      .filter((p) =>
        !search ||
        (PAGE_LABELS[p.path] || p.path).toLowerCase().includes(search.toLowerCase()) ||
        p.path.toLowerCase().includes(search.toLowerCase())
      )
      .map((perm) => {
        const override = overrides.find((o) => o.role === selectedRole && o.path === perm.path);
        const defaultAllowed = canAccessPath(perm.path, [selectedRole]);
        const effective = override ? override.allowed : defaultAllowed;
        return {
          path: perm.path,
          label: PAGE_LABELS[perm.path] || perm.path,
          defaultAllowed,
          override,
          effective,
        };
      });
  }, [selectedRole, overrides, search]);

  if (!hasAccess) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Staff Details & Page Access</h1>
          <p className="text-muted-foreground mt-1">
            Choose a staff role and toggle which pages members of that role can access.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Select Role
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a staff role…" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.filter((r) => r.domain !== "legacy").map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Filter pages…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {selectedRole && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-sm text-muted-foreground">Staff with this role:</span>
                {staffByRole.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">None yet</span>
                )}
                {staffByRole.map((s: any) => (
                  <Badge key={s.user_id} variant="secondary">{s.display_name || "Unnamed"}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedRole && (
          <Card>
            <CardHeader>
              <CardTitle>Page Access for {ROLE_LABEL_MAP[selectedRole]}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/40">
                  <div className="col-span-5">Page</div>
                  <div className="col-span-3">Default</div>
                  <div className="col-span-2">Override</div>
                  <div className="col-span-2 text-right">Action</div>
                </div>
                {rows.map((r) => (
                  <div key={r.path} className="grid grid-cols-12 gap-2 px-4 py-3 items-center">
                    <div className="col-span-5">
                      <p className="font-medium text-sm text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.path}</p>
                    </div>
                    <div className="col-span-3">
                      <Badge variant={r.defaultAllowed ? "default" : "outline"}>
                        {r.defaultAllowed ? "Allowed" : "Denied"}
                      </Badge>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <Switch
                        checked={r.effective}
                        onCheckedChange={(checked) =>
                          upsertMutation.mutate({ role: selectedRole as AppRole, path: r.path, allowed: checked })
                        }
                      />
                      <span className="text-xs text-muted-foreground">
                        {r.override ? (r.override.allowed ? "On" : "Off") : "Default"}
                      </span>
                    </div>
                    <div className="col-span-2 text-right">
                      {r.override && (
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={() => resetMutation.mutate({ role: selectedRole as AppRole, path: r.path })}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
