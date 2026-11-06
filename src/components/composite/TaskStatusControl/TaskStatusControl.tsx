"use client";

import { TaskStatus } from "@quantia/contracts";
import { DropdownMenu } from "radix-ui";
import { useRef } from "react";

import { Badge, TASK_STATUS_PRESENTATION } from "@/components/base";
import { CheckIcon, ChevronIcon } from "@/components/base/icons";

import { haptic } from "@/lib/device";
import { gsap, MOTION_QUERIES, useGSAP } from "@/lib/gsap";
import { gsapDurations } from "@/lib/motion";

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

  // Settle the badge when the status changes (no overshoot; static under reduced motion).
  const scope = useRef<HTMLSpanElement>(null);
  const firstStatus = useRef(status);
  useGSAP(
    () => {
      if (!scope.current || firstStatus.current === status) return;
      firstStatus.current = status;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.allowMotion, () => {
        gsap.fromTo(
          scope.current,
          { scale: 0.88, autoAlpha: 0.4 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: gsapDurations.slow,
            ease: "power3.out",
            clearProps: "transform,opacity,visibility",
          },
        );
      });
      return () => mm.revert();
    },
    { dependencies: [status], scope },
  );
  const settled = <S.Settle ref={scope}>{badge}</S.Settle>;

  if (!onChange) return settled;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <S.Trigger
          type="button"
          disabled={disabled}
          aria-label={`Estado de ${title}: ${presentation.label}. Cambiar`}
        >
          {settled}
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
                  if (value === status) return;
                  haptic("selection");
                  onChange(value);
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
