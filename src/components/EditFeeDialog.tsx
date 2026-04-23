import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertFeeRecord } from "@/hooks/useFees";
import { useStudents } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStudentId?: string | null;
  defaultYear?: string;
  defaultTerm?: string;
}

const TERMS = ["Term 1", "Term 2", "Term 3"];

export default function EditFeeDialog({ open, onOpenChange, defaultStudentId, defaultYear, defaultTerm }: Props) {
  const { toast } = useToast();
  const { data: students = [] } = useStudents();
  const upsert = useUpsertFeeRecord();
  const [form, setForm] = useState({
    student_id: "",
    academic_year: defaultYear || "2025/2026",
    term: defaultTerm || "Term 1",
    total_fee: "",
    amount_paid: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        student_id: defaultStudentId || "",
        academic_year: defaultYear || "2025/2026",
        term: defaultTerm || "Term 1",
        total_fee: "",
        amount_paid: "",
        notes: "",
      });
    }
  }, [open, defaultStudentId, defaultYear, defaultTerm]);

  const selectedStudent = students.find((s) => s.id === form.student_id);
  const isAutoPaid = selectedStudent?.is_scholarship || selectedStudent?.is_free_shs;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_id) {
      toast({ title: "Select a student", variant: "destructive" });
      return;
    }
    const total = parseFloat(form.total_fee);
    const paid = parseFloat(form.amount_paid || "0");
    if (isNaN(total) || total < 0) {
      toast({ title: "Invalid total fee", variant: "destructive" });
      return;
    }
    upsert.mutate(
      {
        student_id: form.student_id,
        academic_year: form.academic_year,
        term: form.term,
        total_fee: total,
        amount_paid: isAutoPaid ? total : paid,
        notes: form.notes,
      },
      {
        onSuccess: () => {
          toast({ title: "Fee record saved" });
          onOpenChange(false);
        },
        onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Add / Update Fee Record</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Student *</Label>
            <select required value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">Select student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.student_id}) — {s.class_name || "No class"}
                </option>
              ))}
            </select>
          </div>
          {isAutoPaid && (
            <div className="rounded-md bg-success/10 text-success px-3 py-2 text-xs">
              ⓘ This student is {selectedStudent?.is_scholarship ? "on scholarship" : "Free SHS"} — fee will be auto-marked fully paid.
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Academic Year *</Label>
              <Input required maxLength={20} value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Term *</Label>
              <select required value={form.term}
                onChange={(e) => setForm({ ...form, term: e.target.value })}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Total Fee (GHS) *</Label>
              <Input required type="number" step="0.01" min="0" value={form.total_fee} onChange={(e) => setForm({ ...form, total_fee: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Amount Paid (GHS)</Label>
              <Input type="number" step="0.01" min="0" disabled={isAutoPaid} value={isAutoPaid ? form.total_fee : form.amount_paid}
                onChange={(e) => setForm({ ...form, amount_paid: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Input maxLength={200} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={upsert.isPending}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
