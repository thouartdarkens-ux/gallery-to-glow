import { Badge } from "@/components/ui/badge";
import { useDepartmentSubjects } from "@/hooks/useDepartments";
import { BookOpen } from "lucide-react";

interface Props {
  departmentId?: string | null;
  programmeName?: string;
}

export default function StudentSubjectsRow({ departmentId, programmeName }: Props) {
  const { data: subjects, isLoading } = useDepartmentSubjects(departmentId);

  if (!departmentId) {
    return (
      <div className="text-xs text-muted-foreground italic">
        No programme assigned. Edit the student to assign a programme.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <BookOpen className="w-3.5 h-3.5" />
        Subjects taken {programmeName ? `(${programmeName})` : ""}
      </div>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : !subjects || subjects.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No subjects linked to this programme yet. Set them up in Academic Setup → Programme Subjects.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {subjects.map((s) => (
            <Badge key={s.id} variant="outline" className="font-normal">
              {s.name}{s.code ? ` (${s.code})` : ""}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
