"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import styled from "styled-components";

import { Button } from "@/components/base";
import { formatPercent } from "@/lib/format";
import { DataTable } from "@/components/page/DataTable";

import type { ProgressPoint, ProgressSeries } from "./types";

export type { ProgressPoint, ProgressSeries } from "./types";

const ProgressChartPlot = dynamic(
  () => import("./ProgressChartPlot").then((mod) => mod.ProgressChartPlot),
  {
    ssr: false,
    loading: () => <PlotPlaceholder aria-busy="true" aria-label="Cargando gráfica" />,
  },
);

const Figure = styled.figure`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  margin: 0;
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

const Caption = styled.figcaption`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyStrong.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
`;

const LegendList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;
  padding: 0;
  list-style: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const PlotPlaceholder = styled.div`
  width: 100%;
  height: calc(${({ theme }) => theme.space[64]} * 4);
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.subtle};
`;

export interface ProgressChartProps {
  title: string;
  period: string;
  series: ProgressSeries[];
  points: ProgressPoint[];
}

export function ProgressChart({ title, period, series, points }: ProgressChartProps) {
  const [asTable, setAsTable] = useState(false);

  return (
    <Figure>
      <Caption>
        {title}. {period}
      </Caption>
      <LegendList>
        {series.map((item, index) => (
          <li key={item.id}>
            {item.name} · trazo{" "}
            {index === 0 ? "continuo" : index === 1 ? "discontinuo" : "punteado"}
          </li>
        ))}
      </LegendList>
      <Button type="button" intent="secondary" onClick={() => setAsTable((current) => !current)}>
        {asTable ? "Ver como gráfica" : "Ver como tabla"}
      </Button>
      {asTable ? (
        <DataTable
          caption={title}
          rows={points}
          getRowId={(row) => row.label}
          columns={[
            { id: "label", header: "Periodo", cell: (row) => row.label },
            ...series.map((item) => ({
              id: item.id,
              header: item.name,
              align: "end" as const,
              cell: (row: ProgressPoint) => formatPercent(row.values[item.id]),
            })),
          ]}
        />
      ) : (
        <ProgressChartPlot series={series} points={points} />
      )}
    </Figure>
  );
}
