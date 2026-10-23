"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

import * as S from "./TextField.styles";
import type { ControlSize } from "@/components/base/shared/types";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  size?: ControlSize;
  description?: string;
  error?: string;
  /** Control alineado al input (p. ej. mostrar contraseña). */
  trailing?: ReactNode;
  /** Texto del obligatorio. Por defecto « (obligatorio)». */
  requiredSuffix?: string;
}

export function TextField({
  id,
  label,
  size = "md",
  description,
  error,
  trailing,
  requiredSuffix = " (obligatorio)",
  required,
  disabled,
  readOnly,
  ...rest
}: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <S.Field>
      <S.Label htmlFor={fieldId}>
        {label}
        {required ? <S.Required>{requiredSuffix}</S.Required> : null}
      </S.Label>
      {trailing ? (
        <S.ControlRow>
          <S.Input
            id={fieldId}
            $size={size}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...rest}
          />
          {trailing}
        </S.ControlRow>
      ) : (
        <S.Input
          id={fieldId}
          $size={size}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      )}
      {description ? <S.Hint id={descriptionId}>{description}</S.Hint> : null}
      {error ? <S.ErrorText id={errorId}>{error}</S.ErrorText> : null}
    </S.Field>
  );
}
