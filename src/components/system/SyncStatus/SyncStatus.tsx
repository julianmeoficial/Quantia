"use client";

import { Button, Tooltip } from "@/components/base";
import { AlertIcon, CheckCircleIcon, SpinnerIcon } from "@/components/base/icons";
import { formatDate } from "@/lib/format";

import * as S from "./SyncStatus.styles";

export type SyncStatusValue = "pending" | "synced" | "failed";

export type SyncStatusEntity = "project" | "task" | "progress";

export interface SyncStatusProps {
  status: SyncStatusValue;
  /** True only after Postgres confirmed the save. */
  persisted: boolean;
  canRetry?: boolean;
  onRetry?: () => void;
  isLoading?: boolean;
  /** Drives failed-state copy; defaults to progress for backwards compatibility. */
  entity?: SyncStatusEntity;
  /** ISO timestamp for the tooltip when the last sync time is known. */
  lastSyncedAt?: string;
}

function failedLabel(entity: SyncStatusEntity): string {
  if (entity === "project") {
    return "El proyecto está guardado, pero no se pudo sincronizar con Notion";
  }
  if (entity === "task") {
    return "La tarea está guardada, pero no se pudo sincronizar con Notion";
  }
  return "El avance está guardado, pero no se pudo sincronizar con Notion";
}

function tooltipFor(status: SyncStatusValue, lastSyncedAt: string | undefined): string {
  if (lastSyncedAt) {
    return `Última sincronización: ${formatDate(lastSyncedAt, { withTime: true })}`;
  }
  if (status === "pending") {
    return "Guardado en Quantia; pendiente de Notion";
  }
  if (status === "failed") {
    return "Guardado en Quantia; la sincronización con Notion falló";
  }
  return "Sincronizado con Notion";
}

export function SyncStatus({
  status,
  persisted,
  canRetry = false,
  onRetry,
  isLoading = false,
  entity = "progress",
  lastSyncedAt,
}: SyncStatusProps) {
  const tip = tooltipFor(status, lastSyncedAt);

  if (status === "synced") {
    return (
      <S.Root aria-live="polite" data-status="synced">
        <Tooltip content={tip}>
          <S.IconSlot type="button" data-tone="success" aria-label={tip}>
            <CheckCircleIcon />
          </S.IconSlot>
        </Tooltip>
        <S.Label>Sincronizado con Notion</S.Label>
      </S.Root>
    );
  }

  if (status === "pending") {
    if (!persisted) return null;
    return (
      <S.Root aria-live="polite" data-status="pending">
        <Tooltip content={tip}>
          <S.IconSlot type="button" data-tone="info" aria-label={tip}>
            <SpinnerIcon />
          </S.IconSlot>
        </Tooltip>
        <S.Label>Guardado. Sincronizando con Notion</S.Label>
      </S.Root>
    );
  }

  return (
    <S.Root role="status" aria-live="polite" data-status="failed">
      <Tooltip content={tip}>
        <S.IconSlot type="button" data-tone="danger" aria-label={tip}>
          <AlertIcon />
        </S.IconSlot>
      </Tooltip>
      <S.Label>{failedLabel(entity)}</S.Label>
      {canRetry && onRetry ? (
        <Button intent="ghost" size="md" onClick={onRetry} isLoading={isLoading}>
          Reintentar
        </Button>
      ) : null}
    </S.Root>
  );
}
