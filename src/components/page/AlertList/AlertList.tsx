"use client";

import type { ReactNode } from "react";

import { Badge, Link } from "@/components/base";
import type { BadgeTone } from "@/components/base/shared/types";
import { AlertIcon, CheckCircleIcon, ClockIcon } from "@/components/base/icons";
import { EmptyState } from "@/components/system";

import * as S from "./AlertList.styles";

export type AlertSeverity = "critical" | "attention" | "on-track";

export interface AlertListItem {
  id: string;
  severity: AlertSeverity;
  title: string;
  interpretation: string;
  href: string;
  hrefLabel: string;
  action?: ReactNode;
}

const ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  attention: 1,
  "on-track": 2,
};

const PRESENTATION: Record<
  AlertSeverity,
  { label: string; tone: BadgeTone; icon: typeof AlertIcon }
> = {
  critical: { label: "Crítico", tone: "danger", icon: AlertIcon },
  attention: { label: "Atención", tone: "warning", icon: ClockIcon },
  "on-track": { label: "Al día", tone: "success", icon: CheckCircleIcon },
};

export interface AlertListProps {
  items: AlertListItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** Transient highlight (e.g. realtime) — does not reorder the list. */
  highlightedIds?: readonly string[];
}

export function AlertList({
  items,
  emptyTitle = "Sin alertas",
  emptyDescription = "No hay avisos en este momento.",
  highlightedIds = [],
}: AlertListProps) {
  if (items.length === 0) {
    return <EmptyState kind="no-records" title={emptyTitle} description={emptyDescription} />;
  }

  const ordered = [...items].sort((a, b) => ORDER[a.severity] - ORDER[b.severity]);
  const highlighted = new Set(highlightedIds);

  return (
    <S.List aria-label="Alertas">
      {ordered.map((item) => {
        const presentation = PRESENTATION[item.severity];
        const Icon = presentation.icon;
        return (
          <S.Item key={item.id} data-highlighted={highlighted.has(item.id) ? "true" : undefined}>
            <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />
            <S.Title>{item.title}</S.Title>
            <S.Text>{item.interpretation}</S.Text>
            <Link href={item.href}>{item.hrefLabel}</Link>
            {item.action}
          </S.Item>
        );
      })}
    </S.List>
  );
}
