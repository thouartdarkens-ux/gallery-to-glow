import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { canAccessPath, type AppRole } from "@/lib/roles";
import { useRolePageAccess, applyOverrides } from "@/hooks/useRolePageAccess";

interface RoleGuardProps {
  path: string;
  children: React.ReactNode;
}

export default function RoleGuard({ path, children }: RoleGuardProps) {
  const { data: roles, isLoading } = useUserRole();
  const { data: overrides = [], isLoading: loadingOverrides } = useRolePageAccess();

  if (isLoading || loadingOverrides) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const userRoles: AppRole[] = roles || [];

  // If user has no roles yet (new signup), allow dashboard only
  if (userRoles.length === 0 && path === "/") {
    return <>{children}</>;
  }

  const defaultAllowed = canAccessPath(path, userRoles);
  const allowed = applyOverrides(path, userRoles, overrides, defaultAllowed);
  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <div className="text-6xl">🚫</div>
        <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-center max-w-md">
          You don't have permission to access this page. Contact your administrator to request access.
        </p>
        <a href="/" className="text-primary hover:underline text-sm">
          ← Back to Dashboard
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
