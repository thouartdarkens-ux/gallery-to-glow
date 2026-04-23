import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Upload, Search, Trash2, Filter, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { useContacts, useAddContact, useDeleteContact } from "@/hooks/useContacts";
import CsvImportDialog from "@/components/CsvImportDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SEGMENTS = ["general", "parent", "alumni", "prospect", "staff", "other"];

export default function Contacts() {
  const { data: contacts = [], isLoading } = useContacts();
  const addContact = useAddContact();
  const deleteContact = useDeleteContact();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", location: "", tag: "", segment: "general" });

  const filtered = contacts.filter((c: any) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || (c.tag || "").toLowerCase().includes(search.toLowerCase());
    const matchSegment = segmentFilter === "all" || c.segment === segmentFilter;
    return matchSearch && matchSegment;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addContact.mutate({ ...form } as any, {
      onSuccess: () => {
        setDialogOpen(false);
        setForm({ name: "", phone: "", location: "", tag: "", segment: "general" });
        toast({ title: "Contact added" });
      },
    });
  };

  const handleCsvImport = async (rows: any[]) => {
    const batch = rows.map(r => ({
      name: r.name,
      phone: r.phone,
      location: r.location || null,
      tag: r.tag || null,
      segment: r.segment || "general",
    }));
    const { error } = await (supabase as any).from("contacts").insert(batch);
    if (error) throw error;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Contacts</h1>
            <p className="text-muted-foreground mt-1">Manage contacts with segmentation.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              exportToCsv("contacts.csv", filtered.map((c: any) => ({
                name: c.name, phone: c.phone, location: c.location || "", segment: c.segment || "", tag: c.tag || "",
              })));
            }}>
              <Download className="w-4 h-4 mr-2" />Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />Import CSV
            </Button>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Add Contact
            </Button>
          </div>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1.5 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {["all", ...SEGMENTS].map((seg) => (
              <Button key={seg} variant={segmentFilter === seg ? "default" : "outline"} size="sm"
                onClick={() => setSegmentFilter(seg)} className="capitalize text-xs h-8">
                {seg}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Tag</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No contacts found.</TableCell></TableRow>
              ) : (
                filtered.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                    <TableCell>{c.location}</TableCell>
                    <TableCell><Badge variant="secondary" className="capitalize">{c.segment || "general"}</Badge></TableCell>
                    <TableCell>{c.tag && <Badge variant="outline">{c.tag}</Badge>}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => deleteContact.mutate(c.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="font-heading">Add Contact</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Tag</Label><Input placeholder="e.g. VIP" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} /></div>
              <div className="col-span-2 space-y-1.5">
                <Label>Segment</Label>
                <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm capitalize">
                  {SEGMENTS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addContact.isPending}>Add Contact</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CsvImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        type="contacts"
        requiredFields={["name", "phone"]}
        optionalFields={["location", "tag", "segment"]}
        onImport={handleCsvImport}
      />
    </AppLayout>
  );
}
