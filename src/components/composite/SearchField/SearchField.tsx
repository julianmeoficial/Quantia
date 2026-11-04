"use client";

import { useId } from "react";

import { IconButton, TextField } from "@/components/base";
import { SearchIcon, XIcon } from "@/components/base/icons";
import type { ControlSize } from "@/components/base/shared/types";

import styled from "styled-components";

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.space[8]};
  width: 100%;
`;

const Field = styled.div`
  flex: 1;
  min-width: 0;
`;

const SearchGlyph = styled.span`
  display: inline-flex;
  align-self: center;
  margin-bottom: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export interface SearchFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  size?: ControlSize;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SearchField({
  label,
  value,
  onChange,
  onClear,
  placeholder,
  size = "md",
  isLoading = false,
  disabled = false,
}: SearchFieldProps) {
  const id = useId();
  const isDisabled = disabled || isLoading;

  return (
    <Row>
      <SearchGlyph aria-hidden>
        <SearchIcon />
      </SearchGlyph>
      <Field>
        <TextField
          id={id}
          label={label}
          type="search"
          size={size}
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          onChange={(event) => onChange(event.target.value)}
        />
      </Field>
      {value && !isDisabled ? (
        <IconButton
          accessibleLabel={`Limpiar ${label.toLowerCase()}`}
          icon={<XIcon />}
          intent="ghost"
          size={size}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            onChange("");
            onClear?.();
            document.getElementById(id)?.focus();
          }}
        />
      ) : null}
    </Row>
  );
}
