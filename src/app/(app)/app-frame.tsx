"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/page/AppShell";

/** Product shell. Identity stays empty until GET /users/me fills it. The JWT is never read. */
export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AppShell identity={null} pathname={pathname}>
      {children}
    </AppShell>
  );
}
