"use client";

import { useState } from "react";
import styled from "styled-components";

import { Button, Select } from "@/components/base";
import {
  DateRangePicker,
  FileUploader,
  FilterBar,
  Pagination,
  ProgressBar,
  ProjectCard,
  SearchField,
  TaskRow,
} from "@/components/composite";
import type { UploadItem } from "@/components/composite";
import {
  ActivityTimeline,
  AlertList,
  AppHeader,
  BudgetPanel,
  DataTable,
  KpiPanel,
  ProgressChart,
  RoleSidebar,
} from "@/components/page";
import type { DataTableSort } from "@/components/page";
import { EmptyState } from "@/components/system";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[24]};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.headingMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.headingMedium.lineHeight};
  font-weight: ${({ theme }) => theme.typography.headingMedium.fontWeight};
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

const Caption = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.featured};
  overflow: visible;
`;

const ShellBody = styled.div`
  display: flex;
  align-items: stretch;
  min-height: calc(${({ theme }) => theme.space[64]} * 5);
`;

const PROJECTS = [
  { id: "p1", name: "Semillero GITEMOS", status: "En curso", progress: "45,6 %" },
  { id: "p2", name: "Línea de materiales", status: "Al día", progress: "72 %" },
  { id: "p3", name: "Bitácora de campo", status: "Retrasado", progress: "18 %" },
];

export function DesignCompositeSections() {
  const [query, setQuery] = useState("informe");
  const [status, setStatus] = useState("en-curso");
  const [range, setRange] = useState<{ from?: string | null; to?: string | null }>({
    from: "2026-10-01T05:00:00.000Z",
    to: "2026-10-15T05:00:00.000Z",
  });
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>({ columnId: "name", direction: "asc" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const chips = [
    status ? { id: "status", label: status === "en-curso" ? "En curso" : "Al día" } : null,
    range.from ? { id: "range", label: "Periodo activo" } : null,
  ].filter((chip): chip is { id: string; label: string } => chip !== null);

  return (
    <>
      <Section aria-labelledby="compuestos-title">
        <Title id="compuestos-title">Compuestos</Title>
        <Block>
          <Caption>ProgressBar</Caption>
          <ProgressBar label="Avance" value={45.6} />
          <ProgressBar label="Sincronización" indeterminate />
        </Block>
        <Block>
          <Caption>SearchField</Caption>
          <SearchField label="Buscar proyectos" value={query} onChange={setQuery} />
        </Block>
        <Block>
          <Caption>FilterBar</Caption>
          <FilterBar
            searchLabel="Buscar"
            searchValue={query}
            onSearchChange={setQuery}
            resultCount={PROJECTS.length}
            chips={chips}
            onRemoveChip={(id) => {
              if (id === "status") setStatus("");
              if (id === "range") setRange({});
            }}
            onClear={() => {
              setQuery("");
              setStatus("");
              setRange({});
            }}
          >
            <Select
              label="Estado"
              value={status}
              onValueChange={setStatus}
              options={[
                { value: "en-curso", label: "En curso" },
                { value: "al-dia", label: "Al día" },
              ]}
            />
            <DateRangePicker label="Periodo" value={range} onChange={setRange} />
          </FilterBar>
        </Block>
        <Block>
          <Caption>Pagination</Caption>
          <Pagination page={page} pageSize={10} totalItems={36} onPageChange={setPage} />
        </Block>
        <Block>
          <Caption>ProjectCard y TaskRow</Caption>
          <ProjectCard
            title="Semillero GITEMOS"
            href="/design"
            status="in_progress"
            people={[{ name: "Ana Ruiz" }, { name: "Luis Gómez" }]}
            progress={45.6}
            nextDate="2026-11-02T05:00:00.000Z"
            actions={[{ id: "open", label: "Abrir ficha", onSelect: () => undefined }]}
          />
          <ul>
            <li>
              <TaskRow
                title="Cargar evidencia de octubre"
                href="/design"
                assignee="Ana Ruiz"
                status="on_track"
                due="2026-10-28T05:00:00.000Z"
                canUpdate
                checked={done}
                onCheckedChange={setDone}
              />
            </li>
          </ul>
        </Block>
        <Block>
          <Caption>FileUploader</Caption>
          <FileUploader
            label="Adjuntar evidencia"
            accept=".pdf,application/pdf"
            maxBytes={5 * 1024 * 1024}
            files={uploads}
            onSelect={(files) =>
              setUploads((current) => [
                ...current,
                ...files.map((file) => ({
                  id: file.name,
                  name: file.name,
                  sizeBytes: file.size,
                  progress: 40,
                  status: "uploading" as const,
                })),
              ])
            }
            onCancel={(id) => setUploads((current) => current.filter((file) => file.id !== id))}
            onRetry={(id) =>
              setUploads((current) =>
                current.map((file) =>
                  file.id === id ? { ...file, status: "uploading", error: undefined } : file,
                ),
              )
            }
          />
        </Block>
      </Section>

      <Section aria-labelledby="pagina-title">
        <Title id="pagina-title">Página</Title>
        <Block>
          <Caption>DataTable</Caption>
          <DataTable
            caption="Proyectos del grupo"
            rows={PROJECTS}
            getRowId={(row) => row.id}
            sort={sort}
            onSortChange={setSort}
            highlightedId="p2"
            columns={[
              { id: "name", header: "Proyecto", sortable: true, cell: (row) => row.name },
              { id: "status", header: "Estado", cell: (row) => row.status },
              { id: "progress", header: "Avance", align: "end", cell: (row) => row.progress },
            ]}
            pagination={{ page, pageSize: 10, totalItems: 36, onPageChange: setPage }}
            emptyState={
              <EmptyState
                kind="no-results"
                title="Sin proyectos"
                description="Ajusta los filtros para ver resultados."
              />
            }
          />
        </Block>
        <Block>
          <Caption>KpiPanel</Caption>
          <KpiPanel
            period="Octubre 2026"
            metrics={[
              {
                id: "tasks",
                label: "Tareas al día",
                value: "18",
                context: "18/25 · 72 % cumplido",
                delta: { direction: "up", label: "2 respecto al mes anterior" },
              },
              {
                id: "late",
                label: "Retrasadas",
                value: "3",
                context: "Requieren seguimiento",
                delta: { direction: "down", label: "1 respecto al mes anterior" },
              },
              {
                id: "budget",
                label: "Ejecución",
                value: "64 %",
                context: "Del presupuesto asignado",
                delta: { direction: "flat", label: "sin variación" },
              },
              { id: "evidence", label: "Evidencias", value: "12", context: "Cargadas este mes" },
              { id: "hidden", label: "No debe verse", value: "99" },
            ]}
          />
        </Block>
        <Block>
          <Caption>AlertList</Caption>
          <AlertList
            items={[
              {
                id: "a2",
                severity: "attention",
                title: "Evidencia pendiente",
                interpretation: "Dos tareas vencen esta semana y no tienen archivo.",
                href: "/design",
                hrefLabel: "Revisar tareas",
              },
              {
                id: "a1",
                severity: "critical",
                title: "Presupuesto sobre el límite",
                interpretation: "La rúbrica de materiales supera lo planeado.",
                href: "/design",
                hrefLabel: "Ver rúbrica",
              },
              {
                id: "a3",
                severity: "on-track",
                title: "Informe mensual enviado",
                interpretation: "El coordinador ya recibió el corte de octubre.",
                href: "/design",
                hrefLabel: "Abrir informe",
              },
            ]}
          />
        </Block>
        <Block>
          <Caption>ProgressChart</Caption>
          <ProgressChart
            title="Avance del grupo"
            period="Últimos tres meses"
            series={[
              { id: "plan", name: "Planeado" },
              { id: "real", name: "Ejecutado" },
            ]}
            points={[
              { label: "Ago", values: { plan: 30, real: 22 } },
              { label: "Sep", values: { plan: 55, real: 48 } },
              { label: "Oct", values: { plan: 70, real: 64 } },
            ]}
          />
        </Block>
        <Block>
          <Caption>ActivityTimeline</Caption>
          <ActivityTimeline
            items={[
              {
                id: "t1",
                at: "2026-10-20T15:30:00.000Z",
                actor: "Ana Ruiz",
                text: "cargó la evidencia de la visita de campo.",
                evidenceHref: "/design",
                evidenceLabel: "Ver evidencia",
              },
            ]}
            onLoadOlder={() => undefined}
          />
        </Block>
        <Block>
          <Caption>BudgetPanel</Caption>
          <BudgetPanel
            assigned="1250000"
            executed="800000"
            executedPercent={64}
            canEdit
            onEdit={() => undefined}
            onOpenEvidence={() => undefined}
            lines={[
              {
                id: "b1",
                rubric: "Materiales",
                planned: "700000",
                spent: "640000",
                status: "missing",
              },
            ]}
          />
        </Block>
        <Stack>
          <Caption>RoleSidebar y AppHeader</Caption>
          <Shell>
            <AppHeader
              crumbs={[{ label: "Inicio", href: "/design" }, { label: "Grupo GITEMOS" }]}
              connection="disconnected"
              onReconnect={() => undefined}
              userName="Ana Ruiz"
            />
            <ShellBody>
              <RoleSidebar
                items={[
                  { href: "/design", label: "Mis tareas" },
                  { href: "/design#grupo", label: "Grupo" },
                ]}
                currentPath="/design"
                profileName="Ana Ruiz"
              />
            </ShellBody>
          </Shell>
          <Button type="button" intent="secondary" onClick={() => setDrawerOpen(true)}>
            Abrir navegación
          </Button>
          <RoleSidebar
            variant="drawer"
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            items={[
              { href: "/design", label: "Mis tareas" },
              { href: "/design#grupo", label: "Grupo" },
            ]}
            currentPath="/design"
            profileName="Ana Ruiz"
          />
        </Stack>
      </Section>
    </>
  );
}
