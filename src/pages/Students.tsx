import { useState, Fragment } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Upload, Trash2, Download, ChevronDown, ChevronRight } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddStudentDialog from "@/components/AddStudentDialog";
import CsvImportDialog from "@/components/CsvImportDialog";
import StudentSubjectsRow from "@/components/StudentSubjectsRow";
import { useStudents, useAddStudent, useDeleteStudent } from "@/hooks/useStudents";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const tagColors: Record<string, string> = {
  Boarder: "bg-info/10 text-info border-info/20",
  "Day Student": "bg-success/10 text-success border-success/20",
  Debtor: "bg-destructive/10 text-destructive border-destructive/20",
  "Final Year": "bg-warning/10 text-warning border-warning/20",
};

export default function Students() {
  const { data: students = [], isLoading } = useStudents();
  const addStudent = useAddStudent();
  const deleteStudent = useDeleteStudent();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [filterClass, setFilterClass] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.parent_name?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !filterClass || s.class_name === filterClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(students.map((s) => s.class_name).filter(Boolean))].sort();

  const handleAddStudent = (input: Parameters<typeof addStudent.mutate>[0]) => {
    addStudent.mutate(input, {
      onSuccess: (student: any) => {
        setDialogOpen(false);
        const pin = student?.student_pins?.[0]?.pin_plain;
        toast({
          title: "Student added",
          description: `${student?.student_id ? `ID: ${student.student_id}` : ""}${pin ? ` · PIN: ${pin}` : ""}`,
        });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      },
    });
  };

  const handleCsvImport = async (rows: any[]) => {
    const batch = rows.map(r => ({
      name: r.name,
      program: r.program || null,
      status: r.status || "Active",
      residency: r.residency || "Day",
    }));
    const { error } = await (supabase as any).from("students").insert(batch);
    if (error) throw error;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground mt-1">Manage student records and parent contacts.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              exportToCsv("students.csv", filtered.map(s => ({
                student_id: s.student_id, name: s.name, class: s.class_name || "",
                program: s.program || "", status: s.status, parent: s.parent_name || "",
                parent_phone: s.parent_phone || "", pin: s.pin || "",
              })));
            }}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />Import CSV
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Student
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students, IDs, parents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground">
            <option value="">All Classes</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="text-xs text-muted-foreground ml-auto">{filtered.length} of {students.length}</span>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Student</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No students found.</TableCell></TableRow>
              ) : (
                filtered.map((student) => {
                  const isOpen = expanded.has(student.id);
                  return (
                    <Fragment key={student.id}>
                      <TableRow className="cursor-pointer" onClick={() => toggleExpand(student.id)}>
                        <TableCell className="p-2">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); toggleExpand(student.id); }}>
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{student.student_id}</TableCell>
                        <TableCell className="text-xs font-mono font-semibold tracking-wider text-primary">{student.pin || "—"}</TableCell>
                        <TableCell>{student.class_name}</TableCell>
                        <TableCell>{student.department_name || student.program || "—"}</TableCell>
                        <TableCell>{student.parent_name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{student.parent_phone}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === "Active" ? "default" : "secondary"}
                            className={student.status === "Active" ? "bg-success/10 text-success border-success/20" : ""}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {(student.tags || []).map((tag) => (
                              <Badge key={tag} variant="outline" className={`text-[10px] ${tagColors[tag] || ""}`}>{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={(e) => { e.stopPropagation(); if (confirm(`Delete ${student.name}?`)) deleteStudent.mutate(student.id); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell></TableCell>
                          <TableCell colSpan={10} className="py-4">
                            <StudentSubjectsRow
                              departmentId={student.department_id}
                              programmeName={student.department_name || student.program || undefined}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddStudentDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={handleAddStudent} />
      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        type="students"
        requiredFields={["name"]}
        optionalFields={["program", "status", "residency", "class", "parent_name", "parent_phone"]}
        onImport={handleCsvImport}
      />
    </AppLayout>
  );
}
