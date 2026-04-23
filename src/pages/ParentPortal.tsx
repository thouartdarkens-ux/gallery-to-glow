import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, GraduationCap, MessageSquare, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface StudentInfo {
  id: string;
  name: string;
  student_id: string;
  program: string | null;
  status: string;
  class_name?: string;
}

interface MessageRecord {
  id: string;
  body: string;
  status: string;
  created_at: string;
  recipient_phone: string;
}

export default function ParentPortal() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      // Find parent records by phone
      const { data: parents, error: pErr } = await (supabase as any)
        .from("parents")
        .select("student_id, name, phone")
        .or(`phone.eq.${phone},phone_secondary.eq.${phone}`);

      if (pErr) throw pErr;

      if (!parents || parents.length === 0) {
        setStudents([]);
        setMessages([]);
        setLoading(false);
        return;
      }

      const studentIds = parents.map((p: any) => p.student_id);

      // Get student info
      const { data: studs, error: sErr } = await (supabase as any)
        .from("students")
        .select("id, name, student_id, program, status, class_id")
        .in("id", studentIds);

      if (sErr) throw sErr;
      setStudents(studs || []);

      // Get messages sent to this phone
      const { data: msgs, error: mErr } = await (supabase as any)
        .from("messages")
        .select("id, body, status, created_at, recipient_phone")
        .eq("recipient_phone", phone)
        .order("created_at", { ascending: false })
        .limit(50);

      if (mErr) throw mErr;
      setMessages(msgs || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Parent Portal</h1>
            <p className="text-sm text-muted-foreground">View your ward's information and message history</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3 items-end">
              <div className="flex-1 space-y-1.5">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter your registered phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Look Up"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searched && !loading && students.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No records found for this phone number. Please ensure you're using your registered number.
            </CardContent>
          </Card>
        )}

        {/* Student Info */}
        {students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-lg">
                <GraduationCap className="w-5 h-5" /> Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {students.map((s) => (
                  <div key={s.id} className="border border-border rounded-lg p-4 space-y-2">
                    <p className="font-medium text-foreground">{s.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {s.student_id}</p>
                    {s.program && <p className="text-sm text-muted-foreground">Program: {s.program}</p>}
                    <Badge variant={s.status === "Active" ? "default" : "secondary"}>{s.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message History */}
        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" /> Message History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(m.created_at), "MMM d, yyyy h:mm a")}
                        </TableCell>
                        <TableCell className="text-sm max-w-md">{m.body}</TableCell>
                        <TableCell>
                          <Badge variant={m.status === "delivered" ? "default" : m.status === "failed" ? "destructive" : "secondary"} className="text-xs capitalize">
                            {m.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
