"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    intent = "primary",
    size = "md",
    isLoading = false,
    leadingIcon,
    disabled,
    type = "button",
    children,
    onClick,
    ...rest
  },
  ref,
) {
  return (
    <S.Root
      ref={ref}
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
});
