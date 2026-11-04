import type { CallListCard, CallSummary } from "./callViewModel";
import { isCallFixturesEnabled } from "./isCallFixturesEnabled";

const CALL_2026_01: CallSummary = {
  id: "2026-01",
  title: "Convocatoria 2026-01",
  subtitle: "Techo, ejecución y proyectos adscritos · semillero institucional.",
  kpis: {
    budgetAmount: "420000000.00",
    executedAmount: "261000000.00",
    projectCount: 9,
    withoutEvidenceCount: 2,
  },
  projects: [
    {
      id: "demo-proj-iot",
      title: "Monitoreo IoT en humedales",
      statusLabel: "En curso",
      coordinatorLabel: "Ana Ruiz",
      withoutEvidence: true,
    },
    {
      id: "demo-proj-agro",
      title: "Agrotech comunitario",
      statusLabel: "En curso",
      coordinatorLabel: "Luis Gómez",
      withoutEvidence: true,
    },
    {
      id: "demo-proj-edu",
      title: "Educación STEM rural",
      statusLabel: "Retrasado",
      coordinatorLabel: "Marta Herrera",
      withoutEvidence: false,
    },
    {
      id: "demo-proj-energy",
      title: "Energía solar en campus",
      statusLabel: "En curso",
      coordinatorLabel: "Carlos Pérez",
      withoutEvidence: false,
    },
    {
      id: "demo-proj-water",
      title: "Calidad del agua urbana",
      statusLabel: "Finalizado",
      coordinatorLabel: "Ana Ruiz",
      withoutEvidence: false,
    },
  ],
  evidenceReviewProjectId: "demo-proj-iot",
};

const CALL_CARDS: CallListCard[] = [
  {
    id: CALL_2026_01.id,
    title: CALL_2026_01.title,
    periodLabel: "Vigencia 2026",
    budgetAmount: CALL_2026_01.kpis.budgetAmount,
    executedAmount: CALL_2026_01.kpis.executedAmount,
    projectCount: CALL_2026_01.kpis.projectCount,
    href: `/convocatorias/${CALL_2026_01.id}`,
  },
];

const BY_ID: Record<string, CallSummary> = {
  [CALL_2026_01.id]: CALL_2026_01,
};

/** Development-only call list for ADM-01. Empty when fixtures are disabled. */
export function listCallFixtureCards(): CallListCard[] {
  if (!isCallFixturesEnabled()) return [];
  return CALL_CARDS;
}

/** Development-only call detail for ADM-02. Null when fixtures are off or id is unknown. */
export function getCallFixture(id: string): CallSummary | null {
  if (!isCallFixturesEnabled()) return null;
  return BY_ID[id] ?? null;
}
