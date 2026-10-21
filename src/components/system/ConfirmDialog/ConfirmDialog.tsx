"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { Button } from "@/components/base";

import * as S from "./ConfirmDialog.styles";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  intent?: "primary" | "danger";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  onConfirm,
  intent = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (isLoading) return;
        onOpenChange(next);
      }}
    >
      <AlertDialogPrimitive.Portal>
        <S.Overlay />
        <S.Content
          onEscapeKeyDown={(event) => {
            if (isLoading) event.preventDefault();
          }}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const root = event.currentTarget as HTMLElement | null;
            root?.querySelector<HTMLElement>("[data-confirm-cancel]")?.focus();
          }}
        >
          <S.Title>{title}</S.Title>
          <S.Description>{description}</S.Description>
          <S.Actions>
            <AlertDialogPrimitive.Cancel asChild>
              <Button intent="secondary" data-confirm-cancel disabled={isLoading}>
                {cancelLabel}
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button
                intent={intent}
                isLoading={isLoading}
                onClick={(event) => {
                  event.preventDefault();
                  onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </AlertDialogPrimitive.Action>
          </S.Actions>
        </S.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
