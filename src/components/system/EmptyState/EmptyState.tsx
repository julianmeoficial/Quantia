"use client";

import type { ReactNode } from "react";

import * as S from "./EmptyState.styles";

export type EmptyStateKind = "no-records" | "no-results";

export interface EmptyStateProps {
  kind: EmptyStateKind;
  title: string;
  description: string;
  action?: ReactNode;
  /** Decorative only — always aria-hidden. */
  art?: ReactNode;
}

export function EmptyState({ kind, title, description, action, art }: EmptyStateProps) {
  return (
    <S.Root data-kind={kind}>
      {art ? <S.Art aria-hidden>{art}</S.Art> : null}
      <S.Title>{title}</S.Title>
      <S.Description>{description}</S.Description>
      {action ? <S.Actions>{action}</S.Actions> : null}
    </S.Root>
  );
}
