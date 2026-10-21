"use client";

import { Toast as ToastPrimitive } from "radix-ui";
import type { ReactNode } from "react";

import { Button } from "@/components/base";
import { XIcon } from "@/components/base/icons";
import type { BadgeTone } from "@/components/base/shared/types";

import * as S from "./Toast.styles";

export interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
}

export function ToastProvider({ children, duration = 5000 }: ToastProviderProps) {
  return (
    <ToastPrimitive.Provider duration={duration} swipeDirection="right">
      {children}
      <S.Viewport />
    </ToastPrimitive.Provider>
  );
}

export interface ToastAction {
  label: string;
  onClick: () => void;
  altText: string;
}

export interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  tone?: BadgeTone;
  action?: ToastAction;
  duration?: number;
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  tone = "neutral",
  action,
  duration,
}: ToastProps) {
  return (
    <S.Root open={open} onOpenChange={onOpenChange} $tone={tone} duration={duration}>
      <S.Title>{title}</S.Title>
      {description ? <S.Description>{description}</S.Description> : null}
      {action ? (
        <S.Action asChild altText={action.altText} onClick={action.onClick}>
          <Button intent="secondary" size="md">
            {action.label}
          </Button>
        </S.Action>
      ) : null}
      <S.Close aria-label="Cerrar notificación">
        <XIcon />
      </S.Close>
    </S.Root>
  );
}
