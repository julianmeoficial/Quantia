import type { TaskStatus } from "@quantia/contracts";
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

export const TONE_ICON: Record<BadgeTone, ComponentType<IconProps>> = {
  neutral: CircleIcon,
  info: ClockIcon,
  success: CheckCircleIcon,
  warning: AlertIcon,
  danger: XIcon,
};
