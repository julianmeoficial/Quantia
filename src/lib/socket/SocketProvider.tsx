"use client";

import {
  RealtimeEvent,
  RealtimeNamespace,
  type PresupuestoEjecucionBajaPayload,
} from "@quantia/contracts";
import { useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { ConnectionState } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { queryKeys } from "@/lib/api/query-keys";
import { refreshAccessToken } from "@/lib/api/session";
import { canViewBudgetDetail } from "@/lib/auth";
import { formatPercent } from "@/lib/format";

import {
  clearNamespacePause,
  disconnectAllSockets,
  getSocket,
  isNamespacePaused,
  reconnectSocket,
  subscribeConnectionPause,
} from "./connection";
import { parseRealtimePayload } from "./events";
import {
  clearSessionNotices,
  getSessionNotices,
  getUnreadNoticeCount,
  markAllNoticesRead,
  noticeFromBudgetLow,
  pushSessionNotice,
  subscribeSessionNotices,
  type SessionNotice,
} from "./sessionNotices";

type BudgetLowListener = (payload: PresupuestoEjecucionBajaPayload) => void;

type SocketContextValue = {
  connection: ConnectionState;
  connectionPaused: boolean;
  notificationsConnected: boolean;
  reconnect: () => void;
  subscribeBudgetLow: (listener: BudgetLowListener) => () => void;
  notices: SessionNotice[];
  unreadCount: number;
  markNoticesRead: () => void;
};

const SocketContext = createContext<SocketContextValue | null>(null);

function useNoticesSnapshot() {
  return useSyncExternalStore(subscribeSessionNotices, getSessionNotices, getSessionNotices);
}

function useUnreadSnapshot() {
  return useSyncExternalStore(subscribeSessionNotices, getUnreadNoticeCount, () => 0);
}

function useNotificationsPaused() {
  return useSyncExternalStore(
    subscribeConnectionPause,
    () => isNamespacePaused(RealtimeNamespace.NOTIFICATIONS),
    () => false,
  );
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const [socketLive, setSocketLive] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const budgetLowListeners = useRef(new Set<BudgetLowListener>());
  const authRetryUsed = useRef(false);

  const authenticated = authStatus === "authenticated";
  const notices = useNoticesSnapshot();
  const unreadCount = useUnreadSnapshot();
  const paused = useNotificationsPaused();

  if (!authenticated && (socketLive || reconnecting)) {
    setSocketLive(false);
    setReconnecting(false);
  }

  const subscribeBudgetLow = useCallback((listener: BudgetLowListener) => {
    budgetLowListeners.current.add(listener);
    return () => {
      budgetLowListeners.current.delete(listener);
    };
  }, []);

  const reconnect = useCallback(() => {
    if (!authenticated) return;
    clearNamespacePause(RealtimeNamespace.NOTIFICATIONS);
    setReconnecting(true);
    reconnectSocket(RealtimeNamespace.NOTIFICATIONS);
  }, [authenticated]);

  const markNoticesRead = useCallback(() => {
    markAllNoticesRead();
  }, []);

  useEffect(() => {
    if (!authenticated) {
      disconnectAllSockets();
      clearSessionNotices();
      authRetryUsed.current = false;
      return;
    }

    const socket = getSocket(RealtimeNamespace.NOTIFICATIONS);

    const onConnect = () => {
      setSocketLive(true);
      setReconnecting(false);
      authRetryUsed.current = false;
    };

    const onDisconnect = () => {
      setSocketLive(false);
    };

    const onReconnectAttempt = () => {
      setReconnecting(true);
    };

    const onConnectError = () => {
      if (authRetryUsed.current) return;
      authRetryUsed.current = true;
      void refreshAccessToken().then((token) => {
        if (!token) return;
        reconnectSocket(RealtimeNamespace.NOTIFICATIONS);
      });
    };

    const onBudgetLow = (raw: unknown) => {
      const payload = parseRealtimePayload(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, raw);
      if (!payload) return;

      if (user && canViewBudgetDetail(user)) {
        pushSessionNotice(
          noticeFromBudgetLow(payload, `/proyectos/${payload.projectId}?tab=presupuesto`),
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.budget(payload.projectId) });
        void queryClient.invalidateQueries({ queryKey: ["group-dashboard"] });
        void queryClient.invalidateQueries({ queryKey: ["institutional-overview"] });
      }

      for (const listener of budgetLowListeners.current) {
        listener(payload);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.on("connect_error", onConnectError);
    socket.on(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, onBudgetLow);

    if (!isNamespacePaused(RealtimeNamespace.NOTIFICATIONS)) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.off("connect_error", onConnectError);
      socket.off(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, onBudgetLow);
      socket.disconnect();
    };
  }, [authenticated, queryClient, user]);

  const connection: ConnectionState = paused
    ? "disconnected"
    : reconnecting
      ? "reconnecting"
      : authenticated && !socketLive
        ? "disconnected"
        : "connected";

  const value = useMemo(
    () => ({
      connection,
      connectionPaused: paused,
      notificationsConnected: authenticated && socketLive,
      reconnect,
      subscribeBudgetLow,
      notices,
      unreadCount,
      markNoticesRead,
    }),
    [
      authenticated,
      connection,
      markNoticesRead,
      notices,
      paused,
      reconnect,
      socketLive,
      subscribeBudgetLow,
      unreadCount,
    ],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    return {
      connection: "connected",
      connectionPaused: false,
      notificationsConnected: false,
      reconnect: () => undefined,
      subscribeBudgetLow: () => () => undefined,
      notices: [],
      unreadCount: 0,
      markNoticesRead: () => undefined,
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

/** Spanish copy for budget-low toast/alert bodies (shared helper). */
export function budgetLowCopy(payload: PresupuestoEjecucionBajaPayload): string {
  return `Ejecución baja: ${formatPercent(payload.executedPercent)} de ${formatPercent(payload.thresholdPercent)}`;
}
