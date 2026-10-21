"use client";

import { useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "styled-components";

import { Button } from "@/components/base";
import { formatPercent } from "@/lib/format";
import { DataTable } from "@/components/page/DataTable";

import styled from "styled-components";

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

const Plot = styled.div`
  width: 100%;
  height: calc(${({ theme }) => theme.space[64]} * 4);
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

export interface ProgressSeries {
  id: string;
  name: string;
}

export interface ProgressPoint {
  label: string;
  values: Record<string, number>;
}

export interface ProgressChartProps {
  title: string;
  period: string;
  series: ProgressSeries[];
  points: ProgressPoint[];
}

const DASH = [undefined, "6 4", "2 4"] as const;

export function ProgressChart({ title, period, series, points }: ProgressChartProps) {
  const theme = useTheme();
  const [asTable, setAsTable] = useState(false);
  const strokes = [
    theme.colors.brand.primary,
    theme.colors.status.info.text,
    theme.colors.status.success.text,
  ];
  const data = points.map((point) => ({ label: point.label, ...point.values }));

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
        <Plot>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={theme.colors.border.subtle} />
              <XAxis dataKey="label" stroke={theme.colors.text.secondary} />
              <YAxis stroke={theme.colors.text.secondary} />
              <Legend />
              {series.map((item, index) => (
                <Line
                  key={item.id}
                  type="monotone"
                  dataKey={item.id}
                  name={item.name}
                  stroke={strokes[index % strokes.length]}
                  strokeDasharray={DASH[index % DASH.length]}
                  isAnimationActive={false}
                  dot
                >
                  <LabelList dataKey={item.id} position="top" />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Plot>
      )}
    </Figure>
  );
}
