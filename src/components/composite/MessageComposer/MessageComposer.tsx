"use client";

import { AnimatePresence, useAnimate } from "motion/react";
import { useRef, type FormEvent, type KeyboardEvent, type Ref } from "react";

import { Button, IconButton, TextArea } from "@/components/base";
import { EditIcon, ReplyIcon, SendIcon, XIcon } from "@/components/base/icons";
import { transitions } from "@/lib/motion";

import * as S from "./MessageComposer.styles";

export type MessageComposerMode = "compose" | "edit";

export interface MessageComposerContext {
  /** «Respondiendo a Ana» / «Editando mensaje». */
  title: string;
  excerpt: string;
}

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
  /** `edit` swaps the primary action to «Guardar cambios». */
  mode?: MessageComposerMode;
  /** Reply/edit context strip above the field. */
  context?: MessageComposerContext | null;
  onCancelContext?: () => void;
  /** ArrowUp on an empty composer (Telegram-style «editar el último»). */
  onEditLast?: () => void;
  onBlur?: () => void;
  textareaRef?: Ref<HTMLTextAreaElement>;
}

const MAX_ROWS = 6;

export function MessageComposer({
  value,
  onChange,
  onSend,
  maxLength,
  disabled = false,
  error,
  isSending = false,
  helpText,
  mode = "compose",
  context = null,
  onCancelContext,
  onEditLast,
  onBlur,
  textareaRef,
}: MessageComposerProps) {
  const composing = useRef(false);
  const [sendScope, animateSend] = useAnimate<HTMLSpanElement>();
  const trimmed = value.trim();
  const tooLong = value.length > maxLength;
  const canSend = !disabled && !isSending && trimmed.length > 0 && !tooLong;
  const rows = Math.min(MAX_ROWS, Math.max(2, value.split("\n").length));
  const nearLimit = value.length >= maxLength * 0.8;
  const editing = mode === "edit";

  function submit() {
    if (!canSend) return;
    if (sendScope.current) {
      void animateSend(
        sendScope.current,
        { x: [0, 14, -10, 0], opacity: [1, 0, 0, 1] },
        { duration: 0.35, times: [0, 0.45, 0.46, 1], ease: "easeOut" },
      );
    }
    onSend();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (composing.current || event.nativeEvent.isComposing) return;
    if (event.key === "Escape" && context && onCancelContext) {
      event.preventDefault();
      onCancelContext();
      return;
    }
    if (event.key === "ArrowUp" && !value && onEditLast) {
      event.preventDefault();
      onEditLast();
      return;
    }
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    submit();
  }

  return (
    <S.Root onSubmit={handleSubmit} aria-busy={isSending || undefined} $editing={editing}>
      <AnimatePresence initial={false}>
        {context ? (
          <S.Context
            key={`${mode}-${context.title}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={transitions.base}
          >
            <S.ContextIcon aria-hidden>{editing ? <EditIcon /> : <ReplyIcon />}</S.ContextIcon>
            <S.ContextText>
              <S.ContextTitle>{context.title}</S.ContextTitle>
              <S.ContextExcerpt>{context.excerpt}</S.ContextExcerpt>
            </S.ContextText>
            {onCancelContext ? (
              <IconButton
                accessibleLabel={editing ? "Cancelar edición" : "Cancelar respuesta"}
                icon={<XIcon />}
                onClick={onCancelContext}
              />
            ) : null}
          </S.Context>
        ) : null}
      </AnimatePresence>

      <TextArea
        ref={textareaRef}
        label={editing ? "Editar mensaje" : "Mensaje"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onCompositionStart={() => {
          composing.current = true;
        }}
        onCompositionEnd={() => {
          composing.current = false;
        }}
        maxLength={maxLength}
        showCounter={false}
        rows={rows}
        disabled={disabled}
        error={error}
        description={helpText}
        placeholder="Escribe un mensaje para el semillero"
      />
      <S.Actions>
        <S.Hint>
          Enter envía · Shift+Enter salto de línea
          {onEditLast && !editing ? " · ↑ edita tu último mensaje" : ""}
        </S.Hint>
        <S.ActionGroup>
          <AnimatePresence initial={false}>
            {nearLimit ? (
              <S.Counter
                key="counter"
                $over={tooLong}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={transitions.fast}
              >
                {value.length}/{maxLength}
              </S.Counter>
            ) : null}
          </AnimatePresence>
          {editing && onCancelContext ? (
            <Button type="button" intent="ghost" size="md" onClick={onCancelContext}>
              Cancelar
            </Button>
          ) : null}
          <Button
            type="submit"
            intent="primary"
            size="md"
            isLoading={isSending}
            disabled={!canSend}
            leadingIcon={
              <S.SendGlyph ref={sendScope}>{editing ? <EditIcon /> : <SendIcon />}</S.SendGlyph>
            }
          >
            {editing ? "Guardar cambios" : "Enviar"}
          </Button>
        </S.ActionGroup>
      </S.Actions>
    </S.Root>
  );
}
