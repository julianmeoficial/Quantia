"use client";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { SpinnerIcon } from "@/components/base/icons";
import type { ControlSize, IconButtonIntent } from "@/components/base/shared/types";

import * as S from "./IconButton.styles";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name — required; Tooltip never replaces this. */
  accessibleLabel: string;
  icon: ReactNode;
  intent?: IconButtonIntent;
  size?: ControlSize;
  isLoading?: boolean;
  /** React 19 ref-as-prop (e.g. to restore focus after closing a popover). */
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  accessibleLabel,
  icon,
  intent = "ghost",
  size = "md",
  isLoading = false,
  disabled,
  type = "button",
  onClick,
  ...rest
}: IconButtonProps) {
  return (
    <S.Root
      type={type}
      $intent={intent}
      $size={size}
      $isLoading={isLoading}
      disabled={disabled}
      aria-label={accessibleLabel}
      aria-busy={isLoading || undefined}
      onClick={(event) => {
        if (isLoading || disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      <S.Glyph $hidden={isLoading} aria-hidden>
        {icon}
      </S.Glyph>
      {isLoading ? (
        <S.SpinnerSlot>
          <SpinnerIcon />
        </S.SpinnerSlot>
      ) : null}
    </S.Root>
  );
}
