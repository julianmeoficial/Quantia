"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { SpinnerIcon } from "@/components/base/icons";
import type { ButtonIntent, ControlSize } from "@/components/base/shared/types";

import * as S from "./Button.styles";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: ButtonIntent;
  size?: ControlSize;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  children: ReactNode;
}

export function Button({
  intent = "primary",
  size = "md",
  isLoading = false,
  leadingIcon,
  disabled,
  type = "button",
  children,
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <S.Root
      type={type}
      $intent={intent}
      $size={size}
      $isLoading={isLoading}
      disabled={disabled}
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
      <S.Label $hidden={isLoading}>
        {leadingIcon ? <S.LeadingIcon aria-hidden>{leadingIcon}</S.LeadingIcon> : null}
        {children}
      </S.Label>
      {isLoading ? (
        <S.SpinnerSlot>
          <SpinnerIcon />
        </S.SpinnerSlot>
      ) : null}
    </S.Root>
  );
}
