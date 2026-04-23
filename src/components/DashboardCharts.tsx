import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";

const sb = supabase as any;

const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(0, 72%, 51%)",
  "hsl(38, 92%, 50%)",
  "hsl(210, 90%, 52%)",
];

export function MessageTrendChart() {
  const { data = [] } = useQuery({
    queryKey: ["message-trends"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("messages")
        .select("created_at, status")
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;

      const byDay: Record<string, { date: string; sent: number; delivered: number; failed: number }> = {};
      (data || []).forEach((m: any) => {
        const day = new Date(m.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
        if (!byDay[day]) byDay[day] = { date: day, sent: 0, delivered: 0, failed: 0 };
        byDay[day].sent++;
        if (m.status === "delivered") byDay[day].delivered++;
        if (m.status === "failed") byDay[day].failed++;
      });
      return Object.values(byDay).slice(-14);
    },
  });

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No message data to chart yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: 12,
          }}
        />
        <Bar dataKey="delivered" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Delivered" />
        <Bar dataKey="failed" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Failed" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DeliveryRateChart() {
  const { data } = useQuery({
    queryKey: ["delivery-rate-chart"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("messages")
        .select("status")
        .limit(1000);
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((m: any) => {
        counts[m.status] = (counts[m.status] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No delivery data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CampaignCostChart() {
  const { data = [] } = useQuery({
    queryKey: ["campaign-cost-chart"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("campaigns")
        .select("name, cost, created_at")
        .order("created_at", { ascending: true })
        .limit(20);
      if (error) throw error;
      return (data || []).map((c: any) => ({
        name: c.name?.substring(0, 15) || "Untitled",
        cost: Number(c.cost || 0),
      }));
    },
  });

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No campaign cost data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="cost" stroke="hsl(168, 65%, 38%)" strokeWidth={2} dot={{ r: 4 }} name="Cost (GHS)" />
      </LineChart>
    </ResponsiveContainer>
  );
}
