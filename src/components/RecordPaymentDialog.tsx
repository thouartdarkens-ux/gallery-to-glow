import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRecordPayment, type FeeRecord } from "@/hooks/useFees";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: FeeRecord | null;
}

export default function RecordPaymentDialog({ open, onOpenChange, record }: Props) {
  const { toast } = useToast();
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) { setAmount(""); setReference(""); }
  }, [open]);

  if (!record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    recordPayment.mutate(
      {
        student_id: record.student_id,
        fee_record_id: record.id,
        amount: num,
        reference: reference.trim() || undefined,
        current_paid: Number(record.amount_paid || 0),
      },
      {
        onSuccess: () => {
          toast({ title: "Payment recorded", description: `GHS ${num.toFixed(2)} added.` });
          onOpenChange(false);
        },
        onError: (err: any) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="font-heading">Record Payment</DialogTitle></DialogHeader>
        <div className="rounded-lg bg-muted/30 p-3 mb-3 space-y-1">
          <p className="text-sm font-medium">{record.student?.name}</p>
          <p className="text-xs text-muted-foreground">{record.student?.student_id} · {record.term} · {record.academic_year}</p>
          <div className="flex justify-between mt-2 text-xs">
            <span>Total: <span className="font-medium">GHS {Number(record.total_fee).toFixed(2)}</span></span>
            <span>Paid: <span className="font-medium">GHS {Number(record.amount_paid).toFixed(2)}</span></span>
            <span>Balance: <span className="font-bold text-destructive">GHS {Number(record.balance).toFixed(2)}</span></span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label>Amount (GHS) *</Label>
            <Input required type="number" step="0.01" min="0.01" max={record.balance} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Reference (optional)</Label>
            <Input maxLength={100} placeholder="Receipt no., MoMo ref..." value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={recordPayment.isPending}>Record Payment</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
