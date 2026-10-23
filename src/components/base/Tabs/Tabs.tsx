"use client";

import type { ReactNode } from "react";

import * as S from "./Tabs.styles";

export type TabItem = {
  value: string;
  label: string;
  disabled?: boolean;
  content: ReactNode;
};

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  /** Accessible name for the tab list. */
  label: string;
}

export function Tabs({ items, value, onValueChange, label }: TabsProps) {
  return (
    <S.Root value={value} onValueChange={onValueChange}>
      <S.List aria-label={label}>
        {items.map((item) => (
          <S.Trigger key={item.value} value={item.value} disabled={item.disabled}>
            {item.label}
          </S.Trigger>
        ))}
      </S.List>
      {items.map((item) => (
        <S.Content key={item.value} value={item.value} tabIndex={0}>
          {item.content}
        </S.Content>
      ))}
    </S.Root>
  );
}
