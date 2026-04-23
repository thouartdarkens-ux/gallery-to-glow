import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { StudentAuthProvider } from "@/contexts/StudentAuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import Index from "./pages/Index.tsx";
import Students from "./pages/Students.tsx";
import Messaging from "./pages/Messaging.tsx";
import Voice from "./pages/Voice.tsx";
import Campaigns from "./pages/Campaigns.tsx";
import Contacts from "./pages/Contacts.tsx";
import Reports from "./pages/Reports.tsx";
import Settings from "./pages/Settings.tsx";
import Billing from "./pages/Billing.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuditLogs from "./pages/AuditLogs.tsx";
import Reminders from "./pages/Reminders.tsx";
import WhatsApp from "./pages/WhatsApp.tsx";
import SmsInbox from "./pages/SmsInbox.tsx";
import Ussd from "./pages/Ussd.tsx";
import ParentPortal from "./pages/ParentPortal.tsx";
import StudentPortal from "./pages/StudentPortal.tsx";
import SetupAcademic from "./pages/SetupAcademic.tsx";
import SetupDomestic from "./pages/SetupDomestic.tsx";
import SetupAdmin from "./pages/SetupAdmin.tsx";
import UserManagement from "./pages/UserManagement.tsx";
import MyAccount from "./pages/MyAccount.tsx";
import Fees from "./pages/Fees.tsx";
import StaffDetails from "./pages/StaffDetails.tsx";
import MyClasses from "./pages/MyClasses.tsx";

const queryClient = new QueryClient();

const P = ({ path, children }: { path: string; children: React.ReactNode }) => (
  <ProtectedRoute>
    <RoleGuard path={path}>{children}</RoleGuard>
  </ProtectedRoute>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <StudentAuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<P path="/"><Index /></P>} />
                <Route path="/students" element={<P path="/students"><Students /></P>} />
                <Route path="/messaging" element={<P path="/messaging"><Messaging /></P>} />
                <Route path="/voice" element={<P path="/voice"><Voice /></P>} />
                <Route path="/campaigns" element={<P path="/campaigns"><Campaigns /></P>} />
                <Route path="/contacts" element={<P path="/contacts"><Contacts /></P>} />
                <Route path="/reports" element={<P path="/reports"><Reports /></P>} />
                <Route path="/billing" element={<P path="/billing"><Billing /></P>} />
                <Route path="/fees" element={<P path="/fees"><Fees /></P>} />
                <Route path="/settings" element={<P path="/settings"><Settings /></P>} />
                <Route path="/audit-logs" element={<P path="/audit-logs"><AuditLogs /></P>} />
                <Route path="/reminders" element={<P path="/reminders"><Reminders /></P>} />
                <Route path="/whatsapp" element={<P path="/whatsapp"><WhatsApp /></P>} />
                <Route path="/sms-inbox" element={<P path="/sms-inbox"><SmsInbox /></P>} />
                <Route path="/ussd" element={<P path="/ussd"><Ussd /></P>} />
                <Route path="/setup/academic" element={<P path="/setup/academic"><SetupAcademic /></P>} />
                <Route path="/setup/domestic" element={<P path="/setup/domestic"><SetupDomestic /></P>} />
                <Route path="/setup/admin" element={<P path="/setup/admin"><SetupAdmin /></P>} />
                <Route path="/user-management" element={<P path="/user-management"><UserManagement /></P>} />
                <Route path="/staff-details" element={<P path="/staff-details"><StaffDetails /></P>} />
                <Route path="/my-classes" element={<P path="/my-classes"><MyClasses /></P>} />
                <Route path="/my-account" element={<P path="/my-account"><MyAccount /></P>} />
                <Route path="/parent-portal" element={<ParentPortal />} />
                <Route path="/student-portal" element={<StudentPortal />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </StudentAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
