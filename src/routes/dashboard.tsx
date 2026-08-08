import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { clearSession, useSession } from "@/lib/portal-session";

const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: "/dashboard", label: "Overview", end: true },
  { to: "/dashboard/placements", label: "Placements" },
  { to: "/dashboard/records", label: "Student Records" },
  { to: "/dashboard/assignments", label: "Houses & Classes" },
  { to: "/dashboard/documents", label: "Documents & Templates" },
  { to: "/dashboard/institution", label: "Institution & Cycle" },
];

export function DashboardLayout() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === null) navigate("/", { replace: true });
  }, [session, navigate]);

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading portal…
      </div>
    );
  }
  if (session === null) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="kente-band h-1.5 w-full" />
      <header className="border-b border-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-gold">
              MOVASOFT Institutional Portal
            </p>
            <h1 className="text-lg font-bold">{session.school.name}</h1>
            <p className="text-xs text-sidebar-foreground/75">
              {session.school.town} · {session.school.category} · {session.school.school_type} ·
              School ID {session.school.id}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              clearSession();
              navigate("/", { replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
        <nav className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end ?? false}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-gold bg-gold text-gold-foreground shadow-sm"
                    : "border-sidebar-border text-sidebar-foreground/85 hover:border-gold/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
