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
import { HouseClassConfig } from "@/components/portal/house-class-config";
import { parseCsv } from "@/lib/csv";
import { ASSIGNMENT_CSV_HEADERS, ASSIGNMENT_CSV_SAMPLE } from "@/lib/portal-shared";
import type { AssignmentRowInput } from "@/lib/portal-shared";
import { assignHousesAndClasses, getAssignmentData } from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

export function AssignmentsPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<{ index_no: string; reason: string }[]>([]);

  const data = useQuery({
    queryKey: ["assignments", session?.school.id],
    enabled: !!session,
    queryFn: () => getAssignmentData(session!.auth),
  });

  const assign = useMutation({
    mutationFn: (assignments: AssignmentRowInput[]) =>
      assignHousesAndClasses(session!.auth, assignments),
    onSuccess: (result) => {
      toast.success(`${result.updated} student(s) updated`);
      if (result.failed > 0) toast.error(`${result.failed} row(s) failed`);
      setErrors(result.errors);
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Assignment failed"),
  });

  const houses = data.data?.houses ?? [];
  const classes = data.data?.classes ?? [];
  const students = (data.data?.students ?? []).filter((student) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return (
      student.index_no.toLowerCase().includes(needle) ||
      student.full_name.toLowerCase().includes(needle)
    );
  });

  const houseName = (id: number | null) => houses.find((h) => h.id === id)?.name ?? "—";
  const className = (id: number | null) => classes.find((c) => c.id === id)?.name ?? "—";

  const handleFile = async (file: File) => {
    const rows = parseCsv(await file.text());
    if (rows.length === 0) {
      toast.error("No rows found in that file");
      return;
    }
    assign.mutate(
      rows.map((row) => ({
        index_no: row["index_no"] ?? "",
        house: row["house"] ?? "",
        class: row["class"] ?? "",
      })),
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Houses &amp; classes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Assignments are matched by house/class name within your institution.
          </p>
        </div>
      </div>

      <Tabs defaultValue="setup" className="w-full">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="students">Student register</TabsTrigger>
          <TabsTrigger value="bulk">Bulk upload</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-4">
          <HouseClassConfig />
        </TabsContent>

        <TabsContent value="bulk" className="mt-4 space-y-6">
          <CsvSample
            headers={ASSIGNMENT_CSV_HEADERS}
            sample={ASSIGNMENT_CSV_SAMPLE}
            fileName="assignment-template.csv"
          />
          <Card>
          <CardHeader>
            <CardTitle className="text-base">Bulk assignment upload</CardTitle>
            <CardDescription>
              Columns: index_no, house, class. Leave a cell blank to skip that field.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              accept=".csv,text/csv"
              disabled={assign.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Available houses
              </p>
              <p className="text-sm text-foreground">
                {houses.length ? houses.map((h) => h.name).join(", ") : "None configured"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Available classes
              </p>
              <p className="text-sm text-foreground">
                {classes.length ? classes.map((c) => c.name).join(", ") : "None configured"}
              </p>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student register</CardTitle>
            <CardDescription>Assign a single student directly from the table.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Index number or name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            {data.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading students…</p>
            ) : students.length ? (
              <div className="max-h-[26rem] overflow-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Index no</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>House</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead className="w-[220px]">Assign</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.index_no}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{houseName(student.house_id)}</TableCell>
                        <TableCell>{className(student.class_id)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <select
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                              defaultValue=""
                              onChange={(event) => {
                                if (!event.target.value) return;
                                assign.mutate([
                                  { index_no: student.index_no, house: event.target.value },
                                ]);
                              }}
                            >
                              <option value="">House…</option>
                              {houses.map((house) => (
                                <option key={house.id} value={house.name}>
                                  {house.name}
                                </option>
                              ))}
                            </select>
                            <select
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                              defaultValue=""
                              onChange={(event) => {
                                if (!event.target.value) return;
                                assign.mutate([
                                  { index_no: student.index_no, class: event.target.value },
                                ]);
                              }}
                            >
                              <option value="">Class…</option>
                              {classes.map((klass) => (
                                <option key={klass.id} value={klass.name}>
                                  {klass.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No students on the register yet — sync your placements first.
              </p>
            )}
          </CardContent>
        </Card>
        </TabsContent>
      </Tabs>

      {errors.length > 0 ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Failed assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {errors.map((row, index) => (
              <p key={`${row.index_no}-${index}`} className="text-muted-foreground">
                <span className="font-medium text-foreground">{row.index_no || "(no index)"}</span>{" "}
                — {row.reason}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
