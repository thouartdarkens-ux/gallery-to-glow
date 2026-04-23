import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, MessageSquare, Megaphone, BarChart3, Settings,
  ChevronLeft, ChevronRight, Users, Phone, Wallet, LogOut, MessageCircle,
  Bell, Inbox, Shield, Hash, Wrench, UserCog, BookOpen, Home, Utensils, Coins, IdCard, ClipboardList,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { canAccessPath, ROLE_LABEL_MAP } from "@/lib/roles";
import { useRolePageAccess, applyOverrides } from "@/hooks/useRolePageAccess";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/students", icon: GraduationCap, label: "Students" },
  { to: "/messaging", icon: MessageSquare, label: "SMS" },
  { to: "/sms-inbox", icon: Inbox, label: "SMS Inbox" },
  { to: "/whatsapp", icon: MessageCircle, label: "WhatsApp" },
  { to: "/voice", icon: Phone, label: "Voice Calls" },
  { to: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { to: "/contacts", icon: Users, label: "Contacts" },
  { to: "/reminders", icon: Bell, label: "Reminders" },
  { to: "/fees", icon: Coins, label: "Fees" },
  { to: "/billing", icon: Wallet, label: "Billing" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/ussd", icon: Hash, label: "USSD" },
  { to: "/audit-logs", icon: Shield, label: "Audit Logs" },
  { to: "/settings", icon: Settings, label: "Settings" },
  // Setup pages
  { to: "/setup/academic", icon: BookOpen, label: "Academic Setup" },
  { to: "/setup/domestic", icon: Utensils, label: "Domestic Setup" },
  { to: "/setup/admin", icon: Home, label: "Admin Setup" },
  { to: "/user-management", icon: UserCog, label: "User Management" },
  { to: "/staff-details", icon: IdCard, label: "Staff Details" },
  { to: "/my-classes", icon: ClipboardList, label: "My Classes" },
  { to: "/my-account", icon: Users, label: "My Account" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { data: roles } = useUserRole();
  const { data: overrides = [] } = useRolePageAccess();

  const userRoles = roles || [];
  const visibleItems = navItems.filter((item) =>
    applyOverrides(item.to, userRoles, overrides, canAccessPath(item.to, userRoles))
  );

  // Get primary role label
  const primaryRole = userRoles[0];
  const roleLabel = primaryRole ? ROLE_LABEL_MAP[primaryRole] || primaryRole : "";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 z-50 ${
        collapsed ? "w-[70px]" : "w-[240px]"
      }`}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg text-sidebar-primary-foreground truncate">
            SchoolConnect
          </span>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto sidebar-scroll">
        {visibleItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2 space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2">
            <p className="text-xs text-sidebar-muted truncate">{user.email}</p>
            {roleLabel && (
              <p className="text-xs text-sidebar-primary font-medium truncate mt-0.5">{roleLabel}</p>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={signOut}
            className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <ThemeToggle />
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </aside>
  );
}
