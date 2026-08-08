export type PortalRow = Record<string, any>;

import type {
  AssignmentRowInput,
  ClassInput,
  DocumentKindName,
  HouseInput,
  InstitutionProfileInput,
  PlacementRowInput,
  PortalAuthInput,
} from "@/lib/portal-shared";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portal-api`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callApi<T>(action: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ANON_KEY}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify({ action, ...body }),
  });

  const data = (await response.json().catch(() => ({ error: "Invalid response from server" }))) as Record<
    string,
    unknown
  >;

  if (!response.ok) {
    throw new Error(String(data.error ?? `Request failed (${response.status})`));
  }

  return data as T;
}

type SchoolSession = {
  id: number;
  code: string;
  name: string;
  town: string;
  category: string;
  school_type: string;
  motto: string | null;
};

export function schoolLogin(auth: PortalAuthInput) {
  return callApi<{ school: SchoolSession }>("schoolLogin", { auth: auth as unknown as Record<string, unknown> });
}

export function getDashboardSummary(auth: PortalAuthInput) {
  return callApi<{
    school: SchoolSession;
    counts: {
      placements: number;
      students: number;
      records: number;
      houses: number;
      classes: number;
      unassigned: number;
    };
    settings: PortalRow | null;
  }>("getDashboardSummary", { auth: auth as unknown as Record<string, unknown> });
}

export function listPlacements(auth: PortalAuthInput) {
  return callApi<{ rows: PortalRow[] }>("listPlacements", {
    auth: auth as unknown as Record<string, unknown>,
  });
}

export function uploadPlacements(auth: PortalAuthInput, rows: PlacementRowInput[]) {
  return callApi<{ saved: number; failed: number; errors: { index_no: string; reason: string }[] }>(
    "uploadPlacements",
    {
      auth: auth as unknown as Record<string, unknown>,
      rows: rows as unknown[],
    },
  );
}

export function syncPlacementsToStudents(auth: PortalAuthInput) {
  return callApi<{ synced: number; failed: number }>("syncPlacementsToStudents", {
    auth: auth as unknown as Record<string, unknown>,
  });
}

export function listStudentRecords(auth: PortalAuthInput) {
  return callApi<{ rows: PortalRow[] }>("listStudentRecords", {
    auth: auth as unknown as Record<string, unknown>,
  });
}

export function getAssignmentData(auth: PortalAuthInput) {
  return callApi<{
    houses: PortalRow[];
    classes: PortalRow[];
    students: PortalRow[];
  }>("getAssignmentData", { auth: auth as unknown as Record<string, unknown> });
}

export function assignHousesAndClasses(auth: PortalAuthInput, assignments: AssignmentRowInput[]) {
  return callApi<{ updated: number; failed: number; errors: { index_no: string; reason: string }[] }>(
    "assignHousesAndClasses",
    {
      auth: auth as unknown as Record<string, unknown>,
      assignments: assignments as unknown[],
    },
  );
}

export function updateSchoolSettings(
  auth: PortalAuthInput,
  data: { admission_letter_template?: string; motto?: string },
) {
  return callApi<{ updated: boolean }>("updateSchoolSettings", {
    auth: auth as unknown as Record<string, unknown>,
    ...data,
  });
}

export function createDocumentUploadUrl(auth: PortalAuthInput, kind: DocumentKindName, fileName: string) {
  return callApi<{ path: string; token: string }>("createDocumentUploadUrl", {
    auth: auth as unknown as Record<string, unknown>,
    kind,
    fileName,
  });
}

export function finalizeDocumentUpload(auth: PortalAuthInput, kind: DocumentKindName, path: string) {
  return callApi<{ path: string; url: string }>("finalizeDocumentUpload", {
    auth: auth as unknown as Record<string, unknown>,
    kind,
    path,
  });
}

export function updateInstitutionProfile(auth: PortalAuthInput, profile: InstitutionProfileInput) {
  return callApi<{ updated: boolean }>("updateInstitutionProfile", {
    auth: auth as unknown as Record<string, unknown>,
    profile: profile as unknown as Record<string, unknown>,
  });
}

export function listHousesAndClasses(auth: PortalAuthInput) {
  return callApi<{ houses: PortalRow[]; classes: PortalRow[] }>(
    "listHousesAndClasses",
    { auth: auth as unknown as Record<string, unknown> },
  );
}

export function saveHouse(auth: PortalAuthInput, house: HouseInput) {
  return callApi<{ saved: boolean }>("saveHouse", {
    auth: auth as unknown as Record<string, unknown>,
    house: house as unknown as Record<string, unknown>,
  });
}

export function deleteHouse(auth: PortalAuthInput, id: number) {
  return callApi<{ deleted: boolean }>("deleteHouse", {
    auth: auth as unknown as Record<string, unknown>,
    id,
  });
}

export function saveClass(auth: PortalAuthInput, klass: ClassInput) {
  return callApi<{ saved: boolean }>("saveClass", {
    auth: auth as unknown as Record<string, unknown>,
    klass: klass as unknown as Record<string, unknown>,
  });
}

export function deleteClass(auth: PortalAuthInput, id: number) {
  return callApi<{ deleted: boolean }>("deleteClass", {
    auth: auth as unknown as Record<string, unknown>,
    id,
  });
}

export function setAdmissionCycle(auth: PortalAuthInput, cycle: string, status?: string) {
  return callApi<{ cycle: string; status: string }>("setAdmissionCycle", {
    auth: auth as unknown as Record<string, unknown>,
    cycle,
    status,
  });
}

export function clearCycleData(auth: PortalAuthInput, confirm: string) {
  return callApi<{ cleared: Record<string, number> }>("clearCycleData", {
    auth: auth as unknown as Record<string, unknown>,
    confirm,
  });
}
