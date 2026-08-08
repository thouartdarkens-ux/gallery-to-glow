import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { DOCUMENT_KINDS, DOCUMENT_LABELS } from "@/lib/portal-shared";
import type { DocumentKindName } from "@/lib/portal-shared";
import {
  createDocumentUploadUrl,
  finalizeDocumentUpload,
  getDashboardSummary,
  updateSchoolSettings,
} from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

const PATH_KEYS: Record<DocumentKindName, string> = {
  prospectus: "prospectus_path",
  undertaking_form: "undertaking_form_path",
  programme_subjects: "programme_subjects_path",
  admission_letter: "admission_letter_path",
};

export function DocumentsPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [template, setTemplate] = useState("");
  const [motto, setMotto] = useState("");
  const [busyKind, setBusyKind] = useState<DocumentKindName | null>(null);

  const summary = useQuery({
    queryKey: ["summary", session?.school.id],
    enabled: !!session,
    queryFn: () => getDashboardSummary(session!.auth),
  });

  const settings = summary.data?.settings as Record<string, string | null> | null | undefined;

  useEffect(() => {
    if (!settings) return;
    setTemplate(settings["admission_letter_template"] ?? "");
    setMotto(settings["motto"] ?? "");
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: () =>
      updateSchoolSettings(session!.auth, { admission_letter_template: template, motto }),
    onSuccess: () => {
      toast.success("Institution settings saved");
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save settings"),
  });

  const uploadDocument = async (kind: DocumentKindName, file: File) => {
    if (!session) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File must be 25MB or smaller");
      return;
    }
    setBusyKind(kind);
    try {
      const { path, token } = await createDocumentUploadUrl(
        session.auth,
        kind,
        file.name,
      );
      const { error } = await supabase.storage
        .from("school-documents")
        .uploadToSignedUrl(path, token, file);
      if (error) throw new Error(error.message);
      await finalizeDocumentUpload(session.auth, kind, path);
      toast.success(`${DOCUMENT_LABELS[kind]} uploaded`);
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusyKind(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Documents &amp; templates</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Uploads are stored under your school code and linked to your institution record. The
          Personal Records Form is completed online by each candidate, so there is nothing to
          upload for it.
        </p>
      </div>

      <Tabs defaultValue="uploads" className="w-full">
        <TabsList>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="template">Admission letter</TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {DOCUMENT_KINDS.map((kind) => {
              const existing = settings?.[PATH_KEYS[kind]] ?? null;
              const publicUrl = existing
                ? supabase.storage.from("school-documents").getPublicUrl(existing).data.publicUrl
                : null;
              return (
                <Card key={kind}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{DOCUMENT_LABELS[kind]}</CardTitle>
                    <CardDescription>
                      {existing ? "A file is currently published." : "No file uploaded yet."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      disabled={busyKind === kind}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadDocument(kind, file);
                        event.target.value = "";
                      }}
                    />
                    {busyKind === kind ? (
                      <p className="text-xs text-muted-foreground">Uploading…</p>
                    ) : null}
                    {publicUrl ? (
                      <a
                        className="inline-block text-sm font-medium text-primary underline"
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View current file
                      </a>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="template" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admission letter template &amp; motto</CardTitle>
              <CardDescription>
                Use placeholders such as {"{{candidate_name}}"}, {"{{index_no}}"}, {"{{programme}}"} and{" "}
                {"{{residency}}"} — they are filled in when a student prints their letter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motto">School motto</Label>
                <Input
                  id="motto"
                  value={motto}
                  maxLength={200}
                  onChange={(event) => setMotto(event.target.value)}
                  placeholder="e.g. Knowledge, Service, Integrity"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template">Admission letter template</Label>
                <Textarea
                  id="template"
                  value={template}
                  onChange={(event) => setTemplate(event.target.value)}
                  rows={14}
                  maxLength={20000}
                  className="font-mono text-xs"
                  placeholder={"Dear {{candidate_name}},\n\nYou have been admitted to ..."}
                />
              </div>
              <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
                {saveSettings.isPending ? "Saving…" : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
