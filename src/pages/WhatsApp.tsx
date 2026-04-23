import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Send, Plus, Image } from "lucide-react";
import { useWhatsAppMessages, useSendWhatsApp } from "@/hooks/useWhatsApp";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  sent: "bg-info/10 text-info border-info/20",
  delivered: "bg-success/10 text-success border-success/20",
  read: "bg-primary/10 text-primary border-primary/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function WhatsAppPage() {
  const { data: messages = [], isLoading } = useWhatsAppMessages();
  const sendWhatsApp = useSendWhatsApp();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ recipient_phone: "", recipient_name: "", body: "", media_url: "" });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendWhatsApp.mutate(form, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ recipient_phone: "", recipient_name: "", body: "", media_url: "" });
        toast({ title: "WhatsApp message queued" });
      },
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><MessageCircle className="w-6 h-6 text-success" /></div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">WhatsApp</h1>
              <p className="text-muted-foreground mt-1">Send and track WhatsApp messages.</p>
            </div>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4 mr-2" />New Message</Button>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Direction</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : messages.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No WhatsApp messages yet.</TableCell></TableRow>
              ) : (
                messages.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Badge variant="outline" className={m.direction === "inbound" ? "bg-info/10 text-info" : ""}>
                        {m.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{m.recipient_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.recipient_phone}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm">{m.body}</TableCell>
                    <TableCell><Badge variant="outline" className={statusColors[m.status] || ""}>{m.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-heading flex items-center gap-2"><MessageCircle className="w-5 h-5" />Send WhatsApp Message</DialogTitle></DialogHeader>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input required value={form.recipient_phone} onChange={e => setForm({ ...form, recipient_phone: e.target.value })} placeholder="+233..." />
              </div>
              <div className="space-y-1.5">
                <Label>Name (optional)</Label>
                <Input value={form.recipient_name} onChange={e => setForm({ ...form, recipient_name: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea required rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Type your WhatsApp message..." />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1"><Image className="w-3 h-3" />Media URL (optional)</Label>
              <Input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={sendWhatsApp.isPending}><Send className="w-4 h-4 mr-2" />Send</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
