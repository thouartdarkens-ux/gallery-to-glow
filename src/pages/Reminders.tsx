import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Clock, Pause, Play } from "lucide-react";
import { useReminders, useAddReminder, useUpdateReminderStatus, useDeleteReminder } from "@/hooks/useReminders";
import { useToast } from "@/hooks/use-toast";

const typeOptions = ["fees", "exams", "events", "general"];
const frequencyOptions = ["once", "daily", "weekly", "monthly"];

export default function Reminders() {
  const { data: reminders = [], isLoading } = useReminders();
  const addReminder = useAddReminder();
  const updateStatus = useUpdateReminderStatus();
  const deleteReminder = useDeleteReminder();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "fees", message_body: "", target_type: "all", target_value: "",
    frequency: "once", scheduled_at: "",
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addReminder.mutate(form, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ title: "", type: "fees", message_body: "", target_type: "all", target_value: "", frequency: "once", scheduled_at: "" });
        toast({ title: "Reminder created" });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const statusColors: Record<string, string> = {
    active: "bg-success/10 text-success border-success/20",
    paused: "bg-warning/10 text-warning border-warning/20",
    completed: "bg-muted text-muted-foreground",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Bell className="w-6 h-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Auto Reminders</h1>
              <p className="text-muted-foreground mt-1">Schedule automatic SMS reminders for fees, exams, and events.</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />New Reminder</Button>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : reminders.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Bell className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No reminders set up yet.</p>
            </div>
          ) : (
            reminders.map((r: any) => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-5 shadow-sm flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-semibold text-card-foreground">{r.title}</h3>
                    <Badge variant="outline" className={statusColors[r.status] || ""}>{r.status}</Badge>
                    <Badge variant="secondary" className="capitalize text-xs">{r.type}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{r.frequency}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{r.message_body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Scheduled: {new Date(r.scheduled_at).toLocaleString()} · Target: {r.target_type}{r.target_value ? ` → ${r.target_value}` : ""}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                    onClick={() => updateStatus.mutate({ id: r.id, status: r.status === "active" ? "paused" : "active" })}
                  >
                    {r.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                    onClick={() => deleteReminder.mutate(r.id)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-heading">Create Reminder</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fee Reminder" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize">
                  {typeOptions.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Frequency</Label>
                <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize">
                  {frequencyOptions.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Schedule Date/Time</Label>
                <Input required type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Target</Label>
                <select value={form.target_type} onChange={e => setForm({ ...form, target_type: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="all">All Parents</option>
                  <option value="class">By Class</option>
                  <option value="tag">By Tag</option>
                </select>
              </div>
              {form.target_type !== "all" && (
                <div className="space-y-1.5">
                  <Label>Target Value</Label>
                  <Input value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} placeholder={form.target_type === "class" ? "e.g. JHS 3" : "e.g. Debtors"} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea required rows={3} value={form.message_body} onChange={e => setForm({ ...form, message_body: e.target.value })}
                placeholder="Type the reminder message..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addReminder.isPending}>Create Reminder</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
