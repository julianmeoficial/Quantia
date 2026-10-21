"use client";

import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";

import { Avatar, Badge, IconButton, Link, STATUS_BADGE } from "@/components/base";
import type { DomainBadgeStatus } from "@/components/base";
import { ChevronIcon } from "@/components/base/icons";
import { Skeleton } from "@/components/system";
import { formatDate } from "@/lib/format";
import { ProgressBar } from "@/components/composite/ProgressBar";

import * as S from "./ProjectCard.styles";

export interface ProjectCardPerson {
  name: string;
}

export interface ProjectCardAction {
  id: string;
  label: string;
  onSelect: () => void;
}

export interface ProjectCardProps {
  title: string;
  href: string;
  status: DomainBadgeStatus;
  people?: ProjectCardPerson[];
  progress?: number;
  indeterminate?: boolean;
  nextDate?: string | null;
  isLoading?: boolean;
  actions?: ProjectCardAction[];
}

export function ProjectCard({
  title,
  href,
  status,
  people = [],
  progress,
  indeterminate = false,
  nextDate,
  isLoading = false,
  actions = [],
}: ProjectCardProps) {
  if (isLoading) {
    return (
      <S.Card aria-busy="true">
        <Skeleton variant="card" />
      </S.Card>
    );
  }

  const presentation = STATUS_BADGE[status];
  const StatusIcon = presentation.icon;

  return (
    <S.Card>
      <S.Header>
        <S.Title>
          <Link href={href}>{title}</Link>
        </S.Title>
        <S.Tools>
          <Badge label={presentation.label} tone={presentation.tone} icon={<StatusIcon />} />
          {actions.length > 0 ? (
            <DropdownMenuPrimitive.Root>
              <DropdownMenuPrimitive.Trigger asChild>
                <IconButton accessibleLabel={`Acciones de ${title}`} icon={<ChevronIcon />} />
              </DropdownMenuPrimitive.Trigger>
              <DropdownMenuPrimitive.Portal>
                <S.Menu>
                  {actions.map((action) => (
                    <S.MenuItem key={action.id} onSelect={action.onSelect}>
                      {action.label}
                    </S.MenuItem>
                  ))}
                </S.Menu>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>
          ) : null}
        </S.Tools>
      </S.Header>
      {people.length > 0 ? (
        <S.People>
          {people.map((person) => (
            <li key={person.name}>
              <Avatar name={person.name} />
            </li>
          ))}
        </S.People>
      ) : null}
      <ProgressBar label="Avance" value={progress} indeterminate={indeterminate} />
      <S.Meta>Próxima fecha: {formatDate(nextDate)}</S.Meta>
    </S.Card>
  );
}
