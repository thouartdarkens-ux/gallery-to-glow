import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { BookOpen, Users, GraduationCap, Plus, Trash2, UserCheck, Search, Link2, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useHasAnyRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClasses, useAddClass } from "@/hooks/useClasses";
import { useAllDepartmentSubjects, useLinkDepartmentSubject, useUnlinkDepartmentSubject } from "@/hooks/useDepartments";
import { toast } from "sonner";

type SortDir = "asc" | "desc";

function useSortedFiltered<T extends Record<string, any>>(
  rows: T[] | undefined,
  search: string,
  searchKeys: (keyof T)[],
  sortKey: keyof T | null,
  sortDir: SortDir
) {
  return useMemo(() => {
    let r = rows || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((row) => searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)));
    }
    if (sortKey) {
      r = [...r].sort((a, b) => {
        const av = String(a[sortKey] ?? "").toLowerCase();
        const bv = String(b[sortKey] ?? "").toLowerCase();
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [rows, search, searchKeys, sortKey, sortDir]);
}

function SortHeader({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
      {label}
      <ArrowUpDown className={`w-3 h-3 ${active ? "text-primary" : "opacity-40"}`} />
      {active && <span className="text-[10px] text-primary">{dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}

export default function SetupAcademic() {
  const hasAccess = useHasAnyRole(["headmaster", "asst_head_academic", "super_admin", "school_admin"]);
  const qc = useQueryClient();

  // ---------- CLASSES ----------
  const { data: classes } = useClasses();
  const addClass = useAddClass();
  const [classDialog, setClassDialog] = useState(false);
  const [clsName, setClsName] = useState("");
  const [clsLevel, setClsLevel] = useState("");
  const [clsSection, setClsSection] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [classSort, setClassSort] = useState<{ key: string | null; dir: SortDir }>({ key: "name", dir: "asc" });
  const delClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["classes"] }); toast.success("Class removed"); },
    onError: (e: any) => toast.error(e.message),
  });
  const filteredClasses = useSortedFiltered(classes as any[], classSearch, ["name", "level", "section"], classSort.key as any, classSort.dir);

  // ---------- DEPARTMENTS (PROGRAMMES) ----------
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("departments").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  const [deptDialog, setDeptDialog] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptSearch, setDeptSearch] = useState("");
  const [deptSort, setDeptSort] = useState<{ key: string | null; dir: SortDir }>({ key: "name", dir: "asc" });
  const addDept = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("departments").insert({ name: deptName.trim(), code: deptCode.trim() || null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["departments"] });
      toast.success("Programme added");
      setDeptDialog(false); setDeptName(""); setDeptCode("");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delDept = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("departments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Removed"); },
    onError: (e: any) => toast.error(e.message),
  });
  const filteredDepts = useSortedFiltered(departments as any[], deptSearch, ["name", "code"], deptSort.key as any, deptSort.dir);

  // ---------- SUBJECTS ----------
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subjects").select("*, departments(name)").order("name");
      if (error) throw error;
      return (data || []).map((s: any) => ({ ...s, department_name: s.departments?.name || "" }));
    },
  });
  const [subjDialog, setSubjDialog] = useState(false);
  const [subjName, setSubjName] = useState("");
  const [subjCode, setSubjCode] = useState("");
  const [subjDept, setSubjDept] = useState("");
  const [subjSearch, setSubjSearch] = useState("");
  const [subjSort, setSubjSort] = useState<{ key: string | null; dir: SortDir }>({ key: "name", dir: "asc" });
  const addSubj = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("subjects").insert({
        name: subjName.trim(), code: subjCode.trim() || null, department_id: subjDept || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Subject added");
      setSubjDialog(false); setSubjName(""); setSubjCode(""); setSubjDept("");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delSubj = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("subjects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subjects"] }); toast.success("Removed"); },
    onError: (e: any) => toast.error(e.message),
  });
  const filteredSubjects = useSortedFiltered(subjects as any[], subjSearch, ["name", "code", "department_name"], subjSort.key as any, subjSort.dir);

  // ---------- PROGRAMME → SUBJECTS ----------
  const { data: progSubjects } = useAllDepartmentSubjects();
  const linkPS = useLinkDepartmentSubject();
  const unlinkPS = useUnlinkDepartmentSubject();
  const [psDialog, setPsDialog] = useState(false);
  const [psDept, setPsDept] = useState("");
  const [psSubject, setPsSubject] = useState("");
  const [psSearch, setPsSearch] = useState("");
  const [psSort, setPsSort] = useState<{ key: string | null; dir: SortDir }>({ key: "department_name", dir: "asc" });
  const psRows = useMemo(() => (progSubjects || []).map((r: any) => ({
    id: r.id,
    department_name: r.departments?.name || "",
    subject_name: r.subjects?.name || "",
    subject_code: r.subjects?.code || "",
  })), [progSubjects]);
  const filteredPS = useSortedFiltered(psRows, psSearch, ["department_name", "subject_name", "subject_code"], psSort.key as any, psSort.dir);

  // ---------- TEACHING ASSIGNMENTS ----------
  const { data: assignments } = useQuery({
    queryKey: ["teaching_assignments"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("teaching_assignments")
        .select("id, teacher_user_id, academic_year, subjects(name), classes(name, level)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const { data: teachers } = useQuery({
    queryKey: ["teachers-for-assignment"],
    queryFn: async () => {
      const teacherRoles = ["subject_teacher", "hod", "form_master", "asst_head_academic", "headmaster"];
      const { data: roleRows, error } = await (supabase as any)
        .from("user_roles").select("user_id, role").in("role", teacherRoles);
      if (error) throw error;
      const ids = Array.from(new Set((roleRows || []).map((r: any) => r.user_id)));
      if (ids.length === 0) return [];
      const { data: profs } = await (supabase as any)
        .from("profiles").select("user_id, display_name").in("user_id", ids);
      return (profs || []) as { user_id: string; display_name: string | null }[];
    },
  });
  const teacherNameMap = new Map((teachers || []).map((t: any) => [t.user_id, t.display_name || "Unknown"]));

  const [assignDialog, setAssignDialog] = useState(false);
  const [aTeacher, setATeacher] = useState("");
  const [aSubject, setASubject] = useState("");
  const [aClass, setAClass] = useState("");
  const [assignSearch, setAssignSearch] = useState("");
  const [assignSort, setAssignSort] = useState<{ key: string | null; dir: SortDir }>({ key: "teacher_name", dir: "asc" });
  const addAssign = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("teaching_assignments").insert({
        teacher_user_id: aTeacher, subject_id: aSubject, class_id: aClass,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teaching_assignments"] });
      toast.success("Teacher assigned");
      setAssignDialog(false); setATeacher(""); setASubject(""); setAClass("");
    },
    onError: (e: any) => toast.error(e.message),
  });
  const delAssign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("teaching_assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["teaching_assignments"] }); toast.success("Unassigned"); },
    onError: (e: any) => toast.error(e.message),
  });
  const assignRows = useMemo(() => (assignments || []).map((a: any) => ({
    id: a.id,
    teacher_name: teacherNameMap.get(a.teacher_user_id) || "Unknown",
    subject_name: a.subjects?.name || "",
    class_name: a.classes?.name || "",
    academic_year: a.academic_year,
  })), [assignments, teachers]);
  const filteredAssign = useSortedFiltered(assignRows, assignSearch, ["teacher_name", "subject_name", "class_name"], assignSort.key as any, assignSort.dir);

  if (!hasAccess) return <Navigate to="/" replace />;

  const handleAddClass = () => {
    if (!clsName.trim() || !clsLevel) return toast.error("Name and level required");
    addClass.mutate(
      { name: clsName.trim(), level: clsLevel, section: clsSection.trim() || undefined },
      {
        onSuccess: () => { toast.success("Class added"); setClassDialog(false); setClsName(""); setClsLevel(""); setClsSection(""); },
        onError: (e: any) => toast.error(e.message),
      }
    );
  };

  const toggleSort = (state: { key: string | null; dir: SortDir }, setState: any, key: string) => {
    if (state.key === key) setState({ key, dir: state.dir === "asc" ? "desc" : "asc" });
    else setState({ key, dir: "asc" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Academic Setup</h1>
          <p className="text-muted-foreground mt-1">Manage classes, programmes, subjects, programme subjects, and teaching assignments.</p>
          <Badge variant="outline" className="mt-2">Asst. Head (Academic) Domain</Badge>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1">
            <TabsTrigger value="classes" className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" /> Classes
              <Badge variant="secondary" className="ml-1 text-xs">{(classes || []).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="programmes" className="flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Programmes
              <Badge variant="secondary" className="ml-1 text-xs">{(departments || []).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Subjects
              <Badge variant="secondary" className="ml-1 text-xs">{(subjects || []).length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="prog-subjects" className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4" /> Programme Subjects
              <Badge variant="secondary" className="ml-1 text-xs">{psRows.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> Assignments
              <Badge variant="secondary" className="ml-1 text-xs">{assignRows.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* CLASSES TAB */}
          <TabsContent value="classes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">Classes</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search classes…" value={classSearch} onChange={(e) => setClassSearch(e.target.value)} className="pl-9 h-9 w-56" />
                  </div>
                  <Dialog open={classDialog} onOpenChange={setClassDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input value={clsName} onChange={(e) => setClsName(e.target.value)} placeholder="e.g. Form 1A" />
                        </div>
                        <div className="space-y-2">
                          <Label>Level *</Label>
                          <Select value={clsLevel} onValueChange={setClsLevel}>
                            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Form 1">Form 1</SelectItem>
                              <SelectItem value="Form 2">Form 2</SelectItem>
                              <SelectItem value="Form 3">Form 3</SelectItem>
                              <SelectItem value="SHS 1">SHS 1</SelectItem>
                              <SelectItem value="SHS 2">SHS 2</SelectItem>
                              <SelectItem value="SHS 3">SHS 3</SelectItem>
                              <SelectItem value="Remedial">Remedial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Section</Label>
                          <Input value={clsSection} onChange={(e) => setClsSection(e.target.value)} placeholder="e.g. Science, Arts" />
                        </div>
                        <Button onClick={handleAddClass} disabled={addClass.isPending} className="w-full">
                          {addClass.isPending ? "Adding..." : "Add Class"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortHeader label="Name" active={classSort.key === "name"} dir={classSort.dir} onClick={() => toggleSort(classSort, setClassSort, "name")} /></TableHead>
                      <TableHead><SortHeader label="Level" active={classSort.key === "level"} dir={classSort.dir} onClick={() => toggleSort(classSort, setClassSort, "level")} /></TableHead>
                      <TableHead><SortHeader label="Section" active={classSort.key === "section"} dir={classSort.dir} onClick={() => toggleSort(classSort, setClassSort, "section")} /></TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No classes.</TableCell></TableRow>
                    ) : filteredClasses.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.level}</TableCell>
                        <TableCell className="text-muted-foreground">{c.section || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete class ${c.name}?`)) delClass.mutate(c.id); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROGRAMMES TAB */}
          <TabsContent value="programmes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">Programmes</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search programmes…" value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} className="pl-9 h-9 w-56" />
                  </div>
                  <Dialog open={deptDialog} onOpenChange={setDeptDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Programme</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. General Arts" />
                        </div>
                        <div className="space-y-2">
                          <Label>Code</Label>
                          <Input value={deptCode} onChange={(e) => setDeptCode(e.target.value)} placeholder="e.g. GA" />
                        </div>
                        <Button onClick={() => addDept.mutate()} disabled={addDept.isPending || !deptName.trim()} className="w-full">
                          {addDept.isPending ? "Adding..." : "Add Programme"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortHeader label="Name" active={deptSort.key === "name"} dir={deptSort.dir} onClick={() => toggleSort(deptSort, setDeptSort, "name")} /></TableHead>
                      <TableHead><SortHeader label="Code" active={deptSort.key === "code"} dir={deptSort.dir} onClick={() => toggleSort(deptSort, setDeptSort, "code")} /></TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepts.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-sm">No programmes.</TableCell></TableRow>
                    ) : filteredDepts.map((d: any) => (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{d.name}</TableCell>
                        <TableCell className="text-muted-foreground">{d.code || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete ${d.name}?`)) delDept.mutate(d.id); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUBJECTS TAB */}
          <TabsContent value="subjects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">Subjects</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search subjects…" value={subjSearch} onChange={(e) => setSubjSearch(e.target.value)} className="pl-9 h-9 w-56" />
                  </div>
                  <Dialog open={subjDialog} onOpenChange={setSubjDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input value={subjName} onChange={(e) => setSubjName(e.target.value)} placeholder="e.g. Core Mathematics" />
                        </div>
                        <div className="space-y-2">
                          <Label>Code</Label>
                          <Input value={subjCode} onChange={(e) => setSubjCode(e.target.value)} placeholder="e.g. MATH101" />
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={subjDept} onValueChange={setSubjDept}>
                            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                            <SelectContent>
                              {(departments || []).map((d: any) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={() => addSubj.mutate()} disabled={addSubj.isPending || !subjName.trim()} className="w-full">
                          {addSubj.isPending ? "Adding..." : "Add Subject"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortHeader label="Name" active={subjSort.key === "name"} dir={subjSort.dir} onClick={() => toggleSort(subjSort, setSubjSort, "name")} /></TableHead>
                      <TableHead><SortHeader label="Code" active={subjSort.key === "code"} dir={subjSort.dir} onClick={() => toggleSort(subjSort, setSubjSort, "code")} /></TableHead>
                      <TableHead><SortHeader label="Department" active={subjSort.key === "department_name"} dir={subjSort.dir} onClick={() => toggleSort(subjSort, setSubjSort, "department_name")} /></TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No subjects.</TableCell></TableRow>
                    ) : filteredSubjects.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{s.code || "—"}</TableCell>
                        <TableCell>{s.department_name || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm(`Delete ${s.name}?`)) delSubj.mutate(s.id); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROGRAMME SUBJECTS TAB */}
          <TabsContent value="prog-subjects">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">Programme Subjects</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search…" value={psSearch} onChange={(e) => setPsSearch(e.target.value)} className="pl-9 h-9 w-56" />
                  </div>
                  <Dialog open={psDialog} onOpenChange={setPsDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Link</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Link Subject to Programme</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label>Programme *</Label>
                          <Select value={psDept} onValueChange={setPsDept}>
                            <SelectTrigger><SelectValue placeholder="Select programme" /></SelectTrigger>
                            <SelectContent>
                              {(departments || []).map((d: any) => (
                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject *</Label>
                          <Select value={psSubject} onValueChange={setPsSubject}>
                            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>
                              {(subjects || []).map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => linkPS.mutate(
                            { department_id: psDept, subject_id: psSubject },
                            {
                              onSuccess: () => { toast.success("Linked"); setPsDialog(false); setPsDept(""); setPsSubject(""); },
                              onError: (e: any) => toast.error(e.message),
                            }
                          )}
                          disabled={linkPS.isPending || !psDept || !psSubject}
                          className="w-full"
                        >
                          {linkPS.isPending ? "Linking..." : "Link"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortHeader label="Programme" active={psSort.key === "department_name"} dir={psSort.dir} onClick={() => toggleSort(psSort, setPsSort, "department_name")} /></TableHead>
                      <TableHead><SortHeader label="Subject" active={psSort.key === "subject_name"} dir={psSort.dir} onClick={() => toggleSort(psSort, setPsSort, "subject_name")} /></TableHead>
                      <TableHead><SortHeader label="Code" active={psSort.key === "subject_code"} dir={psSort.dir} onClick={() => toggleSort(psSort, setPsSort, "subject_code")} /></TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPS.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-sm">No programme→subject links yet. Click <strong>Link</strong> to add one.</TableCell></TableRow>
                    ) : filteredPS.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.department_name}</TableCell>
                        <TableCell>{r.subject_name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{r.subject_code || "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => unlinkPS.mutate(r.id, { onSuccess: () => toast.success("Unlinked"), onError: (e: any) => toast.error(e.message) })}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEACHING ASSIGNMENTS TAB */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                <CardTitle className="text-lg">Teaching Assignments</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search…" value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} className="pl-9 h-9 w-56" />
                  </div>
                  <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Assign</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Assign Teacher to Subject & Class</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <div className="space-y-2">
                          <Label>Teacher *</Label>
                          <Select value={aTeacher} onValueChange={setATeacher}>
                            <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                            <SelectContent>
                              {(teachers || []).length === 0 && (
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">No teachers found. Create staff with a teaching role first.</div>
                              )}
                              {(teachers || []).map((t: any) => (
                                <SelectItem key={t.user_id} value={t.user_id}>{t.display_name || "Unknown"}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject *</Label>
                          <Select value={aSubject} onValueChange={setASubject}>
                            <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                            <SelectContent>
                              {(subjects || []).map((s: any) => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Class *</Label>
                          <Select value={aClass} onValueChange={setAClass}>
                            <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                            <SelectContent>
                              {(classes || []).map((c: any) => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => addAssign.mutate()}
                          disabled={addAssign.isPending || !aTeacher || !aSubject || !aClass}
                          className="w-full"
                        >
                          {addAssign.isPending ? "Assigning..." : "Assign"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortHeader label="Teacher" active={assignSort.key === "teacher_name"} dir={assignSort.dir} onClick={() => toggleSort(assignSort, setAssignSort, "teacher_name")} /></TableHead>
                      <TableHead><SortHeader label="Subject" active={assignSort.key === "subject_name"} dir={assignSort.dir} onClick={() => toggleSort(assignSort, setAssignSort, "subject_name")} /></TableHead>
                      <TableHead><SortHeader label="Class" active={assignSort.key === "class_name"} dir={assignSort.dir} onClick={() => toggleSort(assignSort, setAssignSort, "class_name")} /></TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssign.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">No teaching assignments.</TableCell></TableRow>
                    ) : filteredAssign.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.teacher_name}</TableCell>
                        <TableCell>{r.subject_name}</TableCell>
                        <TableCell>{r.class_name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{r.academic_year}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Unassign?")) delAssign.mutate(r.id); }}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
