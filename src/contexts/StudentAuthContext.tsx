import { createContext, useContext, useState, ReactNode } from "react";

interface StudentSession {
  studentId: string;
  studentUuid: string;
  studentName: string;
  mustChangePin: boolean;
}

interface StudentAuthContextType {
  studentSession: StudentSession | null;
  setStudentSession: (s: StudentSession | null) => void;
  studentSignOut: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType>({
  studentSession: null,
  setStudentSession: () => {},
  studentSignOut: () => {},
});

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [studentSession, setStudentSession] = useState<StudentSession | null>(() => {
    const stored = sessionStorage.getItem("student_session");
    return stored ? JSON.parse(stored) : null;
  });

  const handleSet = (s: StudentSession | null) => {
    setStudentSession(s);
    if (s) {
      sessionStorage.setItem("student_session", JSON.stringify(s));
    } else {
      sessionStorage.removeItem("student_session");
    }
  };

  const studentSignOut = () => handleSet(null);

  return (
    <StudentAuthContext.Provider value={{ studentSession, setStudentSession: handleSet, studentSignOut }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export const useStudentAuth = () => useContext(StudentAuthContext);
