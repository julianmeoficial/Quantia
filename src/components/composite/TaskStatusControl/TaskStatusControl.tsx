"use client";

import { TaskStatus } from "@quantia/contracts";
import { DropdownMenu } from "radix-ui";

import { Badge, TASK_STATUS_PRESENTATION } from "@/components/base";
import { CheckIcon, ChevronIcon } from "@/components/base/icons";

import * as S from "./TaskStatusControl.styles";

const ORDER = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.BLOCKED,
  TaskStatus.DONE,
] as const satisfies readonly TaskStatus[];

export interface TaskStatusControlProps {
  status: TaskStatus;
  /** Task title, used to name the control for assistive tech. */
  title: string;
  /** When omitted the status is shown read-only as a badge. */
  onChange?: (next: TaskStatus) => void;
  disabled?: boolean;
}

/**
 * The task status badge, turned into a button that opens the four statuses.
 * One tap/click to change the state from any list, row or table.
 */
export function TaskStatusControl({ status, title, onChange, disabled }: TaskStatusControlProps) {
  const presentation = TASK_STATUS_PRESENTATION[status];
  const Icon = presentation.icon;
  const badge = <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;

  if (!onChange) return badge;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <S.Trigger
          type="button"
          disabled={disabled}
          aria-label={`Estado de ${title}: ${presentation.label}. Cambiar`}
        >
          {badge}
          <S.Chevron aria-hidden>
            <ChevronIcon />
          </S.Chevron>
        </S.Trigger>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <S.Content align="start" sideOffset={4}>
          {ORDER.map((value) => {
            const option = TASK_STATUS_PRESENTATION[value];
            const OptionIcon = option.icon;
            return (
              <S.Item
                key={value}
                disabled={value === status}
                onSelect={() => {
                  if (value !== status) onChange(value);
                }}
              >
                <S.ItemIcon aria-hidden>
                  <OptionIcon />
                </S.ItemIcon>
                {option.label}
                {value === status ? (
                  <S.Check aria-hidden>
                    <CheckIcon />
                  </S.Check>
                ) : null}
              </S.Item>
            );
          })}
        </S.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
