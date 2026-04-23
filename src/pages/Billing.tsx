import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useWallet, useWalletTransactions } from "@/hooks/useWallet";

export default function Billing() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions = [], isLoading: txLoading } = useWalletTransactions();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">SMS Wallet & Billing</h1>
            <p className="text-muted-foreground mt-1">Track your SMS credit balance and usage.</p>
          </div>
          <Button size="sm" disabled>
            <Wallet className="w-4 h-4 mr-2" />Recharge (Coming Soon)
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Current Balance"
            value={walletLoading ? "..." : `GHS ${Number(wallet?.balance || 0).toFixed(2)}`}
            icon={Wallet}
            color="primary"
          />
          <StatCard
            title="Total Top-ups"
            value={txLoading ? "..." : `GHS ${transactions.filter((t: any) => t.type === "credit").reduce((s: number, t: any) => s + Number(t.amount), 0).toFixed(2)}`}
            icon={ArrowUpCircle}
            color="success"
          />
          <StatCard
            title="Total Spent"
            value={txLoading ? "..." : `GHS ${transactions.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + Number(t.amount), 0).toFixed(2)}`}
            icon={ArrowDownCircle}
            color="accent"
          />
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-heading font-semibold text-card-foreground">Transaction History</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions yet.</TableCell></TableRow>
              ) : (
                transactions.map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.type === "credit" ? "default" : "secondary"} className="capitalize">
                        {t.type === "credit" ? <ArrowUpCircle className="w-3 h-3 mr-1" /> : <ArrowDownCircle className="w-3 h-3 mr-1" />}
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={`font-medium ${t.type === "credit" ? "text-green-600" : "text-destructive"}`}>
                      {t.type === "credit" ? "+" : "-"}GHS {Number(t.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>GHS {Number(t.balance_after).toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{t.description || "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{t.reference || "—"}</TableCell>
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
