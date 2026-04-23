import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import { Send, CheckCircle, XCircle, DollarSign, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const { data: messages = [] } = useQuery({
    queryKey: ["report-messages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const totalSent = messages.length;
  const delivered = messages.filter((m) => m.status === "delivered").length;
  const failed = messages.filter((m) => m.status === "failed").length;
  const totalCost = messages.reduce((sum, m) => sum + Number(m.cost || 0), 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Track message delivery and campaign performance.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            exportToCsv("reports.csv", messages.map((m: any) => ({
              recipient: m.recipient_name || "", phone: m.recipient_phone, message: m.body,
              status: m.status, cost: m.cost || 0, date: new Date(m.created_at).toLocaleDateString(),
            })));
          }}>
            <Download className="w-4 h-4 mr-2" />Export
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Sent" value={totalSent} icon={Send} color="info" />
          <StatCard title="Delivered" value={delivered} icon={CheckCircle} change={totalSent > 0 ? `${((delivered / totalSent) * 100).toFixed(1)}%` : "—"} changeType="positive" color="success" />
          <StatCard title="Failed" value={failed} icon={XCircle} change={totalSent > 0 ? `${((failed / totalSent) * 100).toFixed(1)}%` : "—"} changeType="negative" color="primary" />
          <StatCard title="Total Cost" value={`GHS ${totalCost.toFixed(2)}`} icon={DollarSign} color="warning" />
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No messages yet. Send your first SMS to see reports here.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.recipient_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{m.recipient_phone}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{m.body}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        m.status === "delivered" ? "bg-success/10 text-success border-success/20" :
                        m.status === "failed" ? "bg-destructive/10 text-destructive border-destructive/20" :
                        "bg-warning/10 text-warning border-warning/20"
                      }>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell>GHS {Number(m.cost || 0).toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(m.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
