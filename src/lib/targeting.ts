// Smart targeting + placeholder substitution helpers
import { supabase } from "@/integrations/supabase/client";

const sb = supabase as any;

export type AudienceFilter = {
  scope: "all" | "class" | "program" | "tag" | "level";
  value?: string;
  residency?: "any" | "Day" | "Boarding";
  feeStatus?: "any" | "owing" | "partial" | "paid" | "scholarship" | "free_shs";
  finalistsOnly?: boolean; // SHS 3 / final-year (current_class_level contains "3")
  academic_year?: string;
  term?: string;
};

export interface Recipient {
  student_id_uuid: string;
  student_code: string;
  student_name: string;
  class_name: string;
  program: string;
  level: string;
  residency: string;
  parent_name: string;
  parent_phone: string;
  parent_phone_secondary: string;
  balance: number;
  total_fee: number;
  amount_paid: number;
  fee_status: string;
  tags: string[];
}

export const PLACEHOLDERS = [
  { token: "{StudentName}", desc: "Student's full name" },
  { token: "{ParentName}", desc: "Parent / guardian name" },
  { token: "{Class}", desc: "Class name (e.g. Form 2A)" },
  { token: "{Program}", desc: "Programme (e.g. Science)" },
  { token: "{Balance}", desc: "Outstanding balance (GHS)" },
  { token: "{Amount}", desc: "Total fee amount (GHS)" },
  { token: "{AmountPaid}", desc: "Amount already paid" },
  { token: "{Term}", desc: "Current term" },
  { token: "{Year}", desc: "Academic year" },
];

export const SAMPLE_RECIPIENT: Recipient = {
  student_id_uuid: "sample",
  student_code: "STU-001",
  student_name: "Ama Mensah",
  class_name: "Form 2A",
  program: "General Science",
  level: "SHS 2",
  residency: "Boarding",
  parent_name: "Mr. Kwame Mensah",
  parent_phone: "+233241234567",
  parent_phone_secondary: "",
  balance: 1250,
  total_fee: 3500,
  amount_paid: 2250,
  fee_status: "partial",
  tags: ["Debtors"],
};

export function applyPlaceholders(template: string, r: Recipient, ctx?: { term?: string; year?: string }): string {
  const fmt = (n: number) => `GHS ${Number(n || 0).toFixed(2)}`;
  const subs: Record<string, string> = {
    "{StudentName}": r.student_name || "",
    "{ParentName}": r.parent_name || "Parent",
    "{Class}": r.class_name || "",
    "{Program}": r.program || "",
    "{Balance}": fmt(r.balance),
    "{Amount}": fmt(r.total_fee),
    "{AmountPaid}": fmt(r.amount_paid),
    "{Term}": ctx?.term || "Term 1",
    "{Year}": ctx?.year || "2025/2026",
  };
  return template.replace(/\{(StudentName|ParentName|Class|Program|Balance|Amount|AmountPaid|Term|Year)\}/g, (m) => subs[m] ?? m);
}

export async function fetchRecipients(filter: AudienceFilter): Promise<Recipient[]> {
  // Pull students with class, parents, tags
  let q = sb
    .from("students")
    .select(`
      id, student_id, name, program, residency, current_class_level,
      classes(name, level),
      parents(name, phone, phone_primary, phone_secondary_2),
      student_tags(tag)
    `)
    .eq("status", "Active");

  if (filter.scope === "class" && filter.value) q = q.eq("class_id", filter.value);
  if (filter.scope === "program" && filter.value) q = q.eq("program", filter.value);
  if (filter.residency && filter.residency !== "any") q = q.eq("residency", filter.residency);

  const { data: students, error } = await q;
  if (error) throw error;

  // Pull fee records for current year/term to attach
  const ay = filter.academic_year || "2025/2026";
  const term = filter.term || "Term 1";
  const { data: fees } = await sb
    .from("fee_records")
    .select("student_id, total_fee, amount_paid, balance, status")
    .eq("academic_year", ay)
    .eq("term", term);

  const feeMap = new Map<string, any>();
  (fees || []).forEach((f: any) => feeMap.set(f.student_id, f));

  let recipients: Recipient[] = (students || []).map((s: any) => {
    const fee = feeMap.get(s.id) || {};
    const parent = s.parents?.[0] || {};
    return {
      student_id_uuid: s.id,
      student_code: s.student_id,
      student_name: s.name,
      class_name: s.classes?.name || "",
      program: s.program || "",
      level: s.classes?.level || s.current_class_level || "",
      residency: s.residency || "Day",
      parent_name: parent.name || "",
      parent_phone: parent.phone_primary || parent.phone || "",
      parent_phone_secondary: parent.phone_secondary_2 || "",
      balance: Number(fee.balance || 0),
      total_fee: Number(fee.total_fee || 0),
      amount_paid: Number(fee.amount_paid || 0),
      fee_status: fee.status || "owing",
      tags: (s.student_tags || []).map((t: any) => t.tag),
    };
  });

  // Tag filter
  if (filter.scope === "tag" && filter.value) {
    recipients = recipients.filter((r) => r.tags.includes(filter.value!));
  }

  // Level filter (e.g. "SHS 3")
  if (filter.scope === "level" && filter.value) {
    recipients = recipients.filter((r) => r.level === filter.value);
  }

  // Fee status
  if (filter.feeStatus && filter.feeStatus !== "any") {
    if (filter.feeStatus === "owing") {
      recipients = recipients.filter((r) => r.fee_status === "owing" || r.fee_status === "partial");
    } else {
      recipients = recipients.filter((r) => r.fee_status === filter.feeStatus);
    }
  }

  // Finalists shortcut
  if (filter.finalistsOnly) {
    recipients = recipients.filter((r) => /3/.test(r.level));
  }

  // Must have a phone to receive SMS
  return recipients.filter((r) => r.parent_phone);
}
