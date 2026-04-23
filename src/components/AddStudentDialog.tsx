import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useClasses } from "@/hooks/useClasses";
import { useAcademicYear } from "@/hooks/useSchoolSettings";
import { useDepartments } from "@/hooks/useDepartments";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (student: {
    name: string;
    class_id: string | null;
    program: string;
    department_id: string | null;
    parent_name: string;
    parent_phone: string;
    parent_phone_secondary?: string;
    residency: "Day" | "Boarding";
    is_scholarship: boolean;
    is_free_shs: boolean;
    academic_year: string;
    tags: string[];
  }) => void;
}

export default function AddStudentDialog({ open, onOpenChange, onAdd }: Props) {
  const { data: classes } = useClasses();
  const { data: departments } = useDepartments();
  const globalYear = useAcademicYear();
  const [form, setForm] = useState({
    name: "", class_id: "", department_id: "",
    parentName: "", parentPhone: "", parentPhoneSecondary: "",
    residency: "Day" as "Day" | "Boarding",
    is_scholarship: false,
    is_free_shs: false,
    academic_year: "",
  });

  const effectiveYear = form.academic_year || globalYear;

  const reset = () => setForm({
    name: "", class_id: "", department_id: "",
    parentName: "", parentPhone: "", parentPhoneSecondary: "",
    residency: "Day", is_scholarship: false, is_free_shs: false,
    academic_year: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dept = (departments || []).find((d) => d.id === form.department_id);
    onAdd({
      name: form.name.trim(),
      class_id: form.class_id || null,
      program: dept?.name || "",
      department_id: form.department_id || null,
      parent_name: form.parentName.trim(),
      parent_phone: form.parentPhone.trim(),
      parent_phone_secondary: form.parentPhoneSecondary.trim() || undefined,
      residency: form.residency,
      is_scholarship: form.is_scholarship,
      is_free_shs: form.is_free_shs,
      academic_year: effectiveYear,
      tags: [],
    });
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-md bg-muted/40 border border-border px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Student ID & 6-digit PIN</span> are generated automatically (e.g. <span className="font-mono">ICK/GA/26/0001</span>).
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Full Name *</Label>
              <Input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Class *</Label>
              <select required value={form.class_id}
                onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select class</option>
                {(classes || []).map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Programme *</Label>
              <select required value={form.department_id}
                onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Select programme</option>
                {(departments || []).map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
              {(departments || []).length === 0 && (
                <p className="text-[11px] text-muted-foreground">Add programmes in Academic Setup first.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Residency *</Label>
              <select value={form.residency}
                onChange={(e) => setForm({ ...form, residency: e.target.value as "Day" | "Boarding" })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="Day">Day</option>
                <option value="Boarding">Boarding</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year</Label>
              <Input
                placeholder={globalYear}
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                maxLength={9}
              />
              <p className="text-[11px] text-muted-foreground">
                Default: {globalYear}. Override if different.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Parent Name *</Label>
              <Input required maxLength={100} value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Primary Phone *</Label>
              <Input required maxLength={20} placeholder="0551234567" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Secondary Phone</Label>
              <Input maxLength={20} placeholder="Optional" value={form.parentPhoneSecondary} onChange={(e) => setForm({ ...form, parentPhoneSecondary: e.target.value })} />
            </div>
          </div>

          <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Fee Status</p>
            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Scholarship Student</Label>
                <p className="text-xs text-muted-foreground">Auto-marked as fully paid</p>
              </div>
              <Switch checked={form.is_scholarship} onCheckedChange={(v) => setForm({ ...form, is_scholarship: v, is_free_shs: v ? false : form.is_free_shs })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="cursor-pointer">Free SHS</Label>
                <p className="text-xs text-muted-foreground">Government-sponsored, auto-paid</p>
              </div>
              <Switch checked={form.is_free_shs} onCheckedChange={(v) => setForm({ ...form, is_free_shs: v, is_scholarship: v ? false : form.is_scholarship })} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Add Student</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
