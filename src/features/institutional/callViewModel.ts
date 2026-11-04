/** Local UI view model for ADM-02. Not a substitute for @quantia/contracts. */

export type CallKpis = {
  budgetAmount: string;
  executedAmount: string;
  projectCount: number;
  withoutEvidenceCount: number;
};

export type CallProjectRow = {
  id: string;
  title: string;
  statusLabel: string;
  coordinatorLabel: string;
  withoutEvidence: boolean;
};

export type CallSummary = {
  id: string;
  title: string;
  subtitle: string;
  kpis: CallKpis;
  projects: CallProjectRow[];
  /** First project missing evidence — target for the «Sin evidencia» link. */
  evidenceReviewProjectId: string | null;
};

export type CallListCard = {
  id: string;
  title: string;
  periodLabel: string;
  budgetAmount: string;
  executedAmount: string;
  projectCount: number;
  href: string;
};
