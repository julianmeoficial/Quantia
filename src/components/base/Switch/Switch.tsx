"use client";

import * as S from "./Switch.styles";

export interface SwitchProps {
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
}

export function Switch({
  label,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  id,
}: SwitchProps) {
  return (
    <S.Root data-disabled={disabled ? "true" : undefined}>
      <S.Control
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        name={name}
      >
        <S.Thumb />
      </S.Control>
      <span>{label}</span>
    </S.Root>
  );
}
