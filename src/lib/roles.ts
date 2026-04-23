// All GES staff roles with labels and domain grouping
export type AppRole =
  | "super_admin" | "school_admin" | "accounts" | "marketing"
  | "headmaster" | "asst_head_academic" | "asst_head_admin" | "asst_head_domestic"
  | "senior_housemaster" | "hod" | "subject_teacher" | "form_master"
  | "guidance_counselor" | "library_officer" | "lab_technician" | "housemaster"
  | "chaplain" | "bursar" | "internal_auditor" | "school_secretary"
  | "supply_officer" | "ict_coordinator" | "technical_officer" | "domestic_bursar"
  | "chief_cook" | "assistant_cook" | "pantry_steward" | "security_officer"
  | "school_driver" | "general_labourer";

export interface RoleMeta {
  value: AppRole;
  label: string;
  domain: "admin" | "academic" | "domestic" | "support" | "legacy";
}

export const ALL_ROLES: RoleMeta[] = [
  // Legacy (kept for backward compat)
  { value: "super_admin", label: "Super Admin", domain: "legacy" },
  { value: "school_admin", label: "School Admin", domain: "legacy" },
  { value: "accounts", label: "Accounts", domain: "legacy" },
  { value: "marketing", label: "Marketing", domain: "legacy" },
  // Admin domain
  { value: "headmaster", label: "Headmaster / Headmistress", domain: "admin" },
  { value: "asst_head_academic", label: "Asst. Head (Academic)", domain: "admin" },
  { value: "asst_head_admin", label: "Asst. Head (Administration)", domain: "admin" },
  { value: "asst_head_domestic", label: "Asst. Head (Domestic)", domain: "admin" },
  // Academic domain
  { value: "senior_housemaster", label: "Senior Housemaster", domain: "academic" },
  { value: "hod", label: "Head of Department", domain: "academic" },
  { value: "subject_teacher", label: "Subject Teacher", domain: "academic" },
  { value: "form_master", label: "Form Master / Mistress", domain: "academic" },
  { value: "guidance_counselor", label: "Guidance & Counseling", domain: "academic" },
  { value: "library_officer", label: "Library Officer", domain: "academic" },
  { value: "lab_technician", label: "Laboratory Technician", domain: "academic" },
  { value: "housemaster", label: "Housemaster / Housemistress", domain: "academic" },
  { value: "chaplain", label: "Chaplain / Imam", domain: "academic" },
  // Support domain
  { value: "bursar", label: "Bursar / Accountant", domain: "support" },
  { value: "internal_auditor", label: "Internal Auditor", domain: "support" },
  { value: "school_secretary", label: "School Secretary", domain: "support" },
  { value: "supply_officer", label: "Supply Officer / Storekeeper", domain: "support" },
  { value: "ict_coordinator", label: "ICT Coordinator / SysAdmin", domain: "support" },
  { value: "technical_officer", label: "Technical Officer", domain: "support" },
  // Domestic domain
  { value: "domestic_bursar", label: "Domestic Bursar (Matron)", domain: "domestic" },
  { value: "chief_cook", label: "Chief Cook", domain: "domestic" },
  { value: "assistant_cook", label: "Assistant Cook", domain: "domestic" },
  { value: "pantry_steward", label: "Pantry Hand / Steward", domain: "domestic" },
  { value: "security_officer", label: "Security Officer", domain: "domestic" },
  { value: "school_driver", label: "School Driver", domain: "domestic" },
  { value: "general_labourer", label: "General Labourer / Cleaner", domain: "domestic" },
];

export const ROLE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  ALL_ROLES.map((r) => [r.value, r.label])
);

// Admin roles that can access the full system
// Headmaster is the top admin; assistant heads have broad access
export const ADMIN_ROLES: AppRole[] = [
  "headmaster",
  "asst_head_academic", "asst_head_admin", "asst_head_domestic",
];

// Roles that can access academic setup
export const ACADEMIC_ROLES: AppRole[] = [
  ...ADMIN_ROLES, "hod", "subject_teacher", "form_master",
  "guidance_counselor", "library_officer", "lab_technician",
  "housemaster", "senior_housemaster", "chaplain",
];

// Roles that can access domestic setup
export const DOMESTIC_ROLES: AppRole[] = [
  ...ADMIN_ROLES, "domestic_bursar", "chief_cook", "assistant_cook",
  "pantry_steward", "security_officer", "school_driver", "general_labourer",
];

// Roles that can access billing/finance
export const FINANCE_ROLES: AppRole[] = [
  ...ADMIN_ROLES, "bursar", "internal_auditor", "accounts",
];

// Roles that can access messaging/campaigns
export const MESSAGING_ROLES: AppRole[] = [
  ...ADMIN_ROLES, "school_secretary", "ict_coordinator", "marketing",
];

// Which sidebar items each role group can see
export type NavPermission = {
  path: string;
  allowedRoles: AppRole[] | "all";
};

export const NAV_PERMISSIONS: NavPermission[] = [
  { path: "/", allowedRoles: "all" },
  { path: "/my-account", allowedRoles: "all" },
  { path: "/students", allowedRoles: [...ADMIN_ROLES, ...ACADEMIC_ROLES] },
  { path: "/messaging", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/sms-inbox", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/whatsapp", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/voice", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/campaigns", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/contacts", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/reminders", allowedRoles: [...MESSAGING_ROLES] },
  { path: "/billing", allowedRoles: [...FINANCE_ROLES] },
  { path: "/fees", allowedRoles: [...FINANCE_ROLES, "school_secretary"] },
  { path: "/reports", allowedRoles: [...ADMIN_ROLES, ...FINANCE_ROLES] },
  { path: "/ussd", allowedRoles: [...ADMIN_ROLES, "ict_coordinator"] },
  { path: "/audit-logs", allowedRoles: ADMIN_ROLES },
  { path: "/settings", allowedRoles: ADMIN_ROLES },
  { path: "/setup/academic", allowedRoles: ["headmaster", "asst_head_academic"] },
  { path: "/setup/domestic", allowedRoles: ["headmaster", "asst_head_domestic"] },
  { path: "/setup/admin", allowedRoles: ["headmaster", "asst_head_admin"] },
  { path: "/user-management", allowedRoles: ADMIN_ROLES },
  { path: "/staff-details", allowedRoles: ADMIN_ROLES },
];

export function canAccessPath(path: string, userRoles: AppRole[]): boolean {
  const perm = NAV_PERMISSIONS.find((p) => p.path === path);
  if (!perm) return true; // Not restricted
  if (perm.allowedRoles === "all") return true;
  return userRoles.some((r) => (perm.allowedRoles as AppRole[]).includes(r));
}
