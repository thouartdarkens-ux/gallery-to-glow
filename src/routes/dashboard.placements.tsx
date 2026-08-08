import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CsvSample } from "@/components/portal/csv-sample";
import { downloadFile, parseCsv, toCsv } from "@/lib/csv";
import { PLACEMENT_CSV_HEADERS, PLACEMENT_CSV_SAMPLE } from "@/lib/portal-shared";
import type { PlacementRowInput } from "@/lib/portal-shared";
import { listPlacements, syncPlacementsToStudents, uploadPlacements } from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

const emptyForm = {
  index_no: "",
  candidate_name: "",
  gender: "Male",
  date_of_birth: "",
  jhs_attended: "",
  programme_code: "",
  programme: "",
  residency: "Day",
  enrolment_code: "",
  aggregate: "",
  completion_year: String(new Date().getFullYear()),
  phone: "",
};

export function PlacementsPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [rejected, setRejected] = useState<{ index_no: string; reason: string }[]>([]);
  const [uploadYear, setUploadYear] = useState(String(new Date().getFullYear()));

  const placements = useQuery({
    queryKey: ["placements", session?.school.id],
    enabled: !!session,
    queryFn: () => listPlacements(session!.auth),
  });

  const upload = useMutation({
    mutationFn: (rows: PlacementRowInput[]) => uploadPlacements(session!.auth, rows),
    onSuccess: (result) => {
      toast.success(`${result.saved} placement row(s) saved`);
      if (result.failed > 0) {
        toast.error(`${result.failed} row(s) rejected — see the rejected rows list`);
      }
      setRejected(result.errors);
      queryClient.invalidateQueries({ queryKey: ["placements"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Upload failed"),
  });

  const sync = useMutation({
    mutationFn: () => syncPlacementsToStudents(session!.auth),
    onSuccess: (result) => {
      toast.success(`${result.synced} student record(s) created or updated`);
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Sync failed"),
  });

  const handleFile = async (file: File) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length === 0) {
      toast.error("No rows found in that file");
      return;
    }
    const rows: PlacementRowInput[] = parsed.map((row) => ({
      index_no: row["index_number"] ?? row["index_no"] ?? "",
      candidate_name: row["candidate_name"] ?? row["name"] ?? "",
      gender: row["gender"] ?? "",
      date_of_birth: row["date_of_birth"] ?? row["dob"] ?? "",
      jhs_attended: row["jhs_attended"] ?? row["jhs"] ?? "",
      programme_code: row["programme_code"] ?? row["program_code"] ?? "",
      programme: row["programme_name"] ?? row["programme"] ?? row["program"] ?? "",
      residency: row["residency"] ?? "",
      enrolment_code: row["enrolment_code"] ?? "",
      aggregate: row["aggregate"] ? Number(row["aggregate"]) : null,
      completion_year: row["completion_year"] ?? row["year"] ?? uploadYear,
      phone: row["phone"] ?? row["phone_number"] ?? row["contact"] ?? "",
    }));
    upload.mutate(rows);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Placement data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            All uploads are tagged with your school ID automatically.
          </p>
        </div>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="upload">Bulk upload</TabsTrigger>
          <TabsTrigger value="manual">Add placement</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4 space-y-6">
          <CsvSample
            headers={PLACEMENT_CSV_HEADERS}
            sample={PLACEMENT_CSV_SAMPLE}
            fileName="placement-template.csv"
          />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Bulk CSV upload</CardTitle>
              <CardDescription>
                Columns: {PLACEMENT_CSV_HEADERS.join(", ")}. Existing index numbers for the same
                completion year are updated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 sm:max-w-xs">
                <Label htmlFor="upload-year">Completion year for this upload</Label>
                <Input
                  id="upload-year"
                  value={uploadYear}
                  maxLength={4}
                  onChange={(event) => setUploadYear(event.target.value.replace(/\D/g, ""))}
                />
                <p className="text-xs text-muted-foreground">
                  Used when the CSV has no completion year column.
                </p>
              </div>
              <Input
                type="file"
                accept=".csv,text/csv"
                disabled={upload.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file);
                  event.target.value = "";
                }}
              />
              {upload.isPending ? (
                <p className="text-sm text-muted-foreground">Uploading…</p>
              ) : null}
              <div className="rounded-md border border-border bg-muted/40 p-4">
                <p className="text-sm font-medium text-foreground">Sync to student register</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Copies index number, name, gender, programme, residency, enrolment code and
                  aggregate from placements onto the students table.
                </p>
                <Button
                  className="mt-3"
                  onClick={() => sync.mutate()}
                  disabled={sync.isPending || !session}
                >
                  {sync.isPending ? "Syncing…" : "Sync placements to students"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add a single placement</CardTitle>
              <CardDescription>For late or corrected placements.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  upload.mutate([
                    {
                      index_no: form.index_no,
                      candidate_name: form.candidate_name,
                      gender: form.gender,
                      date_of_birth: form.date_of_birth,
                      jhs_attended: form.jhs_attended,
                      programme_code: form.programme_code,
                      programme: form.programme,
                      residency: form.residency,
                      enrolment_code: form.enrolment_code,
                      aggregate: form.aggregate ? Number(form.aggregate) : null,
                      completion_year: form.completion_year,
                      phone: form.phone,
                    },
                  ]);
                  setForm(emptyForm);
                }}
              >
                <Field label="Index number" required>
                  <Input
                    value={form.index_no}
                    onChange={(event) => setForm({ ...form, index_no: event.target.value })}
                    required
                  />
                </Field>
                <Field label="Candidate name" required>
                  <Input
                    value={form.candidate_name}
                    onChange={(event) => setForm({ ...form, candidate_name: event.target.value })}
                    required
                  />
                </Field>
                <Field label="Gender">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.gender}
                    onChange={(event) => setForm({ ...form, gender: event.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </Field>
                <Field label="Residency">
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.residency}
                    onChange={(event) => setForm({ ...form, residency: event.target.value })}
                  >
                    <option value="Day">Day</option>
                    <option value="Boarding">Boarding</option>
                  </select>
                </Field>
                <Field label="Programme" required>
                  <Input
                    value={form.programme}
                    onChange={(event) => setForm({ ...form, programme: event.target.value })}
                    required
                  />
                </Field>
                <Field label="Date of birth">
                  <Input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(event) => setForm({ ...form, date_of_birth: event.target.value })}
                  />
                </Field>
                <Field label="JHS attended">
                  <Input
                    value={form.jhs_attended}
                    onChange={(event) => setForm({ ...form, jhs_attended: event.target.value })}
                  />
                </Field>
                <Field label="Programme code">
                  <Input
                    value={form.programme_code}
                    placeholder="SCI"
                    onChange={(event) => setForm({ ...form, programme_code: event.target.value })}
                  />
                </Field>
                <Field label="Completion year" required>
                  <Input
                    value={form.completion_year}
                    onChange={(event) =>
                      setForm({ ...form, completion_year: event.target.value.replace(/\D/g, "") })
                    }
                    maxLength={4}
                    required
                  />
                </Field>
                <Field label="Enrolment code">
                  <Input
                    value={form.enrolment_code}
                    onChange={(event) => setForm({ ...form, enrolment_code: event.target.value })}
                  />
                </Field>
                <Field label="Phone number">
                  <Input
                    value={form.phone}
                    placeholder="0244000111"
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </Field>
                <Field label="Aggregate">
                  <Input
                    value={form.aggregate}
                    onChange={(event) =>
                      setForm({ ...form, aggregate: event.target.value.replace(/\D/g, "") })
                    }
                    maxLength={2}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={upload.isPending}>
                    Save placement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-4 space-y-6">
          {rejected.length > 0 ? (
            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Rejected rows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                {rejected.map((row, index) => (
                  <p key={`${row.index_no}-${index}`} className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {row.index_no || "(no index)"}
                    </span>{" "}
                    — {row.reason}
                  </p>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Uploaded placements</CardTitle>
                <CardDescription>Latest 500 rows for your institution.</CardDescription>
              </div>
              <Button
                variant="outline"
                disabled={!placements.data?.rows.length}
                onClick={() =>
                  downloadFile(
                    `placements-${session?.school.code}.csv`,
                    toCsv(placements.data?.rows ?? []),
                  )
                }
              >
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {placements.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading placements…</p>
              ) : placements.data?.rows.length ? (
                <div className="max-h-[28rem] overflow-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Index no</TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>DOB</TableHead>
                        <TableHead>JHS attended</TableHead>
                        <TableHead>Prog. code</TableHead>
                        <TableHead>Programme</TableHead>
                        <TableHead>Residency</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Agg.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {placements.data.rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.index_no}</TableCell>
                          <TableCell>{row.candidate_name}</TableCell>
                          <TableCell>{row.date_of_birth ?? "—"}</TableCell>
                          <TableCell>{row.jhs_attended ?? "—"}</TableCell>
                          <TableCell>{row.programme_code ?? "—"}</TableCell>
                          <TableCell>{row.programme}</TableCell>
                          <TableCell>{row.residency}</TableCell>
                          <TableCell>{row.phone ?? "—"}</TableCell>
                          <TableCell>{row.completion_year}</TableCell>
                          <TableCell>{row.aggregate ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No placements uploaded for this institution yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
    </div>
  );
}
