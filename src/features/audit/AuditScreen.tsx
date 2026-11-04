"use client";

import { ReportKind } from "@quantia/contracts";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

import { Button, Select, TextField } from "@/components/base";
import {
  DateRangePicker,
  FilterBar,
  type DateRangeValue,
  type FilterChip,
} from "@/components/composite";
import { DataTable, type DataTableColumn } from "@/components/page";
import { EmptyState, ErrorState, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { canAccess, canViewAudit } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";

import { listAuditFixtures } from "./auditFixtures";
import { ORIGIN_LABEL, type AuditEntry, type AuditOrigin } from "./auditViewModel";
import { ExportReportPanel, type ExportReportKind } from "./ExportReportPanel";
import { isAuditFixturesEnabled } from "./isAuditFixturesEnabled";
import * as S from "../tasks/sectionPage.styles";

const DemoBanner = styled.p`
  margin: 0;
  padding: ${({ theme }) => theme.space[12]} ${({ theme }) => theme.space[16]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  line-height: ${({ theme }) => theme.typography.caption.lineHeight};
  background: ${({ theme }) => theme.colors.bg.subtle};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
`;

const TableScroll = styled.div`
  max-width: 100%;
  overflow-x: auto;
`;

const ALL_ORIGINS = "all" as const;

const ORIGIN_OPTIONS = [
  { value: ALL_ORIGINS, label: "Todos los orígenes" },
  { value: "app", label: "App" },
  { value: "notion", label: "Notion" },
];

function toTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

export function AuditScreen() {
  return (
    <ToastProvider>
      <AuditBody />
    </ToastProvider>
  );
}

function AuditBody() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/auditoria", roles) && Boolean(user && canViewAudit(user));

  const fixturesOn = isAuditFixturesEnabled();
  const [actorQuery, setActorQuery] = useState("");
  const [actionQuery, setActionQuery] = useState("");
  const [entityQuery, setEntityQuery] = useState("");
  const [origin, setOrigin] = useState<string>(ALL_ORIGINS);
  const [range, setRange] = useState<DateRangeValue>({ from: null, to: null });
  const [exportKind, setExportKind] = useState<ExportReportKind | null>(null);

  const entries = useMemo(() => listAuditFixtures(), []);

  const filtered = useMemo(() => {
    const actor = actorQuery.trim().toLowerCase();
    const action = actionQuery.trim().toLowerCase();
    const entity = entityQuery.trim().toLowerCase();
    const fromTime = toTime(range.from);
    const toTimeBound = toTime(range.to);

    return entries.filter((entry) => {
      if (actor && !entry.actorName.toLowerCase().includes(actor)) return false;
      if (action && !entry.action.toLowerCase().includes(action)) return false;
      if (entity && !entry.entity.toLowerCase().includes(entity)) return false;
      if (origin !== ALL_ORIGINS && entry.origin !== origin) return false;
      const entryTime = toTime(entry.occurredAt);
      if (entryTime !== null) {
        if (fromTime !== null && entryTime < fromTime) return false;
        if (toTimeBound !== null && entryTime > toTimeBound) return false;
      }
      return true;
    });
  }, [actionQuery, actorQuery, entries, entityQuery, origin, range.from, range.to]);

  const chips = useMemo((): FilterChip[] => {
    const next: FilterChip[] = [];
    if (actorQuery.trim()) next.push({ id: "actor", label: `Usuario: ${actorQuery.trim()}` });
    if (actionQuery.trim()) next.push({ id: "action", label: `Acción: ${actionQuery.trim()}` });
    if (entityQuery.trim()) next.push({ id: "entity", label: `Entidad: ${entityQuery.trim()}` });
    if (origin !== ALL_ORIGINS) {
      next.push({ id: "origin", label: `Origen: ${ORIGIN_LABEL[origin as AuditOrigin]}` });
    }
    if (range.from || range.to) {
      next.push({
        id: "range",
        label: `Fechas: ${formatDate(range.from) === "—" ? "…" : formatDate(range.from)} – ${
          formatDate(range.to) === "—" ? "…" : formatDate(range.to)
        }`,
      });
    }
    return next;
  }, [actionQuery, actorQuery, entityQuery, origin, range.from, range.to]);

  const columns = useMemo(
    (): DataTableColumn<AuditEntry>[] => [
      { id: "actor", header: "Usuario", cell: (row) => row.actorName },
      { id: "action", header: "Acción", cell: (row) => row.action },
      { id: "entity", header: "Entidad afectada", cell: (row) => row.entity },
      {
        id: "occurredAt",
        header: "Fecha / hora",
        cell: (row) => formatDate(row.occurredAt, { withTime: true }),
      },
      {
        id: "origin",
        header: "Origen",
        cell: (row) => ORIGIN_LABEL[row.origin],
      },
    ],
    [],
  );

  const clearFilters = () => {
    setActorQuery("");
    setActionQuery("");
    setEntityQuery("");
    setOrigin(ALL_ORIGINS);
    setRange({ from: null, to: null });
  };

  if (!allowed) {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Auditoría</S.Title>
          <S.Subtitle>
            Registro de cambios sensibles · solo lectura. Coordinador sin acceso hasta decisión con
            el tutor.
          </S.Subtitle>
        </S.HeaderText>
        <S.HeaderActions>
          <Button
            intent="secondary"
            type="button"
            onClick={() => setExportKind(ReportKind.BUDGET_PDF)}
          >
            Informe PDF de proyecto
          </Button>
          <Button
            intent="secondary"
            type="button"
            onClick={() => setExportKind(ReportKind.BUDGET_EXCEL)}
          >
            Informe Excel de proyecto
          </Button>
        </S.HeaderActions>
      </S.Header>

      {!fixturesOn ? (
        <>
          <DemoBanner role="note">
            Los filtros no están operativos: no hay contrato de auditoría en la API. Los botones de
            informe generan BUDGET_PDF / BUDGET_EXCEL de un proyecto seleccionado — no un export
            institucional (RF-17).
          </DemoBanner>

          <FilterBar searchLabel="Usuario" searchValue="" onSearchChange={() => undefined} disabled>
            <TextField label="Acción" value="" disabled onChange={() => undefined} />
            <TextField label="Entidad" value="" disabled onChange={() => undefined} />
            <Select
              label="Origen"
              options={ORIGIN_OPTIONS}
              value={ALL_ORIGINS}
              onValueChange={() => undefined}
              disabled
            />
            <TextField label="Rango de fechas" value="" disabled onChange={() => undefined} />
          </FilterBar>

          <EmptyState
            kind="no-records"
            title="Integración no disponible"
            description="No hay contrato de auditoría en la API. No se inventan eventos ni historiales."
          />
        </>
      ) : (
        <>
          <DemoBanner role="note">
            Datos de demostración — sin contrato de auditoría. Solo visibles en desarrollo. Los
            filtros operan sobre estas filas locales. Los informes PDF/Excel son de proyecto, no
            institucionales.
          </DemoBanner>

          <FilterBar
            searchLabel="Usuario"
            searchValue={actorQuery}
            onSearchChange={setActorQuery}
            chips={chips}
            onRemoveChip={(id) => {
              if (id === "actor") setActorQuery("");
              if (id === "action") setActionQuery("");
              if (id === "entity") setEntityQuery("");
              if (id === "origin") setOrigin(ALL_ORIGINS);
              if (id === "range") setRange({ from: null, to: null });
            }}
            onClear={chips.length > 0 ? clearFilters : undefined}
            resultCount={filtered.length}
          >
            <TextField
              label="Acción"
              value={actionQuery}
              onChange={(event) => setActionQuery(event.target.value)}
            />
            <TextField
              label="Entidad"
              value={entityQuery}
              onChange={(event) => setEntityQuery(event.target.value)}
            />
            <Select
              label="Origen"
              options={ORIGIN_OPTIONS}
              value={origin}
              onValueChange={setOrigin}
            />
            <DateRangePicker label="Rango de fechas" value={range} onChange={setRange} />
          </FilterBar>

          <TableScroll role="region" aria-label="Registro de auditoría" tabIndex={0}>
            <DataTable
              caption="Registro de auditoría"
              columns={columns}
              rows={filtered}
              getRowId={(row) => row.id}
              emptyState={
                <EmptyState
                  kind="no-results"
                  title="Sin resultados con estos filtros"
                  description="Ajusta usuario, acción, entidad, fechas u origen."
                  action={
                    <Button intent="secondary" type="button" onClick={clearFilters}>
                      Limpiar filtros
                    </Button>
                  }
                />
              }
            />
          </TableScroll>
        </>
      )}

      {exportKind ? (
        <ExportReportPanel
          open
          kind={exportKind}
          onOpenChange={(open) => {
            if (!open) setExportKind(null);
          }}
        />
      ) : null}
    </S.Page>
  );
}
