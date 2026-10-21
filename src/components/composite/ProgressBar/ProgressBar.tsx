"use client";

import { formatPercent } from "@/lib/format";
import type { BadgeTone } from "@/components/base/shared/types";

import * as S from "./ProgressBar.styles";

export interface ProgressBarProps {
  value?: number;
  max?: number;
  label: string;
  indeterminate?: boolean;
  tone?: BadgeTone | "brand";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  indeterminate = false,
  tone = "brand",
}: ProgressBarProps) {
  const bounded =
    indeterminate || value === undefined ? undefined : Math.min(Math.max(value, 0), max);
  const ratio = bounded === undefined || max === 0 ? 0 : bounded / max;
  const valueText = indeterminate ? "En progreso" : formatPercent(bounded ?? 0);

  return (
    <S.Root>
      <S.Label>
        {label}: {indeterminate ? "En progreso" : valueText}
      </S.Label>
      <S.Track
        value={indeterminate ? undefined : bounded}
        max={max}
        aria-label={label}
        aria-valuetext={valueText}
        data-state={indeterminate ? "indeterminate" : undefined}
      >
        <S.Indicator
          $tone={tone}
          $indeterminate={indeterminate}
          style={indeterminate ? undefined : { transform: `scaleX(${ratio})` }}
        />
      </S.Track>
    </S.Root>
  );
}
