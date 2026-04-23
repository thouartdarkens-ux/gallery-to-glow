import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Upload, Download, Search, Wallet, TrendingUp, TrendingDown, Users, GraduationCap, Trash2, CreditCard } from "lucide-react";
import { useFeeRecords, useFeeSummary, useDeleteFeeRecord, useUpsertFeeRecord, type FeeRecord } from "@/hooks/useFees";
import { useStudents } from "@/hooks/useStudents";
import StatCard from "@/components/StatCard";
import EditFeeDialog from "@/components/EditFeeDialog";
import RecordPaymentDialog from "@/components/RecordPaymentDialog";
import CsvImportDialog from "@/components/CsvImportDialog";
import { exportToCsv } from "@/lib/exportCsv";
import { useToast } from "@/hooks/use-toast";

const TERMS = ["Term 1", "Term 2", "Term 3"];
const STATUSES = [
  { val: "all", label: "All" },
  { val: "paid", label: "Paid" },
  { val: "partial", label: "Partial" },
  { val: "owing", label: "Owing" },
  { val: "scholarship", label: "Scholarship" },
  { val: "free_shs", label: "Free SHS" },
];

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  partial: "secondary",
  owing: "destructive",
  scholarship: "outline",
  free_shs: "outline",
};

export default function Fees() {
  const [year, setYear] = useState("2025/2026");
  const [term, setTerm] = useState("Term 1");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<FeeRecord | null>(null);

  const { data: records = [], isLoading } = useFeeRecords({ academic_year: year, term, status });
  const { data: summary } = useFeeSummary(year, term);
  const { data: students = [] } = useStudents();
  const deleteRecord = useDeleteFeeRecord();
  const upsert = useUpsertFeeRecord();
  const { toast } = useToast();

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      r.student?.name?.toLowerCase().includes(q) ||
      r.student?.student_id?.toLowerCase().includes(q)
    );
  }, [records, search]);

  const handleExport = () => {
    exportToCsv(`fees_${year.replace("/", "-")}_${term}.csv`, filtered.map((r) => ({
      student_id: r.student?.student_id || "",
      name: r.student?.name || "",
      class: r.student?.classes?.name || "",
      academic_year: r.academic_year,
      term: r.term,
      total_fee: r.total_fee,
      amount_paid: r.amount_paid,
      balance: r.balance,
      status: r.status,
    })));
  };

  const handleImport = async (rows: any[]) => {
    let success = 0;
    let failed = 0;
    for (const row of rows) {
      const studentIdRaw = String(row.student_id || "").trim();
      const student = students.find((s) => s.student_id === studentIdRaw);
      if (!student) { failed++; continue; }
      try {
        await upsert.mutateAsync({
          student_id: student.id,
          academic_year: String(row.academic_year || year),
          term: String(row.term || term),
          total_fee: parseFloat(row.total_fee) || 0,
          amount_paid: parseFloat(row.amount_paid) || 0,
          notes: row.notes ? String(row.notes) : undefined,
        });
        success++;
      } catch { failed++; }
    }
    toast({
      title: "Import complete",
      description: `${success} records imported${failed ? `, ${failed} failed (student not found or invalid)` : ""}.`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Fees & Account Session</h1>
            <p className="text-muted-foreground mt-1">Manage fee records, payments, and outstanding balances.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />Import CSV
            </Button>
            <Button size="sm" onClick={() => { setActiveRecord(null); setEditOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />Add Fee Record
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Billed" value={`GHS ${(summary?.totalBilled || 0).toLocaleString()}`} icon={Wallet} color="primary" />
          <StatCard title="Collected" value={`GHS ${(summary?.totalCollected || 0).toLocaleString()}`} icon={TrendingUp} color="success" />
          <StatCard title="Outstanding" value={`GHS ${(summary?.totalOutstanding || 0).toLocaleString()}`} icon={TrendingDown} color="warning" />
          <StatCard title="Scholarship/Free SHS" value={summary?.scholarshipCount || 0} icon={GraduationCap} color="info" />
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Input className="w-32" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
          <select value={term} onChange={(e) => setTerm(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <div className="flex gap-1.5 items-center">
            {STATUSES.map((s) => (
              <Button key={s.val} variant={status === s.val ? "default" : "outline"} size="sm"
                onClick={() => setStatus(s.val)} className="text-xs h-8">
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No fee records yet. Click "Add Fee Record" to start.
                </TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.student?.name}</div>
                    <div className="text-xs text-muted-foreground">{r.student?.student_id}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.student?.classes?.name || "—"}</TableCell>
                  <TableCell className="text-right">GHS {Number(r.total_fee).toFixed(2)}</TableCell>
                  <TableCell className="text-right">GHS {Number(r.amount_paid).toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    GHS {Number(r.balance).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[r.status] || "outline"} className="capitalize">
                      {r.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {r.status !== "paid" && r.status !== "scholarship" && r.status !== "free_shs" && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={() => { setActiveRecord(r); setPayOpen(true); }}>
                          <CreditCard className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                        onClick={() => deleteRecord.mutate(r.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditFeeDialog open={editOpen} onOpenChange={setEditOpen} defaultYear={year} defaultTerm={term} />
      <RecordPaymentDialog open={payOpen} onOpenChange={setPayOpen} record={activeRecord} />
      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        type="contacts"
        requiredFields={["student_id", "total_fee"]}
        optionalFields={["amount_paid", "academic_year", "term", "notes"]}
        onImport={handleImport}
      />
    </AppLayout>
  );
}
