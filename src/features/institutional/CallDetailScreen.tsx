"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Badge, Link } from "@/components/base";
import { DataTable, KpiPanel, type DataTableColumn, type KpiMetric } from "@/components/page";
import { EmptyState, ErrorState, Skeleton } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { canAccess } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatCOP } from "@/lib/format";

import { getCallFixture } from "./callFixtures";
import type { CallProjectRow } from "./callViewModel";
import * as S from "./CallDetailScreen.styles";
import { isCallFixturesEnabled } from "./isCallFixturesEnabled";

export interface CallDetailScreenProps {
  callId: string;
}

function buildCallKpis(
  call: NonNullable<ReturnType<typeof getCallFixture>>,
  evidenceHref: string | null,
): KpiMetric[] {
  return [
    {
      id: "budget",
      label: "Presupuesto",
      value: formatCOP(call.kpis.budgetAmount),
      context: "Techo de la convocatoria",
    },
    {
      id: "executed",
      label: "Ejecutado",
      value: formatCOP(call.kpis.executedAmount),
      context: "Suma de ejecución reportada",
    },
    {
      id: "projects",
      label: "Proyectos",
      value: String(call.kpis.projectCount),
      context: "Adscritos a la convocatoria",
    },
    {
      id: "without-evidence",
      label: "Sin evidencia",
      value: String(call.kpis.withoutEvidenceCount),
      context: evidenceHref
        ? "Revisión de evidencia pendiente"
        : "Sin enlace de revisión disponible",
    },
  ];
}

function buildColumns(): DataTableColumn<CallProjectRow>[] {
  return [
    {
      id: "title",
      header: "Proyecto",
      cell: (row) => row.title,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => <Badge label={row.statusLabel} tone="neutral" />,
    },
    {
      id: "coordinator",
      header: "Responsable",
      cell: (row) => row.coordinatorLabel,
    },
    {
      id: "evidence",
      header: "Evidencia",
      cell: (row) =>
        row.withoutEvidence ? (
          <Link href={`/presupuesto?projectId=${row.id}`}>Sin evidencia</Link>
        ) : (
          "Con soporte"
        ),
    },
  ];
}

export function CallDetailScreen({ callId }: CallDetailScreenProps) {
  const router = useRouter();
  const { identity } = useAuth();
  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess(`/convocatorias/${callId}`, roles);

  const fixturesOn = isCallFixturesEnabled();
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 0);
    return () => window.clearTimeout(timer);
  }, [callId]);

  const call = useMemo(() => getCallFixture(callId), [callId]);
  const columns = useMemo(() => buildColumns(), []);

  const evidenceHref = call?.evidenceReviewProjectId
    ? `/presupuesto?projectId=${call.evidenceReviewProjectId}`
    : null;

  if (!allowed) {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  if (booting) {
    return (
      <S.Page>
        <S.LoadingBlock aria-busy="true" aria-label="Cargando">
          <Skeleton variant="metric" />
          <Skeleton variant="table" />
        </S.LoadingBlock>
      </S.Page>
    );
  }

  if (!fixturesOn) {
    return (
      <S.Page>
        <S.Header>
          <S.Title>Convocatoria</S.Title>
          <S.Subtitle>Detalle institucional de techo, ejecución y proyectos.</S.Subtitle>
        </S.Header>
        <EmptyState
          kind="no-records"
          title="Integración no disponible"
          description="No hay contrato de convocatorias en la API. No se muestran totales ni proyectos inventados."
          action={<Link href="/institucional">Volver a institucional</Link>}
        />
      </S.Page>
    );
  }

  if (!call) {
    return (
      <ErrorState
        variant="not-found"
        onRetry={() => router.replace("/institucional")}
        retryLabel="Volver a institucional"
      />
    );
  }

  const metrics = buildCallKpis(call, evidenceHref);

  return (
    <S.Page>
      <S.Header>
        <S.Title>{call.title}</S.Title>
        <S.Subtitle>{call.subtitle}</S.Subtitle>
      </S.Header>

      <S.DemoBanner role="note">
        Datos de demostración — sin contrato de convocatorias. Solo visibles en desarrollo.
      </S.DemoBanner>

      <KpiPanel period={call.title} metrics={metrics} title="Indicadores de la convocatoria" />

      {evidenceHref ? (
        <S.EvidenceNote>
          <Link href={evidenceHref}>
            Revisar evidencia ({call.kpis.withoutEvidenceCount} sin soporte)
          </Link>
        </S.EvidenceNote>
      ) : null}

      <S.Section aria-labelledby="call-projects">
        <S.SectionTitle id="call-projects">Proyectos adscritos</S.SectionTitle>
        <DataTable
          caption="Proyectos adscritos a la convocatoria"
          columns={columns}
          rows={call.projects}
          getRowId={(row) => row.id}
          emptyState={
            <EmptyState
              kind="no-records"
              title="Sin proyectos en esta convocatoria"
              description="No hay proyectos adscritos en los datos de demostración."
            />
          }
        />
      </S.Section>
    </S.Page>
  );
}
