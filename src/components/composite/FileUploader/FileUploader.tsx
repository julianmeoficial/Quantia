"use client";

import { useId, useRef, useState } from "react";
import styled from "styled-components";

import { Button, IconButton } from "@/components/base";
import { FolderIcon, UploadIcon, XIcon } from "@/components/base/icons";
import { focusRing } from "@/components/base/shared/focus";
import { ProgressBar } from "@/components/composite/ProgressBar";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[16]};
`;

const Drop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[24]};
  border: ${({ theme }) => theme.borderWidths.thick} dashed
    ${({ theme }) => theme.colors.border.control};
  border-radius: ${({ theme }) => theme.radii.card};
  background: ${({ theme }) => theme.colors.bg.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  ${focusRing}
`;

const HiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const Hint = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[12]};
  margin: 0;
  padding: 0;
  list-style: none;
`;

const Row = styled.li`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  padding: ${({ theme }) => theme.space[16]};
  border: ${({ theme }) => theme.borderWidths.thin} solid
    ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radii.control};
  background: ${({ theme }) => theme.colors.bg.surface};
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.space[12]};
`;

const Name = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.space[8]};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

const ErrorText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

export interface UploadItem {
  id: string;
  name: string;
  sizeBytes: number;
  progress?: number;
  error?: string;
  status: "uploading" | "done" | "error";
}

export interface FileUploaderProps {
  label: string;
  accept?: string;
  maxBytes?: number;
  files: UploadItem[];
  onSelect: (files: File[]) => void;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(kb)} KB`;
  }
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(kb / 1024)} MB`;
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept) return true;
  const tokens = accept
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

export function FileUploader({
  label,
  accept,
  maxBytes,
  files,
  onSelect,
  onRetry,
  onCancel,
  disabled = false,
}: FileUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rejected, setRejected] = useState<Array<{ id: string; name: string; message: string }>>(
    [],
  );

  function take(list: FileList | null) {
    if (!list) return;
    const accepted: File[] = [];
    const nextRejected: Array<{ id: string; name: string; message: string }> = [];
    for (const file of Array.from(list)) {
      if (maxBytes !== undefined && file.size > maxBytes) {
        nextRejected.push({
          id: `${file.name}-${file.size}`,
          name: file.name,
          message: `${file.name} supera el tamaño máximo permitido.`,
        });
        continue;
      }
      if (!matchesAccept(file, accept)) {
        nextRejected.push({
          id: `${file.name}-type`,
          name: file.name,
          message: `${file.name} no tiene un formato permitido.`,
        });
        continue;
      }
      accepted.push(file);
    }
    setRejected(nextRejected);
    if (accepted.length > 0) onSelect(accepted);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Root>
      <Drop
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!disabled) take(event.dataTransfer.files);
        }}
      >
        <Name as="label" htmlFor={inputId}>
          <UploadIcon aria-hidden />
          {label}
        </Name>
        <Hint id={`${inputId}-hint`}>
          Elige un archivo o suéltalo aquí. El teclado abre el mismo selector.
        </Hint>
        <HiddenInput
          id={inputId}
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          aria-describedby={`${inputId}-hint`}
          onChange={(event) => take(event.target.files)}
        />
      </Drop>
      <List>
        {files.map((file) => (
          <Row key={file.id}>
            <Meta>
              <Name>
                <FolderIcon aria-hidden />
                {file.name}
                <Hint as="span">{formatBytes(file.sizeBytes)}</Hint>
              </Name>
              <span>
                {file.status === "error" && onRetry ? (
                  <Button intent="secondary" type="button" onClick={() => onRetry(file.id)}>
                    Reintentar
                  </Button>
                ) : null}
                {onCancel ? (
                  <IconButton
                    accessibleLabel={`Cancelar ${file.name}`}
                    icon={<XIcon />}
                    onClick={() => onCancel(file.id)}
                  />
                ) : null}
              </span>
            </Meta>
            {file.status === "uploading" ? (
              <ProgressBar
                label={`Carga de ${file.name}`}
                value={file.progress}
                indeterminate={file.progress === undefined}
              />
            ) : null}
            {file.error ? <ErrorText>{file.error}</ErrorText> : null}
          </Row>
        ))}
        {rejected.map((item) => (
          <Row key={item.id}>
            <Name>{item.name}</Name>
            <ErrorText role="alert">{item.message}</ErrorText>
          </Row>
        ))}
      </List>
    </Root>
  );
}
