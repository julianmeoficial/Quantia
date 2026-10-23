"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AppShell } from "@/components/page/AppShell";
import { useAuth } from "@/features/auth/AuthProvider";
import { NavBoot } from "@/features/auth/NavBoot";

/** Product shell. Identity comes from GET /users/me. The JWT is never read. */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status, identity, logout, endExpiredSession } = useAuth();

  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);

  if (status === "booting" || status === "anonymous" || !identity) {
    return <NavBoot />;
  }

  return (
    <AppShell
      identity={identity}
      pathname={pathname}
      onLogout={() => {
        void logout();
      }}
      sessionExpired={status === "sessionExpired"}
      onSessionAction={() => {
        void endExpiredSession();
      }}
    >
      {children}
    </AppShell>
  );
}
