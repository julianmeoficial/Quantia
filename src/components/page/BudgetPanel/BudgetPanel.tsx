"use client";

import { useState } from "react";
import styled from "styled-components";

import { Button, Link } from "@/components/base";
import { DataTable } from "@/components/page/DataTable";
import { ConfirmDialog } from "@/components/system";
import { formatCOP, formatPercent } from "@/lib/format";

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[24]};
  padding: ${({ theme }) => theme.space[24]};
  background: ${({ theme }) => theme.colors.bg.surface};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.card};
`;

const Summary = styled.dl`
  display: grid;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;

  ${({ theme }) => theme.media.up("md")} {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Term = styled.dt`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
`;

const Detail = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.headingSmall.fontSize};
  font-weight: ${({ theme }) => theme.typography.headingSmall.fontWeight};
`;

export interface BudgetLine {
  id: string;
  rubric: string;
  planned: string;
  spent: string;
  evidenceHref?: string;
  evidenceLabel?: string;
}

export interface BudgetPanelProps {
  assigned: string;
  executed: string;
  executedPercent: number;
  lines: BudgetLine[];
  canEdit?: boolean;
  onRemoveLine?: (id: string) => void;
}

export function BudgetPanel({
  assigned,
  executed,
  executedPercent,
  lines,
  canEdit = false,
  onRemoveLine,
}: BudgetPanelProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pending = lines.find((line) => line.id === pendingId);

  return (
    <Panel aria-label="Presupuesto">
      <Summary>
        <div>
          <Term>Asignado</Term>
          <Detail>{formatCOP(assigned)}</Detail>
        </div>
        <div>
          <Term>Ejecutado</Term>
          <Detail>{formatCOP(executed)}</Detail>
        </div>
        <div>
          <Term>Porcentaje ejecutado</Term>
          <Detail>{formatPercent(executedPercent)}</Detail>
        </div>
      </Summary>
      <DataTable
        caption="Rúbrica"
        rows={lines}
        getRowId={(row) => row.id}
        columns={[
          { id: "rubric", header: "Rúbrica", cell: (row) => row.rubric },
          {
            id: "planned",
            header: "Planeado",
            align: "end",
            cell: (row) => formatCOP(row.planned),
          },
          { id: "spent", header: "Ejecutado", align: "end", cell: (row) => formatCOP(row.spent) },
          {
            id: "evidence",
            header: "Evidencia",
            cell: (row) =>
              row.evidenceHref && row.evidenceLabel ? (
                <Link href={row.evidenceHref}>{row.evidenceLabel}</Link>
              ) : (
                "—"
              ),
          },
          ...(canEdit
            ? [
                {
                  id: "actions",
                  header: "Acciones",
                  cell: (row: BudgetLine) => (
                    <Button type="button" intent="danger" onClick={() => setPendingId(row.id)}>
                      Quitar rúbrica
                    </Button>
                  ),
                },
              ]
            : []),
        ]}
      />
      <ConfirmDialog
        open={pendingId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        title="Quitar rúbrica"
        description={
          pending
            ? `Se quitará «${pending.rubric}» del presupuesto. Esta acción no se puede deshacer desde aquí.`
            : "Se quitará la rúbrica seleccionada."
        }
        confirmLabel="Quitar"
        onConfirm={() => {
          if (pendingId) onRemoveLine?.(pendingId);
          setPendingId(null);
        }}
      />
    </Panel>
  );
}
