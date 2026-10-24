"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useState } from "react";

import { Button, IconButton } from "@/components/base";
import { AlertIcon, XIcon } from "@/components/base/icons";

import * as S from "./ErrorState.styles";

const SESSION_FOOTNOTE =
  "No se vuelve a enviar una acción automáticamente al reautenticar. Debes revisar permisos e intención.";

export type ErrorStateVariant = "forbidden" | "rate-limit" | "session" | "server" | "not-found";

export interface ErrorStateProps {
  variant: ErrorStateVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  isLoading?: boolean;
  /** Only for rate-limit — never invent a countdown if omitted. */
  retryAfterSeconds?: number;
  /** Session dialog primary action. */
  onSessionAction?: () => void;
  sessionActionLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const DEFAULTS: Record<
  ErrorStateVariant,
  { title: string; description: string; retryLabel: string }
> = {
  forbidden: {
    title: "No tienes permiso para ver esta sección",
    description: "Si crees que deberías tener acceso, pide ayuda a quien coordina tu proyecto.",
    retryLabel: "Volver",
  },
  "rate-limit": {
    title: "Estamos procesando demasiadas solicitudes",
    description: "Espera un momento antes de volver a intentarlo.",
    retryLabel: "Reintentar",
  },
  session: {
    title: "Tu sesión expiró",
    description:
      "Inicia sesión de nuevo para continuar. El borrador permitido se conserva en el contexto de la aplicación.",
    retryLabel: "Iniciar sesión",
  },
  server: {
    title: "No pudimos completar la solicitud",
    description: "Inténtalo de nuevo. Si el problema continúa, vuelve más tarde.",
    retryLabel: "Reintentar",
  },
  "not-found": {
    title: "No encontrado",
    description: "No hay nada que mostrar en esta dirección.",
    retryLabel: "Volver",
  },
};

export function ErrorState({
  variant,
  title,
  description,
  onRetry,
  retryLabel,
  isLoading = false,
  retryAfterSeconds,
  onSessionAction,
  sessionActionLabel,
  open = true,
  onOpenChange,
}: ErrorStateProps) {
  const defaults = DEFAULTS[variant];
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;
  const resolvedRetry = retryLabel ?? defaults.retryLabel;

  if (variant === "session") {
    return (
      <SessionDialog
        open={open}
        onOpenChange={onOpenChange}
        title={resolvedTitle}
        description={resolvedDescription}
        actionLabel={sessionActionLabel ?? resolvedRetry}
        onSessionAction={onSessionAction}
        isLoading={isLoading}
      />
    );
  }

  return (
    <S.Panel
      role="alert"
      data-variant={variant}
      aria-live={variant === "rate-limit" ? "polite" : "assertive"}
    >
      <S.IconSlot aria-hidden>{variant === "forbidden" ? <XIcon /> : <AlertIcon />}</S.IconSlot>
      <S.Title>{resolvedTitle}</S.Title>
      <S.Description>{resolvedDescription}</S.Description>
      {variant === "rate-limit" ? (
        <RateLimitActions
          key={retryAfterSeconds ?? "none"}
          retryAfterSeconds={retryAfterSeconds}
          retryLabel={resolvedRetry}
          onRetry={onRetry}
          isLoading={isLoading}
        />
      ) : onRetry ? (
        <S.Actions>
          <Button intent="primary" onClick={onRetry} isLoading={isLoading}>
            {resolvedRetry}
          </Button>
        </S.Actions>
      ) : null}
    </S.Panel>
  );
}

function SessionDialog({
  open,
  onOpenChange,
  title,
  description,
  actionLabel,
  onSessionAction,
  isLoading,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description: string;
  actionLabel: string;
  onSessionAction?: () => void;
  isLoading: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <S.Overlay />
        <S.DialogContent
          onPointerDownOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const root = event.currentTarget as HTMLElement | null;
            root?.querySelector<HTMLElement>("[data-session-action]")?.focus();
          }}
        >
          <S.DialogHeader>
            <S.DialogTitle>{title}</S.DialogTitle>
            <IconButton
              accessibleLabel="Cerrar e iniciar sesión"
              icon={<XIcon />}
              intent="ghost"
              onClick={onSessionAction}
              disabled={isLoading}
            />
          </S.DialogHeader>
          <S.DialogDivider />
          <S.DialogBody>
            <S.DialogDescription>{description}</S.DialogDescription>
            <S.DialogFootnote>{SESSION_FOOTNOTE}</S.DialogFootnote>
          </S.DialogBody>
          <S.DialogActions>
            <Button
              intent="primary"
              data-session-action
              onClick={onSessionAction}
              isLoading={isLoading}
            >
              {actionLabel}
            </Button>
          </S.DialogActions>
        </S.DialogContent>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function RateLimitActions({
  retryAfterSeconds,
  retryLabel,
  onRetry,
  isLoading,
}: {
  retryAfterSeconds?: number;
  retryLabel: string;
  onRetry?: () => void;
  isLoading: boolean;
}) {
  const [remaining, setRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    if (retryAfterSeconds === undefined || retryAfterSeconds <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((value) => {
        if (value === undefined || value <= 1) return 0;
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [retryAfterSeconds]);

  const waiting = remaining !== undefined && remaining > 0;

  return (
    <>
      {waiting ? (
        <S.Countdown aria-live="polite">Podrás reintentar en {remaining} s</S.Countdown>
      ) : null}
      {onRetry ? (
        <S.Actions>
          <Button intent="primary" onClick={onRetry} isLoading={isLoading} disabled={waiting}>
            {retryLabel}
          </Button>
        </S.Actions>
      ) : null}
    </>
  );
}
