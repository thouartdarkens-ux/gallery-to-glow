import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { InstitutionProfileInput } from "@/lib/portal-shared";
import {
  clearCycleData,
  getDashboardSummary,
  setAdmissionCycle,
  updateInstitutionProfile,
} from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

const emptyProfile: InstitutionProfileInput = {
  motto: "",
  principal_name: "",
  contact_phone: "",
  contact_email: "",
  postal_address: "",
  website: "",
  established_year: "",
  reopening_date: "",
};

export function InstitutionPage() {
  const session = useSession();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<InstitutionProfileInput>(emptyProfile);
  const [cycle, setCycle] = useState("");
  const [confirm, setConfirm] = useState("");

  const summary = useQuery({
    queryKey: ["summary", session?.school.id],
    enabled: !!session,
    queryFn: () => getDashboardSummary(session!.auth),
  });

  const settings = summary.data?.settings as Record<string, string | null> | null | undefined;

  useEffect(() => {
    if (!settings) return;
    setProfile({
      motto: settings["motto"] ?? "",
      principal_name: settings["principal_name"] ?? "",
      contact_phone: settings["contact_phone"] ?? "",
      contact_email: settings["contact_email"] ?? "",
      postal_address: settings["postal_address"] ?? "",
      website: settings["website"] ?? "",
      established_year: settings["established_year"] ?? "",
      reopening_date: settings["reopening_date"] ?? "",
    });
    setCycle(settings["current_cycle"] ?? "");
  }, [settings]);

  const saveProfile = useMutation({
    mutationFn: () => updateInstitutionProfile(session!.auth, profile),
    onSuccess: () => {
      toast.success("Institution profile saved");
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save profile"),
  });

  const saveCycle = useMutation({
    mutationFn: (status: "open" | "closed") =>
      setAdmissionCycle(session!.auth, cycle, status),
    onSuccess: (result) => {
      toast.success(`Admission cycle ${result.cycle} is now ${result.status}`);
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not save cycle"),
  });

  const clearData = useMutation({
    mutationFn: () => clearCycleData(session!.auth, confirm),
    onSuccess: (result) => {
      const c = result.cleared as Record<string, number>;
      toast.success(
        `Cleared ${c["placements"] ?? 0} placements, ${c["students"] ?? 0} students, ${c["records"] ?? 0} records and ${c["tokens"] ?? 0} tokens`,
      );
      setConfirm("");
      queryClient.invalidateQueries();
    },
    onError: (error: Error) => toast.error(error.message || "Could not clear cycle data"),
  });

  const status = settings?.["cycle_status"] ?? "open";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Institution &amp; admission cycle</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These details appear on admission letters and on the candidate portal.
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="cycle">Admission cycle</TabsTrigger>
          <TabsTrigger value="data">Data reset</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Institution profile</CardTitle>
          <CardDescription>Motto, leadership and contact details for your school.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="motto">School motto</Label>
            <Input
              id="motto"
              value={profile.motto ?? ""}
              maxLength={200}
              placeholder="e.g. Knowledge, Service, Integrity"
              onChange={(event) => setProfile({ ...profile, motto: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="principal">Headmaster / Headmistress</Label>
            <Input
              id="principal"
              value={profile.principal_name ?? ""}
              onChange={(event) => setProfile({ ...profile, principal_name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="established">Year established</Label>
            <Input
              id="established"
              value={profile.established_year ?? ""}
              maxLength={4}
              onChange={(event) =>
                setProfile({ ...profile, established_year: event.target.value.replace(/\D/g, "") })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reopening">Reopening date</Label>
            <Input
              id="reopening"
              type="date"
              value={profile.reopening_date ?? ""}
              onChange={(event) => setProfile({ ...profile, reopening_date: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Contact phone</Label>
            <Input
              id="phone"
              value={profile.contact_phone ?? ""}
              placeholder="0244000111"
              onChange={(event) => setProfile({ ...profile, contact_phone: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact email</Label>
            <Input
              id="email"
              type="email"
              value={profile.contact_email ?? ""}
              onChange={(event) => setProfile({ ...profile, contact_email: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website ?? ""}
              placeholder="https://"
              onChange={(event) => setProfile({ ...profile, website: event.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Postal address</Label>
            <Textarea
              id="address"
              rows={3}
              value={profile.postal_address ?? ""}
              onChange={(event) => setProfile({ ...profile, postal_address: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              {saveProfile.isPending ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="cycle" className="mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admission cycle</CardTitle>
          <CardDescription>
            Current cycle:{" "}
            <span className="font-medium text-foreground">
              {settings?.["current_cycle"] ?? "Not set"}
            </span>{" "}
            · status <span className="font-medium text-foreground">{status}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="cycle">Cycle</Label>
            <Input
              id="cycle"
              value={cycle}
              placeholder="2026/2027"
              onChange={(event) => setCycle(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => saveCycle.mutate("open")} disabled={saveCycle.isPending}>
              Save &amp; open cycle
            </Button>
            <Button
              variant="outline"
              onClick={() => saveCycle.mutate("closed")}
              disabled={saveCycle.isPending}
            >
              Mark cycle as over
            </Button>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base text-destructive">
            Clear placement &amp; student data
          </CardTitle>
          <CardDescription>
            Permanently deletes placements, students, guardians, submitted records and admission
            tokens for {session?.school.name}. Export anything you need first. Only do this once the
            cycle is confirmed over.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 sm:max-w-xs">
            <Label htmlFor="confirm">
              Type your school code ({session?.school.code}) to confirm
            </Label>
            <Input
              id="confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
          <Button
            variant="destructive"
            disabled={clearData.isPending || !confirm.trim()}
            onClick={() => {
              if (window.confirm("This permanently deletes all cycle data. Continue?")) {
                clearData.mutate();
              }
            }}
          >
            {clearData.isPending ? "Clearing…" : "Clear cycle data"}
          </Button>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
