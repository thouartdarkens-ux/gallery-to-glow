import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Phone, Upload, Mic, Plus, Users, GraduationCap, Tag } from "lucide-react";
import { useVoiceBroadcasts, useAddVoiceBroadcast } from "@/hooks/useVoiceBroadcasts";
import { useClasses } from "@/hooks/useClasses";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  sending: "bg-accent/20 text-accent-foreground",
  sent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function Voice() {
  const { data: broadcasts = [], isLoading } = useVoiceBroadcasts();
  const { data: classes = [] } = useClasses();
  const addBroadcast = useAddVoiceBroadcast();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    target_type: "all",
    target_value: "",
    audio_url: "",
    scheduled_at: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addBroadcast.mutate(
      {
        title: form.title,
        audio_url: form.audio_url || undefined,
        target_type: form.target_type,
        target_value: form.target_value || undefined,
        status: form.scheduled_at ? "scheduled" : "draft",
        scheduled_at: form.scheduled_at || null,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ title: "", target_type: "all", target_value: "", audio_url: "", scheduled_at: "" });
          toast({ title: "Voice broadcast created" });
        },
      }
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Voice Messaging</h1>
            <p className="text-muted-foreground mt-1">Send pre-recorded voice calls to parents and contacts.</p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />New Broadcast
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : broadcasts.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No voice broadcasts yet.</TableCell></TableRow>
              ) : (
                broadcasts.map((b: any) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.target_type === "all" ? "Everyone" : `${b.target_type}: ${b.target_value}`}</TableCell>
                    <TableCell><Badge className={statusColor[b.status] || ""}>{b.status}</Badge></TableCell>
                    <TableCell>{b.total_recipients}</TableCell>
                    <TableCell>{b.completed}/{b.total_recipients}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">New Voice Broadcast</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input required placeholder="e.g. PTA Meeting Reminder" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label>Target Recipients</Label>
              <div className="flex gap-2">
                {[
                  { val: "all", label: "Everyone", icon: Users },
                  { val: "class", label: "By Class", icon: GraduationCap },
                  { val: "tag", label: "By Tag", icon: Tag },
                ].map((t) => (
                  <Button key={t.val} type="button" variant={form.target_type === t.val ? "default" : "outline"} size="sm"
                    onClick={() => setForm({ ...form, target_type: t.val, target_value: "" })}
                  >
                    <t.icon className="w-4 h-4 mr-1.5" />{t.label}
                  </Button>
                ))}
              </div>
              {form.target_type === "class" && (
                <select value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select class</option>
                  {classes.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              )}
              {form.target_type === "tag" && (
                <Input placeholder="e.g. Debtors" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} />
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Audio URL</Label>
              <Input placeholder="https://... (or upload coming soon)" value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} />
              <div className="flex gap-2 mt-2">
                <Button type="button" variant="outline" size="sm" disabled><Upload className="w-4 h-4 mr-1.5" />Upload File</Button>
                <Button type="button" variant="outline" size="sm" disabled><Mic className="w-4 h-4 mr-1.5" />Record</Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addBroadcast.isPending}>
                <Phone className="w-4 h-4 mr-2" />Create Broadcast
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
