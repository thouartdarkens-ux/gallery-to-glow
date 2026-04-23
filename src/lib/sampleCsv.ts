/**
 * Provides downloadable sample CSV templates so users know how to format
 * their data before importing.
 */

type SampleType = "students" | "contacts" | "fees";

const SAMPLES: Record<SampleType, { headers: string[]; rows: string[][]; note?: string }> = {
  students: {
    headers: ["name", "program", "class", "parent_name", "parent_phone", "residency", "status"],
    rows: [
      ["Kwame Mensah", "General Arts", "Form 1A", "Ama Mensah", "0241234567", "Day", "Active"],
      ["Akua Boateng", "Science", "Form 2B", "Kofi Boateng", "0551112233", "Boarding", "Active"],
      ["Yaw Owusu", "Business", "Form 3C", "Esi Owusu", "0209998877", "Day", "Active"],
    ],
    note: "Student IDs and 6-digit PINs are generated automatically — leave them out.",
  },
  contacts: {
    headers: ["name", "phone", "segment", "tag", "location"],
    rows: [
      ["Mr. Asante", "0244112233", "parent", "PTA", "Accra"],
      ["Mrs. Tetteh", "0207788991", "staff", "Teacher", "Kasoa"],
      ["Old Student Ben", "0556677889", "alumni", "Alumni", "Kumasi"],
    ],
  },
  fees: {
    headers: ["student_id", "term", "academic_year", "total_fee", "amount_paid"],
    rows: [
      ["ICK/GA/26/0001", "Term 1", "2025/2026", "1500", "500"],
      ["ICK/SC/26/0002", "Term 1", "2025/2026", "1800", "1800"],
      ["ICK/BUS/26/0003", "Term 1", "2025/2026", "1500", "0"],
    ],
    note: "student_id must match an existing student exactly (e.g. ICK/GA/26/0001).",
  },
};

export function downloadSampleCsv(type: SampleType) {
  const sample = SAMPLES[type];
  if (!sample) return;
  const lines = [sample.headers.join(",")];
  sample.rows.forEach((r) => {
    lines.push(r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sample-${type}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function getSampleNote(type: SampleType): string | undefined {
  return SAMPLES[type]?.note;
}
