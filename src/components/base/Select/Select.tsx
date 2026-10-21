"use client";

import { Select as SelectPrimitive } from "radix-ui";
import { useId } from "react";

import { CheckIcon, SpinnerIcon } from "@/components/base/icons";
import type { ControlSize } from "@/components/base/shared/types";

import * as S from "./Select.styles";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  description?: string;
  size?: ControlSize;
  isLoading?: boolean;
  name?: string;
  required?: boolean;
  id?: string;
}

export function Select({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Selecciona una opción",
  disabled,
  error,
  description,
  size = "md",
  isLoading = false,
  name,
  required,
  id,
}: SelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <S.Field>
      <S.Label htmlFor={fieldId}>
        {label}
        {required ? " (obligatorio)" : null}
      </S.Label>
      <SelectPrimitive.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled || isLoading}
        name={name}
        required={required}
      >
        <S.Trigger
          id={fieldId}
          $size={size}
          $invalid={Boolean(error)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-busy={isLoading || undefined}
        >
          <S.Value placeholder={placeholder} />
          <S.Icon>{isLoading ? <SpinnerIcon /> : <ChevronDown />}</S.Icon>
        </S.Trigger>
        <SelectPrimitive.Portal>
          <S.Content position="popper" sideOffset={4}>
            <S.Viewport>
              {options.map((option) => (
                <S.Item key={option.value} value={option.value} disabled={option.disabled}>
                  <S.ItemIndicator>
                    <CheckIcon />
                  </S.ItemIndicator>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </S.Item>
              ))}
            </S.Viewport>
          </S.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {description ? <S.Hint id={descriptionId}>{description}</S.Hint> : null}
      {error ? <S.ErrorText id={errorId}>{error}</S.ErrorText> : null}
    </S.Field>
  );
}

function ChevronDown() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M4 6.5 8 10.5 12 6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
