"use client";

import { Badge, Button, STATUS_BADGE } from "@/components/base";
import { DataTable } from "@/components/page/DataTable";
import { formatCOP, formatPercent } from "@/lib/format";
import type { RubricExecutionStatus } from "@/lib/format";

import * as S from "./BudgetPanel.styles";

export interface BudgetLine {
  id: string;
  rubric: string;
  planned: string;
  spent: string;
  status: RubricExecutionStatus;
}

export type BudgetPanelMode = "detail" | "summary";

export interface BudgetPanelProps {
  assigned: string;
  executed: string;
  executedPercent: number;
  lines: BudgetLine[];
  mode?: BudgetPanelMode;
  canEdit?: boolean;
  onEdit?: () => void;
  onOpenEvidence?: (lineId: string) => void;
}

function StatusCell({ status }: { status: RubricExecutionStatus }) {
  const presentation = STATUS_BADGE[status];
  const Icon = presentation.icon;
  return <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;
}

export function BudgetPanel({
  assigned,
  executed,
  executedPercent,
  lines,
  mode = "detail",
  canEdit = false,
  onEdit,
  onOpenEvidence,
}: BudgetPanelProps) {
  const showEvidence = mode === "detail" && typeof onOpenEvidence === "function";
  const showEdit = mode === "detail" && canEdit && typeof onEdit === "function";

  return (
    <S.Panel aria-label="Presupuesto">
      <S.Header>
        <S.Summary>
          <div>
            <S.Term>Asignado</S.Term>
            <S.Detail>{formatCOP(assigned)}</S.Detail>
          </div>
          <div>
            <S.Term>Ejecutado</S.Term>
            <S.Detail>{formatCOP(executed)}</S.Detail>
          </div>
          <div>
            <S.Term>Porcentaje ejecutado</S.Term>
            <S.Detail>{formatPercent(executedPercent)}</S.Detail>
          </div>
        </S.Summary>
        {showEdit ? (
          <S.HeaderActions>
            <Button type="button" intent="secondary" onClick={onEdit}>
              Editar presupuesto
            </Button>
          </S.HeaderActions>
        ) : null}
      </S.Header>

      <S.TableScroll role="region" aria-label="Rúbricas del presupuesto" tabIndex={0}>
        <DataTable
          caption="Rubro, actividad y ejecución"
          rows={lines}
          getRowId={(row) => row.id}
          columns={[
            { id: "rubric", header: "Rubro / actividad", cell: (row) => row.rubric },
            {
              id: "planned",
              header: "Asignado",
              align: "end",
              cell: (row) => formatCOP(row.planned),
            },
            {
              id: "spent",
              header: "Ejecución",
              align: "end",
              cell: (row) => formatCOP(row.spent),
            },
            {
              id: "status",
              header: "Estado",
              cell: (row) => <StatusCell status={row.status} />,
            },
            ...(showEvidence
              ? [
                  {
                    id: "evidence",
                    header: "Evidencia",
                    cell: (row: BudgetLine) => (
                      <Button
                        type="button"
                        intent="secondary"
                        onClick={() => onOpenEvidence?.(row.id)}
                      >
                        Revisar
                      </Button>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </S.TableScroll>
    </S.Panel>
  );
}
