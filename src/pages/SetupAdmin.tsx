import AppLayout from "@/components/AppLayout";
import { Building2, FileText, Landmark, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHasAnyRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";

export default function SetupAdmin() {
  const hasAccess = useHasAnyRole(["headmaster", "asst_head_admin", "super_admin", "school_admin"]);

  if (!hasAccess) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Administration Setup</h1>
          <p className="text-muted-foreground mt-1">
            Manage administrative staff, finance, procurement, and school policies.
          </p>
          <Badge variant="outline" className="mt-2">Asst. Head (Administration) Domain</Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="w-5 h-5 text-primary" />
                Finance & Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Configure Bursar and Internal Auditor roles.</p>
              <p>Set up fee structures and payment schedules.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Records & Secretariat
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Assign School Secretary and manage official correspondence.</p>
              <p>Configure document templates and filing systems.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-primary" />
                Procurement & Stores
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Assign Supply Officer and manage procurement processes.</p>
              <p>Track inventory and store requisitions.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                ICT & Technical
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Assign ICT Coordinator and Technical Officers.</p>
              <p>Manage IT infrastructure and technical support.</p>
              <Badge variant="outline" className="text-warning border-warning">Coming Soon</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
