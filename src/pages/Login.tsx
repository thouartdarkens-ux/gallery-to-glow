import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

type LoginRole = "staff" | "student" | "parent";

export default function Login() {
  const { user, loading } = useAuth();
  const { studentSession } = useStudentAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<LoginRole>("staff");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [pin, setPin] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  if (studentSession) return <Navigate to="/student-portal" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error("Please select your role");
      return;
    }

    if (role === "parent") {
      navigate(`/parent-portal?phone=${encodeURIComponent(phone)}`);
      return;
    }

    if (role === "student") {
      if (!studentId.trim() || !pin.trim()) {
        toast.error("Please enter both Student ID and PIN");
        return;
      }
      setSubmitting(true);
      try {
        const { data, error } = await supabase.rpc("verify_student_pin" as any, {
          _student_id: studentId.trim(),
          _pin: pin.trim(),
        });
        if (error) throw error;
        const result = data as any;
        if (!result.success) {
          toast.error(result.error || "Invalid credentials");
          return;
        }
        // Store student session and redirect
        const session = {
          studentId: studentId.trim(),
          studentUuid: result.student_id,
          studentName: result.student_name,
          mustChangePin: result.must_change,
        };
        sessionStorage.setItem("student_session", JSON.stringify(session));
        // Force page reload to pick up session
        window.location.href = "/student-portal";
      } catch (err: any) {
        toast.error(err.message || "Login failed");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Staff login via Supabase Auth
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            SchoolConnect ERP
          </h1>
          <p className="text-muted-foreground mt-1">
            Sign in to your school portal
          </p>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleLogin}
          className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-5"
        >
          {/* Role dropdown */}
          <div className="space-y-2">
            <Label>Login as</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as LoginRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="parent">Parent / Guardian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Staff fields */}
          {role === "staff" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@school.edu.gh"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {/* Student fields - ID + PIN */}
          {role === "student" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2025-001"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="pin"
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter your PIN"
                    className="pl-9"
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Parent fields */}
          {role === "parent" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Registered Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0241234567"
                required
              />
            </div>
          )}

          {role && (
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {role === "staff"
                ? "Sign In"
                : role === "student"
                ? "Login"
                : "Look Up"}
            </Button>
          )}
        </form>

        {role === "staff" && (
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
