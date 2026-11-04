"use client";

import type { BudgetExecutionResponse } from "@quantia/contracts";
import type { RefObject } from "react";
import styled from "styled-components";

import { Badge, Button, Link } from "@/components/base";
import { EmptyState, Sheet } from "@/components/system";
import { formatCOP, formatDate } from "@/lib/format";

import type { BudgetItemView } from "./buildBudgetLines";
import * as S from "../projects/CreateProjectPanel.styles";

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
`;

const Text = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

const Meta = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

const ExecutionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const EXECUTION_KIND_LABEL: Record<BudgetExecutionResponse["kind"], string> = {
  COMMITMENT: "Compromiso",
  PAYMENT: "Pago",
  ADJUSTMENT: "Ajuste",
};

export interface EvidenceReviewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectTitle: string;
  item: BudgetItemView | null;
  executions: BudgetExecutionResponse[];
  triggerRef?: RefObject<HTMLElement | null>;
}

export function EvidenceReviewPanel({
  open,
  onOpenChange,
  projectId,
  projectTitle,
  item,
  executions,
  triggerRef,
}: EvidenceReviewPanelProps) {
  const documentsHref = `/proyectos/${projectId}?tab=documentos`;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Revisión de evidencia"
      description={
        item
          ? `Actividad y soporte asociados a «${item.category}» en ${projectTitle}.`
          : `Evidencia presupuestal de ${projectTitle}.`
      }
      triggerRef={triggerRef}
      footer={
        <S.FormActions>
          <Button intent="secondary" type="button" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Link href={documentsHref}>Ver documentos del proyecto</Link>
        </S.FormActions>
      }
    >
      {item ? (
        <Body>
          <Block>
            <Text>
              <strong>Rubro / actividad</strong>
            </Text>
            <Text>{item.category}</Text>
            {item.notes ? <Meta>{item.notes}</Meta> : null}
            <Meta>Planeado: {formatCOP(item.plannedAmount)}</Meta>
          </Block>

          {executions.length === 0 ? (
            <EmptyState
              kind="no-records"
              title="Sin gastos registrados"
              description="Cuando existan ejecuciones de esta rúbrica aparecerán aquí con tipo, monto y responsable."
            />
          ) : (
            <ExecutionList>
              {executions.map((execution) => (
                <li key={execution.id}>
                  <Block>
                    <Text>
                      <Badge
                        label={EXECUTION_KIND_LABEL[execution.kind]}
                        tone={execution.kind === "PAYMENT" ? "success" : "neutral"}
                      />{" "}
                      {formatCOP(execution.amount)} · {formatDate(execution.occurredAt)}
                    </Text>
                    <Meta>
                      Responsable del registro:{" "}
                      {execution.registeredById
                        ? "Usuario registrado en la ejecución"
                        : "Sin responsable"}
                    </Meta>
                    <Meta>{execution.note ?? "Sin nota de actividad."}</Meta>
                  </Block>
                </li>
              ))}
            </ExecutionList>
          )}

          <EmptyState
            kind="no-records"
            title="Sin documento vinculado en el contrato"
            description="La API de presupuesto no expone documentId por gasto. No se inventa un vínculo ni una URL firmada. Usa los documentos del proyecto cuando exista un soporte real."
            action={<Link href={documentsHref}>Ir a documentos</Link>}
          />
        </Body>
      ) : (
        <EmptyState
          kind="no-records"
          title="Selecciona una rúbrica"
          description="Abre Revisar desde la tabla de presupuesto para ver la actividad de un rubro."
        />
      )}
    </Sheet>
  );
}
