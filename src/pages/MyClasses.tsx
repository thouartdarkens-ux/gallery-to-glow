import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, BookOpen, Search, MessageSquare, ClipboardCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

interface Assignment {
  id: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  class_name: string;
  class_level: string;
  academic_year: string;
}

interface ClassStudent {
  id: string;
  student_id: string;
  name: string;
  program: string | null;
  status: string;
  residency: string;
  parent_name: string;
  parent_phone: string;
}

export default function MyClasses() {
  const { user } = useAuth();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [smsMessage, setSmsMessage] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  // Fetch teacher's assignments
  const { data: assignments, isLoading: loadingAssignments } = useQuery({
    queryKey: ["my-teaching-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await sb
        .from("teaching_assignments")
        .select("id, subject_id, class_id, academic_year, subjects(name), classes(name, level)")
        .eq("teacher_user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((a: any) => ({
        id: a.id,
        subject_id: a.subject_id,
        subject_name: a.subjects?.name || "",
        class_id: a.class_id,
        class_name: a.classes?.name || "",
        class_level: a.classes?.level || "",
        academic_year: a.academic_year,
      })) as Assignment[];
    },
    enabled: !!user?.id,
  });

  // Fetch students for selected class
  const { data: classStudents, isLoading: loadingStudents } = useQuery({
    queryKey: ["class-students", selectedAssignment?.class_id],
    queryFn: async () => {
      if (!selectedAssignment?.class_id) return [];
      const { data, error } = await sb
        .from("students")
        .select("id, student_id, name, program, status, residency, parents(name, phone_primary, phone)")
        .eq("class_id", selectedAssignment.class_id)
        .eq("status", "Active")
        .order("name");
      if (error) throw error;
      return (data || []).map((s: any) => ({
        id: s.id,
        student_id: s.student_id,
        name: s.name,
        program: s.program,
        status: s.status,
        residency: s.residency,
        parent_name: s.parents?.[0]?.name || "",
        parent_phone: s.parents?.[0]?.phone_primary || s.parents?.[0]?.phone || "",
      })) as ClassStudent[];
    },
    enabled: !!selectedAssignment?.class_id,
  });

  const filteredStudents = useMemo(() => {
    if (!classStudents) return [];
    if (!studentSearch.trim()) return classStudents;
    const q = studentSearch.toLowerCase();
    return classStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.student_id.toLowerCase().includes(q)
    );
  }, [classStudents, studentSearch]);

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const handleSendSms = async () => {
    if (!smsMessage.trim()) return toast.error("Enter a message");
    const targets = filteredStudents.filter((s) => selectedStudents.has(s.id) && s.parent_phone);
    if (targets.length === 0) return toast.error("No parents with phone numbers selected");

    setSendingSms(true);
    try {
      const { error } = await sb.from("messages").insert(
        targets.map((s) => ({
          recipient_phone: s.parent_phone,
          recipient_name: s.parent_name || s.name + " (Parent)",
          body: smsMessage.trim(),
          status: "pending",
        }))
      );
      if (error) throw error;
      toast.success(`${targets.length} message(s) queued`);
      setSmsMessage("");
      setSelectedStudents(new Set());
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSendingSms(false);
    }
  };

  // Group assignments by class for a cleaner view
  const uniqueClasses = useMemo(() => {
    if (!assignments) return [];
    const map = new Map<string, { class_id: string; class_name: string; class_level: string; subjects: string[]; academic_year: string; assignment: Assignment }>();
    for (const a of assignments) {
      if (map.has(a.class_id)) {
        map.get(a.class_id)!.subjects.push(a.subject_name);
      } else {
        map.set(a.class_id, {
          class_id: a.class_id,
          class_name: a.class_name,
          class_level: a.class_level,
          subjects: [a.subject_name],
          academic_year: a.academic_year,
          assignment: a,
        });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">My Classes</h1>
          <p className="text-muted-foreground mt-1">View your assigned classes, manage students, and communicate with parents.</p>
        </div>

        {!selectedAssignment ? (
          // CLASS LIST VIEW
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loadingAssignments && <p className="text-muted-foreground col-span-full">Loading assignments…</p>}
            {!loadingAssignments && uniqueClasses.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-lg font-medium">No classes assigned</p>
                  <p className="text-sm mt-1">Ask your administrator to assign you to classes in Academic Setup.</p>
                </CardContent>
              </Card>
            )}
            {uniqueClasses.map((c) => (
              <Card
                key={c.class_id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedAssignment(c.assignment)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    {c.class_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{c.class_level}</Badge>
                      <Badge variant="secondary" className="text-xs">{c.academic_year}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.subjects.map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // CLASS DETAIL VIEW
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setSelectedAssignment(null); setSelectedStudents(new Set()); setStudentSearch(""); setSmsMessage(""); }}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <h2 className="text-xl font-semibold">{selectedAssignment.class_name}</h2>
              <Badge variant="outline">{selectedAssignment.class_level}</Badge>
              <Badge variant="secondary">{selectedAssignment.subject_name}</Badge>
            </div>

            <Tabs defaultValue="students">
              <TabsList>
                <TabsTrigger value="students" className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Students
                  <Badge variant="secondary" className="ml-1 text-xs">{classStudents?.length || 0}</Badge>
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> SMS Parents
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4" /> Attendance
                </TabsTrigger>
              </TabsList>

              {/* STUDENTS TAB */}
              <TabsContent value="students">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
                    <CardTitle className="text-lg">Class Students</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search students…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="pl-9 h-9 w-56" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {loadingStudents ? (
                      <p className="p-6 text-center text-muted-foreground">Loading…</p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-10">
                              <input type="checkbox" checked={filteredStudents.length > 0 && selectedStudents.size === filteredStudents.length} onChange={toggleAll} className="rounded" />
                            </TableHead>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Programme</TableHead>
                            <TableHead>Residency</TableHead>
                            <TableHead>Parent</TableHead>
                            <TableHead>Parent Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No students in this class.</TableCell></TableRow>
                          ) : filteredStudents.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell>
                                <input type="checkbox" checked={selectedStudents.has(s.id)} onChange={() => toggleStudent(s.id)} className="rounded" />
                              </TableCell>
                              <TableCell className="font-mono text-xs">{s.student_id}</TableCell>
                              <TableCell className="font-medium">{s.name}</TableCell>
                              <TableCell className="text-muted-foreground">{s.program || "—"}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{s.residency}</Badge></TableCell>
                              <TableCell>{s.parent_name || "—"}</TableCell>
                              <TableCell className="text-muted-foreground text-xs">{s.parent_phone || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SMS TAB */}
              <TabsContent value="sms">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Send SMS to Parents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {selectedStudents.size === 0
                          ? "Select students from the Students tab first, or select all below."
                          : `${selectedStudents.size} student(s) selected`}
                      </p>
                      <Button variant="outline" size="sm" onClick={toggleAll}>
                        {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All Students"}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Type your message to parents…"
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">{smsMessage.length} characters</p>
                    </div>
                    <Button onClick={handleSendSms} disabled={sendingSms || selectedStudents.size === 0 || !smsMessage.trim()}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {sendingSms ? "Sending…" : `Send to ${selectedStudents.size} Parent(s)`}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ATTENDANCE TAB */}
              <TabsContent value="attendance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-12 text-center text-muted-foreground">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-lg font-medium">Attendance tracking coming soon</p>
                      <p className="text-sm mt-1">This feature is under development. You'll be able to mark daily attendance and generate reports here.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
