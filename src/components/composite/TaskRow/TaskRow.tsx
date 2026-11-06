"use client";

import type { TaskStatus } from "@quantia/contracts";

import {
  Avatar,
  Badge,
  Checkbox,
  Link,
  STATUS_BADGE,
  TASK_STATUS_PRESENTATION,
} from "@/components/base";
import type { DomainBadgeStatus } from "@/components/base";
import { haptic } from "@/lib/device";
import { formatDate } from "@/lib/format";

import { TaskStatusControl } from "../TaskStatusControl";

import * as S from "./TaskRow.styles";

export interface TaskRowProps {
  title: string;
  href: string;
  assignee: string;
  status: DomainBadgeStatus | TaskStatus;
  due?: string | null;
  canUpdate?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Shows the status as a menu with the four states instead of a static badge. */
  onStatusChange?: (next: TaskStatus) => void;
  highlighted?: boolean;
}

function isTaskStatus(status: DomainBadgeStatus | TaskStatus): status is TaskStatus {
  return status in TASK_STATUS_PRESENTATION;
}

export function TaskRow({
  title,
  href,
  assignee,
  status,
  due,
  canUpdate = false,
  checked = false,
  onCheckedChange,
  onStatusChange,
  highlighted = false,
}: TaskRowProps) {
  const presentation = isTaskStatus(status)
    ? TASK_STATUS_PRESENTATION[status]
    : STATUS_BADGE[status];
  const StatusIcon = presentation.icon;

  return (
    <S.Row data-highlighted={highlighted ? "true" : undefined}>
      {canUpdate ? (
        <Checkbox
          label={`Marcar «${title}» como completa`}
          labelVisuallyHidden
          checked={checked}
          onCheckedChange={(next) => {
            haptic(next === true ? "success" : "selection");
            onCheckedChange?.(next === true);
          }}
        />
      ) : (
        <span />
      )}
      <S.Main>
        <Link href={href}>{title}</Link>
        <S.Meta>
          <Avatar name={assignee} announceName={false} />
          <span>{assignee}</span>
          {canUpdate && onStatusChange && isTaskStatus(status) ? (
            <TaskStatusControl status={status} title={title} onChange={onStatusChange} />
          ) : (
            <Badge label={presentation.label} tone={presentation.tone} icon={<StatusIcon />} />
          )}
          <time dateTime={due ?? undefined}>{formatDate(due)}</time>
        </S.Meta>
      </S.Main>
    </S.Row>
  );
}
