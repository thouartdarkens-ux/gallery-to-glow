import AppLayout from "@/components/AppLayout";
import StatCard from "@/components/StatCard";
import {
  GraduationCap, Users, MessageSquare, CheckCircle, TrendingUp, Clock,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useWallet } from "@/hooks/useWallet";
import { Link } from "react-router-dom";
import { MessageTrendChart, DeliveryRateChart, CampaignCostChart } from "@/components/DashboardCharts";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: wallet } = useWallet();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your school communications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={isLoading ? "..." : (stats?.totalStudents ?? 0).toLocaleString()}
            icon={GraduationCap}
            color="primary"
          />
          <StatCard
            title="Total Contacts"
            value={isLoading ? "..." : (stats?.totalContacts ?? 0).toLocaleString()}
            icon={Users}
            change="Parents + Promo"
            changeType="neutral"
            color="info"
          />
          <StatCard
            title="Messages Sent"
            value={isLoading ? "..." : (stats?.totalMessages ?? 0).toLocaleString()}
            icon={MessageSquare}
            color="success"
          />
          <StatCard
            title="Delivery Rate"
            value={isLoading ? "..." : stats?.deliveryRate ?? "0%"}
            icon={CheckCircle}
            color="accent"
          />
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Message Trends</h2>
            <MessageTrendChart />
          </div>
          <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Delivery Breakdown</h2>
            <DeliveryRateChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-sm">
            <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">
              Recent Campaigns
            </h2>
            <div className="space-y-3">
              {(stats?.recentCampaigns || []).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No campaigns yet. Send your first message!</p>
              ) : (
                (stats?.recentCampaigns || []).map((c: any) => (
                  <div key={c.id} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.delivered}/{c.total_recipients} delivered · {c.status}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: "Send SMS", icon: MessageSquare, href: "/messaging" },
                  { label: "Add Student", icon: GraduationCap, href: "/students" },
                  { label: "Upload Contacts", icon: Users, href: "/contacts" },
                  { label: "View Reports", icon: TrendingUp, href: "/reports" },
                ].map((action) => (
                  <Link key={action.label} to={action.href} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 hover:border-primary/30 transition-all group">
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <p className="text-xs text-muted-foreground font-medium">SMS Balance</p>
              <p className="text-2xl font-heading font-bold text-primary mt-1">
                {wallet ? `${wallet.currency} ${Number(wallet.balance).toFixed(2)}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {wallet ? "Current wallet balance" : "No wallet configured"}
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <h2 className="font-heading font-semibold text-lg text-card-foreground mb-4">Campaign Costs</h2>
              <CampaignCostChart />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
