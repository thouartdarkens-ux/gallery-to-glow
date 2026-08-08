import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/portal.functions";
import { useSession } from "@/lib/portal-session";

export function OverviewPage() {
  const session = useSession();

  const summary = useQuery({
    queryKey: ["summary", session?.school.id],
    enabled: !!session,
    queryFn: () => getDashboardSummary(session!.auth),
  });

  const counts = summary.data?.counts;
  const cards = [
    { label: "Placement records", value: counts?.placements, hint: "Uploaded for your school" },
    { label: "Students on register", value: counts?.students, hint: "Synced from placements" },
    { label: "Submitted enrolments", value: counts?.records, hint: "Student record forms" },
    { label: "Houses", value: counts?.houses, hint: "Configured houses" },
    { label: "Classes", value: counts?.classes, hint: "Configured classes" },
    { label: "Awaiting assignment", value: counts?.unassigned, hint: "Missing house or class" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Institution overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything below is filtered to school ID {session?.school.id} only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label} className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold text-foreground">
                {summary.isLoading ? "—" : (card.value ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Institution profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Detail label="School code" value={session?.school.code} />
          <Detail label="Town" value={session?.school.town} />
          <Detail label="Category" value={session?.school.category} />
          <Detail label="Type" value={session?.school.school_type} />
          <Detail label="Motto" value={summary.data?.settings?.motto ?? "Not set"} />
          <Detail
            label="Head of school"
            value={summary.data?.settings?.principal_name ?? "Not set"}
          />
          <Detail label="Contact phone" value={summary.data?.settings?.contact_phone ?? "Not set"} />
          <Detail label="Contact email" value={summary.data?.settings?.contact_email ?? "Not set"} />
          <Detail
            label="Admission cycle"
            value={
              summary.data?.settings?.current_cycle
                ? `${summary.data.settings.current_cycle} (${summary.data.settings.cycle_status})`
                : "Not set"
            }
          />
          <Detail
            label="Admission letter template"
            value={summary.data?.settings?.admission_letter_template ? "Configured" : "Not set"}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value ?? "—"}</p>
    </div>
  );
}
