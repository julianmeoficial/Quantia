"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";

/** Recolecta los estilos generados en el render del servidor y los inyecta en el HTML (sin FOUC). */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  const [sheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    sheet.instance.clearTag();
    return <>{styles}</>;
  });

  if (typeof window !== "undefined") return <>{children}</>;

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>;
}
