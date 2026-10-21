"use client";

import type { ReactNode } from "react";

import type { BadgeTone } from "@/components/base/shared/types";

import * as S from "./Badge.styles";
import { STATUS_BADGE, TONE_ICON, type DomainBadgeStatus } from "./statusPresentation";

export interface BadgeProps {
  label?: string;
  tone?: BadgeTone;
  icon?: ReactNode;
  /** Convenience for DS-94 domain status labels. */
  status?: DomainBadgeStatus;
}

export function Badge({ label, tone = "neutral", icon, status }: BadgeProps) {
  const presentation = status ? STATUS_BADGE[status] : null;
  const resolvedTone = presentation?.tone ?? tone;
  const resolvedLabel = presentation?.label ?? label;
  const Icon = presentation?.icon ?? TONE_ICON[resolvedTone];

  if (!resolvedLabel) {
    throw new Error("Badge requires label or status");
  }

  return (
    <S.Root $tone={resolvedTone}>
      <S.IconSlot aria-hidden>{icon ?? <Icon />}</S.IconSlot>
      {resolvedLabel}
    </S.Root>
  );
}
