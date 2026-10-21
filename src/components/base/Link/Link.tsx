"use client";

import type { ReactNode } from "react";

import { ExternalIcon } from "@/components/base/icons";

import * as S from "./Link.styles";

export interface LinkProps {
  href: string;
  children: ReactNode;
  external?: boolean;
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | true | false;
}

function isExternalHref(href: string, external?: boolean): boolean {
  if (external !== undefined) return external;
  return /^https?:\/\//i.test(href);
}

export function Link({ href, children, external, ariaCurrent }: LinkProps) {
  const isExternal = isExternalHref(href, external);

  if (isExternal) {
    return (
      <S.External href={href} target="_blank" rel="noopener noreferrer" aria-current={ariaCurrent}>
        {children}
        <S.IconSlot aria-hidden>
          <ExternalIcon />
        </S.IconSlot>
        <S.ExternalHint>(se abre en una pestaña nueva)</S.ExternalHint>
      </S.External>
    );
  }

  return (
    <S.Internal href={href} aria-current={ariaCurrent}>
      {children}
    </S.Internal>
  );
}
