import AppLayout from "@/components/AppLayout";
import { Utensils, Home, ShieldCheck, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHasAnyRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";

export default function SetupDomestic() {
  const hasAccess = useHasAnyRole(["headmaster", "asst_head_domestic", "super_admin", "school_admin"]);

  if (!hasAccess) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Domestic Setup</h1>
          <p className="text-muted-foreground mt-1">
            Manage boarding, catering, housekeeping, and security assignments.
          </p>
          <Badge variant="outline" className="mt-2">Asst. Head (Domestic) Domain</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5 text-primary" />
                Houses & Boarding
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Configure houses and assign Housemasters/Housemistresses.</p>
              <p>Manage dormitory allocation and boarding student records.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Utensils className="w-5 h-5 text-primary" />
                Catering & Kitchen
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Assign Chief Cook, Assistant Cooks, and Pantry staff.</p>
              <p>Manage meal planning and kitchen inventory.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Security & Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Assign security officers and manage duty rosters.</p>
              <p>Track maintenance requests and cleaning schedules.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="w-5 h-5 text-primary" />
                Transport & Logistics
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Manage school drivers and vehicle assignments.</p>
              <p>Track fuel usage and vehicle maintenance schedules.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
