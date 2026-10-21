"use client";

import { Button } from "@/components/base";
import { AlertIcon, CheckCircleIcon, SpinnerIcon } from "@/components/base/icons";

import * as S from "./SyncStatus.styles";

export type SyncStatusValue = "pending" | "synced" | "failed";

export interface SyncStatusProps {
  status: SyncStatusValue;
  /** True only after Postgres confirmed the save. */
  persisted: boolean;
  canRetry?: boolean;
  onRetry?: () => void;
  isLoading?: boolean;
}

export function SyncStatus({
  status,
  persisted,
  canRetry = false,
  onRetry,
  isLoading = false,
}: SyncStatusProps) {
  if (status === "synced") {
    return (
      <S.Root aria-live="polite" data-status="synced">
        <S.IconSlot data-tone="success" aria-hidden>
          <CheckCircleIcon />
        </S.IconSlot>
        <S.Label>Sincronizado con Notion</S.Label>
      </S.Root>
    );
  }

  if (status === "pending") {
    if (!persisted) return null;
    return (
      <S.Root aria-live="polite" data-status="pending">
        <S.IconSlot data-tone="info" aria-hidden>
          <SpinnerIcon />
        </S.IconSlot>
        <S.Label>Guardado. Sincronizando con Notion</S.Label>
      </S.Root>
    );
  }

  return (
    <S.Root role="status" aria-live="polite" data-status="failed">
      <S.IconSlot data-tone="danger" aria-hidden>
        <AlertIcon />
      </S.IconSlot>
      <S.Label>El avance está guardado, pero no se pudo sincronizar con Notion</S.Label>
      {canRetry && onRetry ? (
        <Button intent="ghost" size="md" onClick={onRetry} isLoading={isLoading}>
          Reintentar
        </Button>
      ) : null}
    </S.Root>
  );
}
