"use client";

import type { BudgetResponse, ProjectResponse } from "@quantia/contracts";
import { updateBudgetRequestSchema } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, TextField } from "@/components/base";
import { ConfirmDialog, Sheet } from "@/components/system";
import { updateProjectBudget } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "../projects/CreateProjectPanel.styles";

type DraftItem = {
  key: string;
  category: string;
  plannedAmount: string;
  notes: string;
};

export interface EditBudgetPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  budget: BudgetResponse;
  onSuccess?: (budget: BudgetResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

function toDraftItems(budget: BudgetResponse): DraftItem[] {
  return budget.items.map((item, index) => ({
    key: item.id || `item-${index}`,
    category: item.category,
    plannedAmount: item.plannedAmount,
    notes: item.notes ?? "",
  }));
}

function EditBudgetForm({
  project,
  budget,
  onOpenChange,
  onSuccess,
}: {
  project: ProjectResponse;
  budget: BudgetResponse;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (budget: BudgetResponse) => void;
}) {
  const totalId = useId();
  const [totalAmount, setTotalAmount] = useState(budget.totalAmount);
  const [items, setItems] = useState<DraftItem[]>(() => toDraftItems(budget));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClose = () => {
    if (isSaving) return;
    onOpenChange(false);
  };

  const updateItem = (key: string, patch: Partial<DraftItem>) => {
    setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        key: `new-${prev.length}-${Date.now()}`,
        category: "",
        plannedAmount: "",
        notes: "",
      },
    ]);
  };

  const removeItem = (key: string) => {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((item) => item.key !== key)));
  };

  const validateDraft = (): boolean => {
    if (!totalAmount.trim()) {
      setError("Ingresa el monto total asignado.");
      document.getElementById(totalId)?.focus();
      return false;
    }
    if (items.length === 0) {
      setError("Agrega al menos una rúbrica.");
      return false;
    }
    for (const item of items) {
      if (!item.category.trim() || !item.plannedAmount.trim()) {
        setError("Cada rúbrica necesita categoría y monto planeado.");
        return false;
      }
    }

    const parsed = updateBudgetRequestSchema.safeParse({
      totalAmount: totalAmount.trim(),
      currency: "COP",
      alertThresholdPercent: budget.alertThresholdPercent,
      items: items.map((item) => ({
        category: item.category.trim(),
        plannedAmount: item.plannedAmount.trim(),
        notes: item.notes.trim() ? item.notes.trim() : undefined,
      })),
    });

    if (!parsed.success) {
      setError("Revisa los montos (formato decimal válido).");
      return false;
    }

    setError(null);
    return true;
  };

  const requestSave = () => {
    if (!validateDraft()) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    setIsSaving(true);
    setError(null);
    try {
      const body = updateBudgetRequestSchema.parse({
        totalAmount: totalAmount.trim(),
        currency: "COP",
        alertThresholdPercent: budget.alertThresholdPercent,
        items: items.map((item) => ({
          category: item.category.trim(),
          plannedAmount: item.plannedAmount.trim(),
          notes: item.notes.trim() ? item.notes.trim() : undefined,
        })),
      });
      const next = await updateProjectBudget(project.id, body);
      onOpenChange(false);
      onSuccess?.(next);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para editar el presupuesto.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los montos (formato decimal válido).");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos guardar el presupuesto. Inténtalo de nuevo.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Sheet
        open
        onOpenChange={(next) => {
          if (!next) handleClose();
        }}
        title="Editar presupuesto"
        description={`Reemplaza totales y rúbricas de «${project.title}». El listado de ítems se envía completo.`}
        footer={
          <S.FormActions>
            <Button intent="secondary" type="button" disabled={isSaving} onClick={handleClose}>
              Cancelar
            </Button>
            <Button intent="primary" type="button" isLoading={isSaving} onClick={requestSave}>
              Guardar cambios
            </Button>
          </S.FormActions>
        }
      >
        <S.Form
          onSubmit={(event) => {
            event.preventDefault();
            requestSave();
          }}
        >
          <TextField
            id={totalId}
            label="Monto total (COP)"
            value={totalAmount}
            onChange={(event) => setTotalAmount(event.target.value)}
            placeholder="Ej.: 110000000"
          />

          {items.map((item, index) => (
            <div key={item.key}>
              <TextField
                id={`edit-category-${item.key}`}
                label={`Rúbrica ${index + 1}`}
                value={item.category}
                onChange={(event) => updateItem(item.key, { category: event.target.value })}
                placeholder="Ej.: Equipos de campo"
              />
              <TextField
                id={`edit-planned-${item.key}`}
                label="Monto planeado (COP)"
                value={item.plannedAmount}
                onChange={(event) => updateItem(item.key, { plannedAmount: event.target.value })}
                placeholder="Ej.: 80000000"
              />
              <TextField
                id={`edit-notes-${item.key}`}
                label="Notas (opcional)"
                value={item.notes}
                onChange={(event) => updateItem(item.key, { notes: event.target.value })}
              />
              {items.length > 1 ? (
                <Button
                  type="button"
                  intent="danger"
                  onClick={() => removeItem(item.key)}
                  disabled={isSaving}
                >
                  Quitar rúbrica
                </Button>
              ) : null}
            </div>
          ))}

          <Button type="button" intent="secondary" onClick={addItem} disabled={isSaving}>
            Agregar rúbrica
          </Button>

          {error ? <S.FormError role="alert">{error}</S.FormError> : null}
        </S.Form>
      </Sheet>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reemplazar rúbricas"
        description="Se reemplazará la lista completa de rúbricas del presupuesto. Los montos y categorías quedarán como los editaste."
        confirmLabel="Guardar cambios"
        onConfirm={() => {
          void handleConfirmSave();
        }}
      />
    </>
  );
}

export function EditBudgetPanel({
  open,
  onOpenChange,
  project,
  budget,
  onSuccess,
  triggerRef,
}: EditBudgetPanelProps) {
  if (!open) return null;

  return (
    <span ref={triggerRef}>
      <EditBudgetForm
        key={`${budget.id}:${budget.updatedAt}`}
        project={project}
        budget={budget}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </span>
  );
}
