import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Inbox, Mail, MailOpen, Reply, Search } from "lucide-react";
import { useSmsInbox, useMarkRead, useReplyToSms } from "@/hooks/useSmsInbox";
import { useToast } from "@/hooks/use-toast";

export default function SmsInboxPage() {
  const { data: messages = [], isLoading } = useSmsInbox();
  const markRead = useMarkRead();
  const replyToSms = useReplyToSms();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = messages.filter((m: any) =>
    m.sender_phone.includes(search) ||
    (m.sender_name || "").toLowerCase().includes(search.toLowerCase()) ||
    m.body.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (msg: any) => {
    setSelectedMsg(msg);
    setReplyText("");
    if (!msg.is_read) markRead.mutate(msg.id);
  };

  const handleReply = () => {
    if (!selectedMsg || !replyText.trim()) return;
    replyToSms.mutate({ id: selectedMsg.id, reply_body: replyText }, {
      onSuccess: () => {
        toast({ title: "Reply sent" });
        setSelectedMsg(null);
        setReplyText("");
      },
    });
  };

  const unreadCount = messages.filter((m: any) => !m.is_read).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Inbox className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">SMS Inbox</h1>
            <p className="text-muted-foreground mt-1">
              Two-way SMS — view incoming messages and reply.
              {unreadCount > 0 && <Badge variant="default" className="ml-2">{unreadCount} unread</Badge>}
            </p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search messages..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid gap-3">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <Inbox className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No incoming messages yet. Configure your SMS provider webhook to receive messages.</p>
            </div>
          ) : (
            filtered.map((msg: any) => (
              <button key={msg.id} onClick={() => handleSelect(msg)}
                className={`w-full text-left bg-card rounded-xl border p-4 shadow-sm transition-all hover:border-primary/30 ${!msg.is_read ? "border-primary/40 bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-md bg-muted shrink-0 mt-0.5">
                    {msg.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-card-foreground">{msg.sender_name || msg.sender_phone}</span>
                      {msg.replied && <Badge variant="outline" className="text-[10px] bg-success/10 text-success">Replied</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{msg.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(msg.received_at).toLocaleString()}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <Dialog open={!!selectedMsg} onOpenChange={(v) => { if (!v) setSelectedMsg(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Message Details</DialogTitle></DialogHeader>
          {selectedMsg && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">From: <span className="text-foreground font-medium">{selectedMsg.sender_name || selectedMsg.sender_phone}</span></p>
                <p className="text-xs text-muted-foreground">Phone: {selectedMsg.sender_phone}</p>
                <p className="text-xs text-muted-foreground">Received: {new Date(selectedMsg.received_at).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-foreground">{selectedMsg.body}</p>
              </div>
              {selectedMsg.replied && selectedMsg.reply_body && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Your reply:</p>
                  <p className="text-sm text-foreground">{selectedMsg.reply_body}</p>
                </div>
              )}
              {!selectedMsg.replied && (
                <div className="space-y-2">
                  <Textarea rows={3} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." />
                  <Button onClick={handleReply} disabled={!replyText.trim() || replyToSms.isPending} className="w-full">
                    <Reply className="w-4 h-4 mr-2" />Reply
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
