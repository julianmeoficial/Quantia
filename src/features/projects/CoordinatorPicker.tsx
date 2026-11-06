"use client";

import type { UserResponse } from "@quantia/contracts";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useId, useMemo, useState, type KeyboardEvent } from "react";

import { CheckIcon, ChevronIcon } from "@/components/base/icons";
import { SearchField } from "@/components/composite";

import * as S from "./CoordinatorPicker.styles";

export interface CoordinatorPickerProps {
  label: string;
  /** Current coordinators (active, with the Coordinador role). */
  coordinators: readonly UserResponse[];
  status: "idle" | "loading" | "ready" | "error";
  value: string | null;
  onValueChange: (coordinator: UserResponse) => void;
  /** Shown when `value` is not in the list (e.g. a coordinator who is no longer active). */
  fallbackLabel?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onRetry?: () => void;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * «Responsable del proyecto»: only people with the Coordinador role. Opening it lists every
 * current coordinator right away; typing narrows the list. No minimum length, no guessing.
 */
export function CoordinatorPicker({
  label,
  coordinators,
  status,
  value,
  onValueChange,
  fallbackLabel,
  error,
  disabled = false,
  required = false,
  onRetry,
}: CoordinatorPickerProps) {
  const labelId = useId();
  const valueId = useId();
  const errorId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = coordinators.find((entry) => entry.id === value) ?? null;
  const visible = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return coordinators;
    return coordinators.filter((entry) =>
      normalize(`${entry.fullName} ${entry.email}`).includes(needle),
    );
  }, [coordinators, query]);

  const moveFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const options = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );
    if (options.length === 0) return;
    event.preventDefault();
    const index = options.findIndex((node) => node === document.activeElement);
    const next =
      event.key === "ArrowDown"
        ? options[Math.min(options.length - 1, index + 1)]
        : index <= 0
          ? options[0]
          : options[index - 1];
    next?.focus();
  };

  return (
    <S.Root>
      <S.Label id={labelId}>
        {label}
        {required ? " (obligatorio)" : null}
      </S.Label>
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={(next) => {
          if (disabled) return;
          setOpen(next);
          if (next) setQuery("");
        }}
      >
        <S.Trigger
          type="button"
          disabled={disabled}
          $invalid={Boolean(error)}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
        >
          <span id={valueId} style={{ minWidth: 0 }}>
            {selected ? (
              <S.TriggerText>
                <strong>{selected.fullName}</strong>
                <span>{selected.email}</span>
              </S.TriggerText>
            ) : value && fallbackLabel ? (
              <S.TriggerText>
                <strong>{fallbackLabel}</strong>
              </S.TriggerText>
            ) : (
              <S.Placeholder>Elegir coordinador</S.Placeholder>
            )}
          </span>
          <S.Chevron aria-hidden>
            <ChevronIcon />
          </S.Chevron>
        </S.Trigger>
        <PopoverPrimitive.Portal>
          <S.Panel
            align="start"
            side="bottom"
            sideOffset={8}
            collisionPadding={16}
            onKeyDown={moveFocus}
          >
            <SearchField
              label="Buscar coordinador"
              value={query}
              onChange={setQuery}
              onClear={() => setQuery("")}
              placeholder="Nombre o correo"
              isLoading={status === "loading"}
            />
            {status === "loading" && coordinators.length === 0 ? (
              <S.Hint role="status">Cargando coordinadores…</S.Hint>
            ) : status === "error" && coordinators.length === 0 ? (
              <S.Hint role="alert">
                No pudimos cargar los coordinadores.{" "}
                {onRetry ? (
                  <button type="button" onClick={onRetry}>
                    Reintentar
                  </button>
                ) : null}
              </S.Hint>
            ) : visible.length === 0 ? (
              <S.Hint role="status">
                {coordinators.length === 0
                  ? "Aún no hay usuarios con el rol Coordinador."
                  : "Ningún coordinador coincide con la búsqueda."}
              </S.Hint>
            ) : (
              <S.List role="listbox" aria-label="Coordinadores actuales">
                {visible.map((entry) => (
                  <li key={entry.id} role="presentation">
                    <S.Option
                      type="button"
                      role="option"
                      aria-selected={entry.id === value}
                      onClick={() => {
                        onValueChange(entry);
                        setOpen(false);
                      }}
                    >
                      <S.TriggerText>
                        <strong>{entry.fullName}</strong>
                        <span>{entry.email}</span>
                      </S.TriggerText>
                      {entry.id === value ? (
                        <S.Chevron aria-hidden>
                          <CheckIcon />
                        </S.Chevron>
                      ) : null}
                    </S.Option>
                  </li>
                ))}
              </S.List>
            )}
          </S.Panel>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {error ? <S.ErrorText id={errorId}>{error}</S.ErrorText> : null}
    </S.Root>
  );
}
