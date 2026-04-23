import { useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Save, Users, Tag, GraduationCap, Sparkles, Loader2, Eye, Wallet, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTemplates, useAddTemplate } from "@/hooks/useTemplates";
import { useClasses } from "@/hooks/useClasses";
import { useRecipients } from "@/hooks/useTargeting";
import { applyPlaceholders, PLACEHOLDERS, SAMPLE_RECIPIENT, AudienceFilter } from "@/lib/targeting";
import { supabase } from "@/integrations/supabase/client";

const PROGRAMS = ["General Science", "General Arts", "Business", "Visual Arts", "Home Economics", "Agriculture"];
const LEVELS = ["SHS 1", "SHS 2", "SHS 3", "JHS 1", "JHS 2", "JHS 3"];

export default function Messaging() {
  const { toast } = useToast();
  const { data: templates = [] } = useTemplates();
  const { data: classes = [] } = useClasses();
  const addTemplate = useAddTemplate();

  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<AudienceFilter>({
    scope: "all",
    residency: "any",
    feeStatus: "any",
    finalistsOnly: false,
  });

  const { data: recipients = [], isFetching } = useRecipients(filter);

  const [saveOpen, setSaveOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [previewIdx, setPreviewIdx] = useState(0);

  // AI Suggestions
  const [aiContext, setAiContext] = useState("");
  const [aiType, setAiType] = useState("general");
  const [suggestions, setSuggestions] = useState<{ title: string; body: string }[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const sample = recipients[previewIdx] || SAMPLE_RECIPIENT;
  const renderedPreview = useMemo(() => applyPlaceholders(message || "Type a message…", sample), [message, sample]);
  const charCount = renderedPreview.length;
  const smsCount = Math.ceil(charCount / 160) || 0;
  const estCost = (recipients.length * smsCount * 0.03).toFixed(2);

  const insertToken = (tok: string) => setMessage((m) => m + tok);

  const handleSend = () => {
    if (recipients.length === 0) {
      toast({ title: "No recipients", description: "Adjust your filters.", variant: "destructive" });
      return;
    }
    toast({
      title: "SMS Queued",
      description: `${recipients.length} message${recipients.length > 1 ? "s" : ""} queued for delivery.`,
    });
    setMessage("");
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    addTemplate.mutate({ name: templateName, body: message }, {
      onSuccess: () => { setSaveOpen(false); setTemplateName(""); toast({ title: "Template saved" }); },
    });
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-message", {
        body: { context: aiContext, type: aiType },
      });
      if (error) throw error;
      if (data?.error) toast({ title: "AI Error", description: data.error, variant: "destructive" });
      else setSuggestions(data.suggestions || []);
    } catch (err: any) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const quickPresets: { label: string; icon: any; apply: () => void }[] = [
    { label: "All Debtors", icon: Wallet, apply: () => setFilter({ scope: "all", residency: "any", feeStatus: "owing", finalistsOnly: false }) },
    { label: "Boarding Students", icon: BookOpen, apply: () => setFilter({ scope: "all", residency: "Boarding", feeStatus: "any", finalistsOnly: false }) },
    { label: "Finalists (SHS 3)", icon: GraduationCap, apply: () => setFilter({ scope: "all", residency: "any", feeStatus: "any", finalistsOnly: true }) },
    { label: "Everyone", icon: Users, apply: () => setFilter({ scope: "all", residency: "any", feeStatus: "any", finalistsOnly: false }) },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Smart Messaging</h1>
          <p className="text-muted-foreground mt-1">Target the right parents with filters and personalized placeholders.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Quick presets */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-heading font-semibold text-card-foreground">Quick Targets</h2>
              <div className="flex flex-wrap gap-2">
                {quickPresets.map((p) => (
                  <Button key={p.label} variant="outline" size="sm" onClick={p.apply}>
                    <p.icon className="w-4 h-4 mr-1.5" />{p.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Audience builder */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-heading font-semibold text-card-foreground">Audience Filters</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Scope</Label>
                  <select value={filter.scope}
                    onChange={(e) => setFilter({ ...filter, scope: e.target.value as any, value: "" })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="all">Entire School</option>
                    <option value="class">Specific Class</option>
                    <option value="level">Year Level</option>
                    <option value="program">Programme</option>
                    <option value="tag">By Tag</option>
                  </select>
                </div>

                {filter.scope === "class" && (
                  <div className="space-y-1.5">
                    <Label>Class</Label>
                    <select value={filter.value || ""} onChange={(e) => setFilter({ ...filter, value: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select class</option>
                      {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                {filter.scope === "level" && (
                  <div className="space-y-1.5">
                    <Label>Level</Label>
                    <select value={filter.value || ""} onChange={(e) => setFilter({ ...filter, value: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select level</option>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                )}
                {filter.scope === "program" && (
                  <div className="space-y-1.5">
                    <Label>Programme</Label>
                    <select value={filter.value || ""} onChange={(e) => setFilter({ ...filter, value: e.target.value })}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select programme</option>
                      {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
                {filter.scope === "tag" && (
                  <div className="space-y-1.5">
                    <Label>Tag</Label>
                    <Input placeholder="e.g. Debtors" value={filter.value || ""} onChange={(e) => setFilter({ ...filter, value: e.target.value })} />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Residency</Label>
                  <select value={filter.residency} onChange={(e) => setFilter({ ...filter, residency: e.target.value as any })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="any">Any</option>
                    <option value="Day">Day Students</option>
                    <option value="Boarding">Boarding Students</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Fee Status</Label>
                  <select value={filter.feeStatus} onChange={(e) => setFilter({ ...filter, feeStatus: e.target.value as any })}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="any">Any</option>
                    <option value="owing">Debtors (owing + partial)</option>
                    <option value="paid">Fully Paid</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="free_shs">Free SHS</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div>
                  <p className="text-sm font-medium text-card-foreground">Finalists only (SHS 3)</p>
                  <p className="text-xs text-muted-foreground">Restrict to final-year students.</p>
                </div>
                <Switch checked={!!filter.finalistsOnly} onCheckedChange={(v) => setFilter({ ...filter, finalistsOnly: v })} />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary" className="text-sm">
                  {isFetching ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Users className="w-3 h-3 mr-1" />}
                  {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
                </Badge>
                <Badge variant="outline">~{smsCount} SMS each</Badge>
                <Badge variant="outline">Est. GHS {estCost}</Badge>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="bg-card rounded-xl border border-primary/20 p-5 shadow-sm space-y-4">
              <h2 className="font-heading font-semibold text-card-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> AI Message Suggestions
              </h2>
              <div className="flex gap-3">
                <select value={aiType} onChange={e => setAiType(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="general">General</option>
                  <option value="fees">Fee Reminder</option>
                  <option value="exams">Exam Notice</option>
                  <option value="events">Event</option>
                </select>
                <Input placeholder="Additional context (optional)..." value={aiContext}
                  onChange={e => setAiContext(e.target.value)} className="flex-1" />
                <Button onClick={handleAiSuggest} disabled={aiLoading} variant="outline">
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span className="ml-1.5">Suggest</span>
                </Button>
              </div>
              {suggestions.length > 0 && (
                <div className="grid gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setMessage(s.body)}
                      className="w-full text-left p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all">
                      <p className="text-xs font-medium text-primary">{s.title}</p>
                      <p className="text-sm text-card-foreground mt-1">{s.body}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compose */}
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm space-y-4">
              <h2 className="font-heading font-semibold text-card-foreground">Compose Message</h2>

              <div className="flex flex-wrap gap-1.5">
                {PLACEHOLDERS.map((p) => (
                  <button key={p.token} type="button" onClick={() => insertToken(p.token)}
                    title={p.desc}
                    className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    {p.token}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea placeholder="Hi {ParentName}, this is a reminder that {StudentName} ({Class}) has an outstanding balance of {Balance}. Thank you."
                  rows={5} value={message} onChange={(e) => setMessage(e.target.value)} />
                <p className="text-xs text-muted-foreground">{message.length} chars in template · rendered ~{charCount} chars · {smsCount} SMS</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSend} disabled={!message.trim() || recipients.length === 0}>
                  <Send className="w-4 h-4 mr-2" />Send to {recipients.length}
                </Button>
                <Button variant="outline" onClick={() => setSaveOpen(true)} disabled={!message.trim()}>
                  <Save className="w-4 h-4 mr-2" />Save Template
                </Button>
              </div>
            </div>
          </div>

          {/* Right column: Live preview + templates */}
          <div className="space-y-5">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-card-foreground mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Live Preview
              </h2>

              {recipients.length > 1 && (
                <div className="flex items-center justify-between mb-3 text-xs">
                  <button onClick={() => setPreviewIdx((i) => Math.max(0, i - 1))}
                    className="px-2 py-1 rounded border border-border hover:bg-muted">← Prev</button>
                  <span className="text-muted-foreground">{previewIdx + 1} / {recipients.length}</span>
                  <button onClick={() => setPreviewIdx((i) => Math.min(recipients.length - 1, i + 1))}
                    className="px-2 py-1 rounded border border-border hover:bg-muted">Next →</button>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="text-xs text-muted-foreground">
                  To: <span className="font-medium text-card-foreground">{sample.parent_name || "Parent"}</span>
                  {" · "}
                  <span className="font-mono">{sample.parent_phone || "—"}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Re: {sample.student_name} ({sample.class_name || "—"})
                </div>
                <div className="rounded-md bg-background border border-border p-3 text-sm text-card-foreground whitespace-pre-wrap">
                  {renderedPreview}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                {recipients.length === 0 ? "Showing sample data — no recipients match current filters." : "Preview uses real recipient data."}
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-card-foreground mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Templates
              </h2>
              <div className="space-y-3">
                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No templates yet.</p>
                ) : (
                  templates.map((t: any) => (
                    <button key={t.id} onClick={() => setMessage(t.body)}
                      className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all">
                      <p className="text-sm font-medium text-card-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.body}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="font-heading">Save Template</DialogTitle></DialogHeader>
          <form onSubmit={handleSaveTemplate} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Template Name</Label>
              <Input required value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="e.g. Fee Reminder" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSaveOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addTemplate.isPending}>Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
