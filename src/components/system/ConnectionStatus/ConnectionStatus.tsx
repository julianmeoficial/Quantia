"use client";

import { Button } from "@/components/base";
import { AlertIcon, SpinnerIcon } from "@/components/base/icons";

import * as S from "./ConnectionStatus.styles";

export type ConnectionState = "connected" | "reconnecting" | "disconnected";

export interface ConnectionStatusProps {
  state: ConnectionState;
  onReconnect?: () => void;
  lastUpdatedAt?: string;
}

export function ConnectionStatus({ state, onReconnect, lastUpdatedAt }: ConnectionStatusProps) {
  if (state === "connected") {
    return null;
  }

  const reconnecting = state === "reconnecting";

  return (
    <S.Banner role="status" aria-live="polite" data-state={state}>
      <S.IconSlot aria-hidden>{reconnecting ? <SpinnerIcon /> : <AlertIcon />}</S.IconSlot>
      <S.Label>
        {reconnecting ? "Reconectando…" : "Datos posiblemente desactualizados"}
        {lastUpdatedAt && !reconnecting ? ` · Última actualización ${lastUpdatedAt}` : null}
      </S.Label>
      {!reconnecting && onReconnect ? (
        <Button intent="secondary" size="md" onClick={onReconnect}>
          Reconectar
        </Button>
      ) : null}
    </S.Banner>
  );
}
