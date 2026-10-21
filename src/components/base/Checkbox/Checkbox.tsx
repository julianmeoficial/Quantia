"use client";

import { CheckIcon, MinusIcon } from "@/components/base/icons";

import * as S from "./Checkbox.styles";

export type CheckboxChecked = boolean | "indeterminate";

export interface CheckboxProps {
  label: string;
  checked?: CheckboxChecked;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: CheckboxChecked) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  description?: string;
}

export function Checkbox({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  required,
  name,
  id,
  description,
}: CheckboxProps) {
  return (
    <S.Root data-disabled={disabled ? "true" : undefined}>
      <S.Control
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(value) => {
          if (value === "indeterminate") {
            onCheckedChange?.("indeterminate");
            return;
          }
          onCheckedChange?.(value);
        }}
        disabled={disabled}
        required={required}
        name={name}
      >
        <S.Indicator>{checked === "indeterminate" ? <MinusIcon /> : <CheckIcon />}</S.Indicator>
      </S.Control>
      <S.Text>
        {label}
        {required ? " (obligatorio)" : null}
        {description ? <S.Help>{description}</S.Help> : null}
      </S.Text>
    </S.Root>
  );
}
