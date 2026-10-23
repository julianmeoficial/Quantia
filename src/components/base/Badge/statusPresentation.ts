import type { DocumentStatus, ProjectStatus, TaskStatus } from "@quantia/contracts";
import type { ComponentType } from "react";

import {
  AlertIcon,
  CheckCircleIcon,
  CircleIcon,
  ClockIcon,
  MinusIcon,
  XIcon,
} from "@/components/base/icons";
import type { IconProps } from "@/components/base/icons";
import type { BadgeTone } from "@/components/base/shared/types";

export type DomainBadgeStatus = "delayed" | "in_progress" | "on_track" | "complete" | "missing";

export type StatusBadgePresentation = {
  label: string;
  tone: BadgeTone;
  icon: ComponentType<IconProps>;
};

/** Domain labels from DS-94 checklist — tone + text + icon. */
export const STATUS_BADGE: Record<DomainBadgeStatus, StatusBadgePresentation> = {
  delayed: { label: "Retrasado", tone: "danger", icon: AlertIcon },
  in_progress: { label: "En curso", tone: "info", icon: ClockIcon },
  on_track: { label: "Al día", tone: "success", icon: CheckCircleIcon },
  complete: { label: "Completa", tone: "success", icon: CheckCircleIcon },
  missing: { label: "Faltante", tone: "neutral", icon: CircleIcon },
};

/** Contract `TaskStatus` → UI. Single source for Badge / TaskRow / tables. */
export const TASK_STATUS_PRESENTATION = {
  TODO: { label: "Por hacer", tone: "neutral", icon: CircleIcon },
  IN_PROGRESS: { label: "En curso", tone: "info", icon: ClockIcon },
  BLOCKED: { label: "Bloqueada", tone: "warning", icon: MinusIcon },
  DONE: { label: "Hecha", tone: "success", icon: CheckCircleIcon },
} as const satisfies Record<TaskStatus, StatusBadgePresentation>;

/** Contract `ProjectStatus` → UI. */
export const PROJECT_STATUS_PRESENTATION = {
  FORMULATION: { label: "En formulación", tone: "neutral", icon: CircleIcon },
  ACTIVE: { label: "En curso", tone: "info", icon: ClockIcon },
  DELAYED: { label: "Retrasado", tone: "danger", icon: AlertIcon },
  COMPLETED: { label: "Completado", tone: "success", icon: CheckCircleIcon },
  CANCELLED: { label: "Cancelado", tone: "neutral", icon: MinusIcon },
} as const satisfies Record<ProjectStatus, StatusBadgePresentation>;

/**
 * Contract `DocumentStatus` → Figma document labels
 * (Verificado / En revisión / Bloqueado).
 */
export const DOCUMENT_STATUS_PRESENTATION = {
  SCANNED: { label: "Verificado", tone: "success", icon: CheckCircleIcon },
  UPLOADED: { label: "En revisión", tone: "warning", icon: ClockIcon },
  QUARANTINED: { label: "Bloqueado", tone: "danger", icon: AlertIcon },
} as const satisfies Record<DocumentStatus, StatusBadgePresentation>;

export const TONE_ICON: Record<BadgeTone, ComponentType<IconProps>> = {
  neutral: CircleIcon,
  info: ClockIcon,
  success: CheckCircleIcon,
  warning: AlertIcon,
  danger: XIcon,
};
