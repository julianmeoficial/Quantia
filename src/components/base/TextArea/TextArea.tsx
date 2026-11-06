"use client";

import { useId, type Ref, type TextareaHTMLAttributes } from "react";

import * as S from "./TextArea.styles";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  description?: string;
  error?: string;
  /** Visible `n/max` counter (polite live region). Chat composers render their own. */
  showCounter?: boolean;
  /** Keep the label for assistive tech but hide it visually (e.g. a chat composer). */
  hideLabel?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({
  id,
  label,
  description,
  error,
  required,
  maxLength,
  value,
  rows = 4,
  showCounter = true,
  hideLabel = false,
  ...rest
}: TextAreaProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const length = typeof value === "string" ? value.length : undefined;

  return (
    <S.Field>
      <S.Label htmlFor={fieldId} $hidden={hideLabel}>
        {label}
        {required ? <S.Required> (obligatorio)</S.Required> : null}
      </S.Label>
      <S.Control
        id={fieldId}
        required={required}
        maxLength={maxLength}
        value={value}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {description ? <S.Hint id={descriptionId}>{description}</S.Hint> : null}
      {error ? <S.ErrorText id={errorId}>{error}</S.ErrorText> : null}
      {showCounter && maxLength !== undefined && length !== undefined ? (
        <S.Counter aria-live="polite">
          {length}/{maxLength}
        </S.Counter>
      ) : null}
    </S.Field>
  );
}
