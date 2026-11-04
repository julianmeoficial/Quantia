"use client";

import type { BudgetResponse, ProjectResponse } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { createProjectBudget } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "../projects/CreateProjectPanel.styles";

export interface CreateBudgetPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  onSuccess?: (budget: BudgetResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

export function CreateBudgetPanel({
  open,
  onOpenChange,
  project,
  onSuccess,
  triggerRef,
}: CreateBudgetPanelProps) {
  const totalId = useId();
  const categoryId = useId();
  const plannedId = useId();
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setTotalAmount("");
    setCategory("");
    setPlannedAmount("");
    setError(null);
    setIsSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!totalAmount.trim()) {
      setError("Ingresa el monto total asignado.");
      document.getElementById(totalId)?.focus();
      return;
    }
    if (!category.trim() || !plannedAmount.trim()) {
      setError("Agrega al menos una rúbrica con categoría y monto planeado.");
      document.getElementById(categoryId)?.focus();
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const budget = await createProjectBudget(project.id, {
        totalAmount: totalAmount.trim(),
        currency: "COP",
        items: [
          {
            category: category.trim(),
            plannedAmount: plannedAmount.trim(),
          },
        ],
      });
      reset();
      onOpenChange(false);
      onSuccess?.(budget);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para crear el presupuesto.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los montos (formato decimal válido).");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos crear el presupuesto. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Crear presupuesto"
      description={`Define el monto asignado y la primera rúbrica para «${project.title}».`}
      triggerRef={triggerRef}
    >
      <S.Form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <TextField
          id={totalId}
          label="Monto total (COP)"
          value={totalAmount}
          onChange={(event) => setTotalAmount(event.target.value)}
          placeholder="Ej.: 15000000"
        />
        <TextField
          id={categoryId}
          label="Rúbrica"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Ej.: Personal"
        />
        <TextField
          id={plannedId}
          label="Monto planeado (COP)"
          value={plannedAmount}
          onChange={(event) => setPlannedAmount(event.target.value)}
          placeholder="Ej.: 5000000"
        />
        {error ? <S.FormError role="alert">{error}</S.FormError> : null}
        <S.FormActions>
          <Button
            intent="secondary"
            type="button"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button intent="primary" type="submit" isLoading={isSaving}>
            Crear presupuesto
          </Button>
        </S.FormActions>
      </S.Form>
    </Sheet>
  );
}
