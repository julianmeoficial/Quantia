"use client";

import type {
  BudgetExecutionKind,
  BudgetExecutionResponse,
  BudgetResponse,
  ProjectResponse,
} from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Select, TextArea, TextField } from "@/components/base";
import { DatePicker } from "@/components/composite";
import { Sheet } from "@/components/system";
import { createBudgetExecution } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { toApiDate } from "@/lib/format";

import * as S from "../projects/CreateProjectPanel.styles";

const KIND_OPTIONS: Array<{ value: BudgetExecutionKind; label: string }> = [
  { value: "COMMITMENT", label: "Compromiso (se reserva el dinero)" },
  { value: "PAYMENT", label: "Pago (se ejecuta el dinero)" },
  { value: "ADJUSTMENT", label: "Ajuste" },
];

const NO_ITEM = "__none__";
const AMOUNT = /^\d+(\.\d{1,2})?$/;

/** «1.500.000,50» / «1500000,5» → «1500000.50»; returns null when it is not a valid amount. */
export function normalizeAmount(raw: string): string | null {
  const text = raw.trim().replace(/\s/g, "");
  if (!text) return null;
  const decimalComma = /,\d{1,2}$/.test(text);
  const cleaned = decimalComma
    ? text.replace(/\./g, "").replace(",", ".")
    : text.replace(/[.,](?=\d{3}(\D|$))/g, "");
  return AMOUNT.test(cleaned) ? cleaned : null;
}

function todayIso(): string {
  return toApiDate(new Date()) ?? new Date().toISOString();
}

export interface RegisterExecutionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectResponse;
  budget: BudgetResponse;
  onSuccess?: (execution: BudgetExecutionResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

export function RegisterExecutionPanel({
  open,
  onOpenChange,
  project,
  budget,
  onSuccess,
  triggerRef,
}: RegisterExecutionPanelProps) {
  const amountId = useId();
  const [kind, setKind] = useState<BudgetExecutionKind>("PAYMENT");
  const [itemId, setItemId] = useState(NO_ITEM);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<string | null>(() => todayIso());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const itemOptions = [
    { value: NO_ITEM, label: "Sin rúbrica (general del proyecto)" },
    ...budget.items.map((item) => ({ value: item.id, label: item.category })),
  ];

  const reset = () => {
    setKind("PAYMENT");
    setItemId(NO_ITEM);
    setAmount("");
    setDate(todayIso());
    setNote("");
    setError(null);
    setIsSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    const normalized = normalizeAmount(amount);
    if (!normalized || Number(normalized) <= 0) {
      setError("Ingresa un monto válido en COP, por ejemplo 1500000 o 1.500.000,50.");
      document.getElementById(amountId)?.focus();
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const execution = await createBudgetExecution(project.id, {
        kind,
        amount: normalized,
        ...(itemId !== NO_ITEM ? { itemId } : {}),
        ...(date ? { occurredAt: date } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
      });
      reset();
      onOpenChange(false);
      onSuccess?.(execution);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para registrar ejecuciones en este proyecto.");
      } else if (apiError.kind === "validation") {
        setError(apiError.message || "Revisa los datos de la ejecución.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos registrar la ejecución. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Registrar ejecución"
      description={`Registra un compromiso, pago o ajuste del presupuesto de «${project.title}».`}
      triggerRef={triggerRef}
    >
      <S.Form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <Select
          label="Tipo"
          options={KIND_OPTIONS}
          value={kind}
          onValueChange={(value) => setKind(value as BudgetExecutionKind)}
        />
        <Select label="Rúbrica" options={itemOptions} value={itemId} onValueChange={setItemId} />
        <TextField
          id={amountId}
          label="Monto (COP)"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          placeholder="Ej.: 1500000"
        />
        <DatePicker
          label="Fecha"
          value={date}
          onValueChange={setDate}
          withTime
          maxDate={todayIso()}
        />
        <TextArea
          label="Nota (opcional)"
          value={note}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
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
            Registrar ejecución
          </Button>
        </S.FormActions>
      </S.Form>
    </Sheet>
  );
}
