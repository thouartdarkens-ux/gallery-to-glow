import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, Download } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { downloadSampleCsv, getSampleNote } from "@/lib/sampleCsv";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "students" | "contacts" | "fees";
  onImport: (rows: any[]) => Promise<void>;
  requiredFields: string[];
  optionalFields?: string[];
}

function parseXlsx(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}

function processRows(
  parsedRows: Record<string, string>[],
  requiredFields: string[],
  type: "students" | "contacts" | "fees"
): { rows: any[]; errors: string[]; duplicates: number } {
  const errs: string[] = [];
  const headers = Object.keys(parsedRows[0] || {}).map(h => h.toLowerCase().trim());

  for (const field of requiredFields) {
    if (!headers.includes(field.toLowerCase())) {
      errs.push(`Missing required column: "${field}"`);
    }
  }
  if (errs.length > 0) return { rows: [], errors: errs, duplicates: 0 };

  const normalized = parsedRows.map(row => {
    const obj: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      obj[k.toLowerCase().trim()] = String(v || "").trim();
    }
    return obj;
  }).filter(r => requiredFields.every(f => r[f.toLowerCase()]));

  const key = type === "contacts" ? "phone" : type === "fees" ? "student_id" : "name";
  const seen = new Set<string>();
  let dupeCount = 0;
  const unique = normalized.filter(r => {
    const val = r[key];
    if (seen.has(val)) { dupeCount++; return false; }
    seen.add(val);
    return true;
  });

  return { rows: unique, errors: [], duplicates: dupeCount };
}

export default function CsvImportDialog({ open, onOpenChange, type, onImport, requiredFields, optionalFields = [] }: CsvImportDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"upload" | "preview" | "importing" | "done">("upload");
  const [rows, setRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<number>(0);
  const [imported, setImported] = useState(0);

  const reset = () => { setStep("upload"); setRows([]); setErrors([]); setDuplicates(0); setImported(0); };

  const handleParsedData = useCallback((parsedRows: Record<string, string>[]) => {
    const result = processRows(parsedRows, requiredFields, type);
    setErrors(result.errors);
    setDuplicates(result.duplicates);
    setRows(result.rows);
    setStep("preview");
  }, [requiredFields, type]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      parseXlsx(file)
        .then(handleParsedData)
        .catch(() => toast({ title: "Error parsing Excel file", variant: "destructive" }));
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => handleParsedData(result.data as Record<string, string>[]),
        error: () => toast({ title: "Error parsing CSV", variant: "destructive" }),
      });
    }
  }, [handleParsedData, toast]);

  const handleImport = async () => {
    setStep("importing");
    try {
      await onImport(rows);
      setImported(rows.length);
      setStep("done");
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message, variant: "destructive" });
      setStep("preview");
    }
  };

  const allFields = [...requiredFields, ...optionalFields];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Import {type === "students" ? "Students" : type === "fees" ? "Fees" : "Contacts"} from CSV/Excel
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-foreground">Not sure how to format your file?</p>
                <p className="text-xs text-muted-foreground">Download a sample CSV with the correct columns and example rows.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => downloadSampleCsv(type)}>
                <Download className="w-4 h-4 mr-2" />Download Sample
              </Button>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Upload a CSV or Excel (.xlsx) file with the following columns:
              </p>
              <div className="flex gap-1 justify-center flex-wrap mb-4">
                {requiredFields.map(f => (
                  <Badge key={f} variant="default" className="text-xs">{f} *</Badge>
                ))}
                {optionalFields.map(f => (
                  <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                ))}
              </div>
              {getSampleNote(type) && (
                <p className="text-xs text-muted-foreground mb-3 italic">{getSampleNote(type)}</p>
              )}
              <label className="cursor-pointer">
                <input type="file" accept=".csv,.txt,.xlsx,.xls" onChange={handleFile} className="hidden" />
                <Button variant="outline" asChild><span>Choose File</span></Button>
              </label>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            {errors.length > 0 ? (
              <div className="p-4 bg-destructive/10 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-destructive font-medium text-sm">
                  <AlertTriangle className="w-4 h-4" /> Validation Errors
                </div>
                {errors.map((e, i) => <p key={i} className="text-sm text-destructive">{e}</p>)}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{rows.length}</span> records ready
                    {duplicates > 0 && <span className="text-warning ml-2">({duplicates} duplicates removed)</span>}
                  </p>
                </div>
                <div className="border rounded-lg overflow-auto max-h-60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {allFields.map(f => <TableHead key={f} className="text-xs capitalize">{f}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.slice(0, 10).map((r: any, i: number) => (
                        <TableRow key={i}>
                          {allFields.map(f => (
                            <TableCell key={f} className="text-xs">{r[f.toLowerCase()] || "—"}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {rows.length > 10 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      ...and {rows.length - 10} more rows
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={reset}>Cancel</Button>
                  <Button onClick={handleImport}>Import {rows.length} Records</Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "importing" && (
          <div className="py-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Importing records...</p>
          </div>
        )}

        {step === "done" && (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-success mx-auto" />
            <p className="font-medium text-foreground">{imported} records imported successfully!</p>
            <Button onClick={() => { reset(); onOpenChange(false); }}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
