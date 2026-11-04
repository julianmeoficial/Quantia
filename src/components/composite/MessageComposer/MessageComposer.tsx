"use client";

import { useRef, type FormEvent, type KeyboardEvent } from "react";

import { Button, TextArea } from "@/components/base";

import * as S from "./MessageComposer.styles";

export interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  maxLength: number;
  disabled?: boolean;
  error?: string;
  isSending?: boolean;
  /** Optional rate-limit / help copy under the field. */
  helpText?: string;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  maxLength,
  disabled = false,
  error,
  isSending = false,
  helpText,
}: MessageComposerProps) {
  const composing = useRef(false);
  const trimmed = value.trim();
  const canSend = !disabled && !isSending && trimmed.length > 0 && value.length <= maxLength;

  function submit() {
    if (!canSend) return;
    onSend();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    if (composing.current || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submit();
  }

  return (
    <S.Root onSubmit={handleSubmit} aria-busy={isSending || undefined}>
      <TextArea
        label="Mensaje"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        maxLength={maxLength}
        rows={3}
        disabled={disabled || isSending}
        error={error}
        description={helpText}
        placeholder="Escribe un mensaje para el semillero"
      />
      <S.Actions>
        <S.Hint>Enter envía · Shift+Enter salto de línea</S.Hint>
        <Button type="submit" intent="primary" size="md" isLoading={isSending} disabled={!canSend}>
          Enviar
        </Button>
      </S.Actions>
    </S.Root>
  );
}
