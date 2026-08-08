import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage } from "@/routes/index";
import { DashboardLayout } from "@/routes/dashboard";
import { OverviewPage } from "@/routes/dashboard.index";
import { PlacementsPage } from "@/routes/dashboard.placements";
import { RecordsPage } from "@/routes/dashboard.records";
import { AssignmentsPage } from "@/routes/dashboard.assignments";
import { DocumentsPage } from "@/routes/dashboard.documents";
import { InstitutionPage } from "@/routes/dashboard.institution";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="placements" element={<PlacementsPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="institution" element={<InstitutionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
