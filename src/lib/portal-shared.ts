export type PortalAuthInput = {
  schoolId: number;
  code: string;
  credentials: string;
};

export type PlacementRowInput = {
  index_no: string;
  candidate_name: string;
  gender?: string;
  date_of_birth?: string;
  jhs_attended?: string;
  programme_code?: string;
  programme: string;
  residency?: string;
  enrolment_code?: string;
  aggregate?: number | null;
  completion_year: string;
  phone?: string;
};

export type AssignmentRowInput = {
  index_no: string;
  house?: string;
  class?: string;
};

export const DOCUMENT_KINDS = [
  "prospectus",
  "undertaking_form",
  "programme_subjects",
  "admission_letter",
] as const;

export type DocumentKindName = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_LABELS: Record<DocumentKindName, string> = {
  prospectus: "Prospectus",
  undertaking_form: "Undertaking / Medical Form",
  programme_subjects: "Programme & Subjects Form",
  admission_letter: "Admission Letter (sample)",
};

export const PLACEMENT_CSV_HEADERS = [
  "Index Number",
  "Candidate Name",
  "Gender",
  "Date of Birth",
  "JHS Attended",
  "Programme Code",
  "Programme Name",
  "Residency",
  "Enrolment Code",
];

export const PLACEMENT_CSV_SAMPLE: Record<string, string>[] = [
  {
    "Index Number": "0100123456789",
    "Candidate Name": "Ama Serwaa Boateng",
    Gender: "Female",
    "Date of Birth": "2010-04-18",
    "JHS Attended": "Adabraka Official Town JHS",
    "Programme Code": "SCI",
    "Programme Name": "General Science",
    Residency: "Boarding",
    "Enrolment Code": "ENR-2026-0001",
  },
  {
    "Index Number": "0100123456790",
    "Candidate Name": "Kwabena Owusu Ansah",
    Gender: "Male",
    "Date of Birth": "2009-11-02",
    "JHS Attended": "Asokore Presby JHS",
    "Programme Code": "BUS",
    "Programme Name": "Business",
    Residency: "Day",
    "Enrolment Code": "ENR-2026-0002",
  },
];

export const ASSIGNMENT_CSV_HEADERS = ["index_no", "house", "class"];

export const ASSIGNMENT_CSV_SAMPLE: Record<string, string>[] = [
  { index_no: "0100123456789", house: "Aggrey House", class: "1 Science A" },
  { index_no: "0100123456790", house: "Nkrumah House", class: "1 Business B" },
];

export type InstitutionProfileInput = {
  motto?: string;
  reopening_date?: string;
  principal_name?: string;
  contact_phone?: string;
  contact_email?: string;
  postal_address?: string;
  website?: string;
  established_year?: string;
};

export type HouseInput = {
  id?: number;
  name: string;
  gender?: string;
  housemaster_name?: string;
  capacity?: number | null;
};

export type ClassInput = {
  id?: number;
  name: string;
  form_level?: number;
  programme?: string;
  form_master_name?: string;
};

