import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Megaphone, Plus, Trash2, Play, Clock, Send, Users, Tag, GraduationCap } from "lucide-react";
import { useCampaigns, useAddCampaign, useUpdateCampaignStatus, useDeleteCampaign } from "@/hooks/useCampaigns";
import { useClasses } from "@/hooks/useClasses";
import { useTemplates } from "@/hooks/useTemplates";
import { useTags } from "@/hooks/useTags";
import { useToast } from "@/hooks/use-toast";

const statusColor: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-primary/10 text-primary",
  sending: "bg-accent/20 text-accent-foreground",
  sent: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  failed: "bg-destructive/10 text-destructive",
};

export default function Campaigns() {
  const { data: campaigns = [], isLoading } = useCampaigns();
  const { data: classes = [] } = useClasses();
  const { data: templates = [] } = useTemplates();
  const { data: tags = [] } = useTags();
  const addCampaign = useAddCampaign();
  const updateStatus = useUpdateCampaignStatus();
  const deleteCampaign = useDeleteCampaign();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    target_type: "all" as string,
    target_value: "",
    message_body: "",
    template_id: "",
    scheduled_at: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const status = form.scheduled_at ? "scheduled" : "draft";
    addCampaign.mutate(
      {
        name: form.name,
        target_type: form.target_type,
        target_value: form.target_value || undefined,
        message_body: form.message_body,
        template_id: form.template_id || null,
        status,
        scheduled_at: form.scheduled_at || null,
      },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setForm({ name: "", target_type: "all", target_value: "", message_body: "", template_id: "", scheduled_at: "" });
          toast({ title: "Campaign created", description: status === "scheduled" ? "Scheduled for delivery." : "Saved as draft." });
        },
      }
    );
  };

  const handleTemplateSelect = (templateId: string) => {
    const t = templates.find((tpl: any) => tpl.id === templateId);
    if (t) {
      setForm({ ...form, template_id: templateId, message_body: t.body });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground mt-1">Create and manage bulk SMS campaigns with scheduling.</p>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />New Campaign
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No campaigns yet. Create your first one!</TableCell></TableRow>
              ) : (
                campaigns.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{c.target_type === "all" ? "Everyone" : `${c.target_type}: ${c.target_value}`}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[c.status] || ""}>{c.status}</Badge>
                    </TableCell>
                    <TableCell>{c.total_recipients}</TableCell>
                    <TableCell>{c.delivered}/{c.total_recipients}</TableCell>
                    <TableCell>GHS {Number(c.cost || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.status === "draft" && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={() => updateStatus.mutate({ id: c.id, status: "sending" })}
                            title="Send now"
                          >
                            <Play className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                          onClick={() => deleteCampaign.mutate(c.id)}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
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
          <DialogHeader><DialogTitle className="font-heading">New Campaign</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Campaign Name</Label>
              <Input required placeholder="e.g. Term 2 Fee Reminder" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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
                tags.length === 0 ? (
                  <div className="text-xs text-muted-foreground rounded-md border border-dashed border-border px-3 py-2">
                    No tags exist yet. Add tags to students from the Students page first.
                  </div>
                ) : (
                  <select
                    required
                    value={form.target_value}
                    onChange={(e) => setForm({ ...form, target_value: e.target.value })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Select tag</option>
                    {tags.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                )
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Template (optional)</Label>
              <select value={form.template_id} onChange={(e) => handleTemplateSelect(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Write custom message</option>
                {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea required rows={4} placeholder="Type your message... Use {StudentName}, {ParentName}" value={form.message_body}
                onChange={(e) => setForm({ ...form, message_body: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{form.message_body.length} chars · ~{Math.ceil(form.message_body.length / 160) || 0} SMS</p>
            </div>

            <div className="space-y-1.5">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addCampaign.isPending}>
                {form.scheduled_at ? <><Clock className="w-4 h-4 mr-2" />Schedule</> : <><Send className="w-4 h-4 mr-2" />Create Draft</>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
