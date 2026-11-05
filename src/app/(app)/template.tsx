import type { ReactNode } from "react";

import { PageTransition } from "@/components/system";

/** Remounts per top-level section → brief opacity/translate entrance (DESIGN.md §12). */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
