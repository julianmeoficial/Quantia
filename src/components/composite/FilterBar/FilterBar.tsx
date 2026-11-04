"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/base";
import { XIcon } from "@/components/base/icons";
import { SearchField } from "@/components/composite/SearchField";

import * as S from "./FilterBar.styles";

export interface FilterChip {
  id: string;
  label: string;
}

export interface FilterBarProps {
  label?: string;
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  chips?: FilterChip[];
  onRemoveChip?: (id: string) => void;
  onClear?: () => void;
  resultCount?: number;
  isLoading?: boolean;
  /** When true, search and clear stay non-interactive (shell for blocked filters). */
  disabled?: boolean;
  children?: ReactNode;
}

export function FilterBar({
  label = "Filtros",
  searchLabel,
  searchValue,
  onSearchChange,
  chips = [],
  onRemoveChip,
  onClear,
  resultCount,
  isLoading = false,
  disabled = false,
  children,
}: FilterBarProps) {
  return (
    <S.Group
      role="group"
      aria-label={label}
      aria-busy={isLoading || undefined}
      aria-disabled={disabled || undefined}
    >
      <S.Controls>
        <S.SearchSlot>
          <SearchField
            label={searchLabel}
            value={searchValue}
            onChange={onSearchChange}
            disabled={disabled}
            isLoading={isLoading}
          />
        </S.SearchSlot>
        {children}
        {onClear && !disabled ? (
          <Button intent="ghost" type="button" onClick={onClear}>
            Limpiar filtros
          </Button>
        ) : null}
      </S.Controls>
      {chips.length > 0 ? (
        <S.Chips>
          {chips.map((chip) => (
            <li key={chip.id}>
              <S.Chip
                type="button"
                aria-label={`Quitar filtro ${chip.label}`}
                onClick={() => onRemoveChip?.(chip.id)}
              >
                {chip.label}
                <XIcon aria-hidden />
              </S.Chip>
            </li>
          ))}
        </S.Chips>
      ) : null}
      <S.Status aria-live="polite">
        {isLoading
          ? "Actualizando resultados…"
          : resultCount === undefined
            ? null
            : `${resultCount} resultados`}
      </S.Status>
    </S.Group>
  );
}
