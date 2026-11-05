"use client";

import { useGsapReveal } from "@/lib/motion";

import * as S from "./KpiPanel.styles";

export type KpiDeltaDirection = "up" | "down" | "flat";

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  context?: string;
  delta?: {
    direction: KpiDeltaDirection;
    label: string;
  };
}

export interface KpiPanelProps {
  title?: string;
  period: string;
  metrics: KpiMetric[];
}

const DIRECTION_WORD: Record<KpiDeltaDirection, string> = {
  up: "Subió",
  down: "Bajó",
  flat: "Sin cambio",
};

const MAX_METRICS = 4;

function MetricItem({ metric }: { metric: KpiMetric }) {
  return (
    <S.Item data-reveal>
      <S.Label>{metric.label}</S.Label>
      <S.Value>{metric.value}</S.Value>
      {metric.context ? <S.Context>{metric.context}</S.Context> : null}
      {metric.delta ? (
        <S.Delta>
          <span aria-hidden>
            {metric.delta.direction === "down" ? "▼" : metric.delta.direction === "up" ? "▲" : "●"}
          </span>
          <span>
            {DIRECTION_WORD[metric.delta.direction]}
            {metric.delta.label ? ` · ${metric.delta.label}` : ""}
          </span>
        </S.Delta>
      ) : null}
    </S.Item>
  );
}

export function KpiPanel({ title = "Indicadores", period, metrics }: KpiPanelProps) {
  const visible = metrics.slice(0, MAX_METRICS);
  const scope = useGsapReveal<HTMLElement>({
    y: 10,
    stagger: 0.06,
    dependencies: [visible.length],
  });

  return (
    <S.Panel ref={scope} aria-label={title}>
      <S.Period>{period}</S.Period>
      <S.Grid>
        {visible.map((metric) => (
          <MetricItem key={metric.id} metric={metric} />
        ))}
      </S.Grid>
    </S.Panel>
  );
}
