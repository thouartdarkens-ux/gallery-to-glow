import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { downloadFile, toCsv } from "@/lib/csv";

export function CsvSample({
  headers,
  sample,
  fileName,
}: {
  headers: string[];
  sample: Record<string, string>[];
  fileName: string;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Sample CSV format</p>
          <p className="text-xs text-muted-foreground">
            The first row must be the header row, spelled exactly as shown.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadFile(fileName, toCsv([], headers))}
          >
            Blank template
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              downloadFile(fileName.replace(".csv", "-sample.csv"), toCsv(sample, headers))
            }
          >
            Sample with data
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="whitespace-nowrap font-mono text-xs">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sample.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header} className="whitespace-nowrap text-xs">
                    {row[header] ?? ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <pre className="overflow-x-auto rounded-md bg-sidebar p-3 text-[0.7rem] leading-relaxed text-sidebar-foreground">
        {toCsv(sample, headers)}
      </pre>
    </div>
  );
}
