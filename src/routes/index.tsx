import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { schoolLogin } from "@/lib/portal.functions";
import { readSession, saveSession } from "@/lib/portal-session";

export function LoginPage() {
  const navigate = useNavigate();
  const [schoolId, setSchoolId] = useState("");
  const [code, setCode] = useState("");
  const [credentials, setCredentials] = useState("");

  useEffect(() => {
    if (readSession()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const login = useMutation({
    mutationFn: async () => {
      const auth = {
        schoolId: Number(schoolId),
        code: code.trim(),
        credentials: credentials.trim(),
      };
      const result = await schoolLogin(auth);
      return { auth, school: result.school };
    },
    onSuccess: (result) => {
      saveSession(result);
      toast.success(`Welcome, ${result.school.name}`);
      navigate("/dashboard");
    },
    onError: (error: Error) => toast.error(error.message || "Sign in failed"),
  });

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <section className="adinkra-surface relative hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">MOVASOFT</p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">
            Institutional Portal for Ghana&apos;s senior high schools
          </h1>
          <p className="mt-4 max-w-md text-sm text-sidebar-foreground/80">
            Upload CSSPS placement lists, sync student registers, assign houses and classes, publish
            your prospectus and admission letter template — all scoped to your own institution.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-sidebar-foreground/85">
          <li>• Placement uploads locked to your school ID</li>
          <li>• Student records export for your candidates only</li>
          <li>• House &amp; class assignment by index number</li>
          <li>• Prospectus, undertaking and subject forms storage</li>
        </ul>
        <div className="kente-band h-3 w-full rounded-full" />
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="kente-band mb-8 h-2 w-24 rounded-full" />
          <h2 className="text-2xl font-bold text-foreground">Institution sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the school ID, school code and credentials issued to your institution.
          </p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!schoolId || !code.trim() || !credentials.trim()) {
                toast.error("All three fields are required");
                return;
              }
              login.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                inputMode="numeric"
                placeholder="e.g. 1"
                value={schoolId}
                onChange={(event) => setSchoolId(event.target.value.replace(/\D/g, ""))}
                maxLength={9}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">School code</Label>
              <Input
                id="code"
                placeholder="e.g. BEPRESEC"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                maxLength={40}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credentials">Credentials</Label>
              <Input
                id="credentials"
                type="password"
                placeholder="Institution credentials code"
                value={credentials}
                onChange={(event) => setCredentials(event.target.value)}
                maxLength={120}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Verifying…" : "Enter portal"}
            </Button>
          </form>

          <p className="mt-6 text-xs text-muted-foreground">
            Credentials are verified on the server and are never exposed to browsers. Contact the
            MOVASOFT desk if your institution code has been misplaced.
          </p>
        </div>
      </section>
    </main>
  );
}
