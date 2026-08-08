import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadFile, toCsv } from "@/lib/csv";
import { listStudentRecords } from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

export function RecordsPage() {
  const session = useSession();
  const [search, setSearch] = useState("");

  const records = useQuery({
    queryKey: ["records", session?.school.id],
    enabled: !!session,
    queryFn: () => listStudentRecords(session!.auth),
  });

  const rows = records.data?.rows ?? [];
  const filtered = rows.filter((row) => {
    if (!search.trim()) return true;
    const needle = search.trim().toLowerCase();
    return [row["index_no"], row["surname"], row["other_names"], row["programme"]]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(needle));
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Student records</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Only records submitted by candidates placed in your institution are shown.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            className="w-56"
            placeholder="Search index no or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button
            disabled={filtered.length === 0}
            onClick={() =>
              downloadFile(
                `student-records-${session?.school.code}-${new Date().toISOString().slice(0, 10)}.csv`,
                toCsv(filtered as unknown as Record<string, unknown>[]),
              )
            }
          >
            Download {filtered.length} record(s)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submitted enrolment forms</CardTitle>
          <CardDescription>
            The CSV export contains every captured field, including guardian details and document
            paths.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading records…</p>
          ) : filtered.length ? (
            <div className="max-h-[32rem] overflow-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Index no</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Residency</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row["id"] as string | number}>
                      <TableCell className="font-medium">{String(row["index_no"] ?? "")}</TableCell>
                      <TableCell>
                        {[row["surname"], row["other_names"]].filter(Boolean).join(" ") || "—"}
                      </TableCell>
                      <TableCell>{String(row["gender"] ?? "—")}</TableCell>
                      <TableCell>{String(row["programme"] ?? "—")}</TableCell>
                      <TableCell>{String(row["residency"] ?? "—")}</TableCell>
                      <TableCell>
                        {String(row["guardian_name"] ?? row["father_name"] ?? "—")}
                      </TableCell>
                      <TableCell>{String(row["status"] ?? "—")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No student records found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
