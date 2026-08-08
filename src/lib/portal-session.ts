import { useEffect, useState } from "react";

import type { PortalAuthInput } from "@/lib/portal-shared";

export type PortalSession = {
  auth: PortalAuthInput;
  school: {
    id: number;
    code: string;
    name: string;
    town: string;
    category: string;
    school_type: string;
    motto: string | null;
  };
};

const KEY = "movasoft.portal.session";

export function saveSession(session: PortalSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("movasoft-session"));
}

export function readSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PortalSession) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("movasoft-session"));
}

/** Returns undefined while hydrating, null when signed out. */
export function useSession(): PortalSession | null | undefined {
  const [session, setSession] = useState<PortalSession | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setSession(readSession());
    sync();
    window.addEventListener("movasoft-session", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("movasoft-session", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return session;
}
