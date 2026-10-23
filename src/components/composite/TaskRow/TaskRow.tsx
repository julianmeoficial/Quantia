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
import { formatDate } from "@/lib/format";

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
          checked={checked}
          onCheckedChange={(next) => onCheckedChange?.(next === true)}
        />
      ) : (
        <span />
      )}
      <S.Main>
        <Link href={href}>{title}</Link>
        <S.Meta>
          <Avatar name={assignee} announceName={false} />
          <span>{assignee}</span>
          <Badge label={presentation.label} tone={presentation.tone} icon={<StatusIcon />} />
          <time dateTime={due ?? undefined}>{formatDate(due)}</time>
        </S.Meta>
      </S.Main>
    </S.Row>
  );
}
