export interface ProgressSeries {
  id: string;
  name: string;
}

export interface ProgressPoint {
  label: string;
  values: Record<string, number>;
}
