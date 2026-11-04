"use client";

import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "styled-components";
import styled from "styled-components";

import type { ProgressPoint, ProgressSeries } from "./types";

const Plot = styled.div`
  width: 100%;
  min-width: 0;
  height: calc(${({ theme }) => theme.space[64]} * 4);
`;

const DASH = [undefined, "6 4", "2 4"] as const;

export interface ProgressChartPlotProps {
  series: ProgressSeries[];
  points: ProgressPoint[];
}

/** Isolated Recharts plot so the parent can load it with `next/dynamic`. */
export function ProgressChartPlot({ series, points }: ProgressChartPlotProps) {
  const theme = useTheme();
  const strokes = [
    theme.colors.brand.primary,
    theme.colors.status.info.text,
    theme.colors.status.success.text,
  ];
  const data = points.map((point) => ({ label: point.label, ...point.values }));
  // Text legend lives in ProgressChart (stroke style described in Spanish). Skip Recharts Legend
  // so medium widths (768) stay readable without a duplicate key.
  const tick = {
    fill: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
  };

  return (
    <Plot>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={theme.colors.border.subtle} />
          <XAxis
            dataKey="label"
            stroke={theme.colors.text.secondary}
            tick={tick}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={theme.colors.text.secondary}
            tick={tick}
            domain={[0, 100]}
            tickFormatter={(value: number) => `${value}`}
          />
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
  );
}
