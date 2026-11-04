"use client";

import {
  RealtimeEvent,
  presupuestoEjecucionBajaPayloadSchema,
  type PresupuestoEjecucionBajaPayload,
} from "@quantia/contracts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth/AuthProvider";

import { disconnectAllSockets, getSocket } from "./connection";

type BudgetLowListener = (payload: PresupuestoEjecucionBajaPayload) => void;

type SocketContextValue = {
  notificationsConnected: boolean;
  subscribeBudgetLow: (listener: BudgetLowListener) => () => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [socketLive, setSocketLive] = useState(false);
  const budgetLowListeners = useRef(new Set<BudgetLowListener>());

  const authenticated = authStatus === "authenticated";
  const notificationsConnected = authenticated && socketLive;

  if (!authenticated && socketLive) {
    setSocketLive(false);
  }

  const subscribeBudgetLow = useCallback((listener: BudgetLowListener) => {
    budgetLowListeners.current.add(listener);
    return () => {
      budgetLowListeners.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    if (!authenticated) {
      disconnectAllSockets();
      return;
    }

    const socket = getSocket("/notifications");

    const onConnect = () => setSocketLive(true);
    const onDisconnect = () => setSocketLive(false);
    const onBudgetLow = (raw: unknown) => {
      const parsed = presupuestoEjecucionBajaPayloadSchema.safeParse(raw);
      if (!parsed.success) return;
      for (const listener of budgetLowListeners.current) {
        listener(parsed.data);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, onBudgetLow);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, onBudgetLow);
      socket.disconnect();
    };
  }, [authenticated]);

  const value = useMemo(
    () => ({ notificationsConnected, subscribeBudgetLow }),
    [notificationsConnected, subscribeBudgetLow],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    return {
      notificationsConnected: false,
      subscribeBudgetLow: () => () => undefined,
    };
  }
  return ctx;
}

export function useBudgetLowExecutionAlerts(
  onEvent: (payload: PresupuestoEjecucionBajaPayload) => void,
): void {
  const { subscribeBudgetLow } = useSocketContext();

  useEffect(() => {
    return subscribeBudgetLow(onEvent);
  }, [onEvent, subscribeBudgetLow]);
}
