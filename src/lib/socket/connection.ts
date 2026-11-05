"use client";

import { type RealtimeNamespace } from "@quantia/contracts";
import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { getAccessToken, onAccessToken } from "@/lib/api/session";

export type SocketNamespace =
  | typeof RealtimeNamespace.PROJECTS
  | typeof RealtimeNamespace.NOTIFICATIONS
  | typeof RealtimeNamespace.GENERAL;

const sockets = new Map<SocketNamespace, Socket>();
let authUnsub: (() => void) | null = null;
const connectionBudgetPaused = new Set<SocketNamespace>();
const pauseListeners = new Set<() => void>();

const TOO_MANY = "Too many connections";
const TOO_MANY_CODE = "TOO_MANY_CONNECTIONS";

/** `/general` sends `{ code, message }`; older namespaces send a plain message. */
export function isTooManyConnections(payload: unknown): boolean {
  if (typeof payload === "string") return payload.includes(TOO_MANY);
  if (typeof payload !== "object" || payload === null) return false;
  const { code, message } = payload as { code?: unknown; message?: unknown };
  if (code === TOO_MANY_CODE) return true;
  return typeof message === "string" && message.includes(TOO_MANY);
}

function emitPauseChange() {
  for (const listener of pauseListeners) listener();
}

export function subscribeConnectionPause(listener: () => void): () => void {
  pauseListeners.add(listener);
  return () => {
    pauseListeners.delete(listener);
  };
}

export function getPausedNamespaces(): readonly SocketNamespace[] {
  return [...connectionBudgetPaused];
}

function ensureAuthSync() {
  if (authUnsub) return;
  authUnsub = onAccessToken((token) => {
    updateSocketAuth(token);
  });
}

function applyAuth(socket: Socket, token: string | null) {
  socket.auth = { token };
}

/**
 * Socket por namespace contra el gateway de la API (nunca contra route handlers de Next.js).
 * Se crea sin conectar; el consumidor llama `connect()` cuando hay sesión.
 */
export function getSocket(namespace: SocketNamespace): Socket {
  ensureAuthSync();

  const existing = sockets.get(namespace);
  if (existing) return existing;

  const socket = io(`${env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, "")}${namespace}`, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: (cb) => cb({ token: getAccessToken() }),
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 15_000,
    randomizationFactor: 0.5,
  });

  socket.on("connect_error", (error) => {
    if (error.message.includes(TOO_MANY)) {
      pauseNamespace(namespace);
    }
  });

  socket.on("error", (payload: unknown) => {
    if (isTooManyConnections(payload)) {
      pauseNamespace(namespace);
    }
  });

  sockets.set(namespace, socket);
  return socket;
}

function pauseNamespace(namespace: SocketNamespace) {
  const already = connectionBudgetPaused.has(namespace);
  connectionBudgetPaused.add(namespace);
  const socket = sockets.get(namespace);
  if (socket) {
    socket.io.opts.reconnection = false;
    socket.disconnect();
  }
  if (!already) emitPauseChange();
}

export function isNamespacePaused(namespace: SocketNamespace): boolean {
  return connectionBudgetPaused.has(namespace);
}

export function clearNamespacePause(namespace: SocketNamespace) {
  const had = connectionBudgetPaused.delete(namespace);
  const socket = sockets.get(namespace);
  if (socket) {
    socket.io.opts.reconnection = true;
  }
  if (had) emitPauseChange();
}

/** Actualiza `auth.token` en todos los sockets vivos (tras refresh JWT). */
export function updateSocketAuth(token: string | null) {
  sockets.forEach((socket) => {
    applyAuth(socket, token);
  });
}

export function reconnectSocket(namespace: SocketNamespace) {
  clearNamespacePause(namespace);
  const socket = getSocket(namespace);
  applyAuth(socket, getAccessToken());
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectAllSockets() {
  sockets.forEach((socket) => {
    socket.removeAllListeners();
    socket.disconnect();
  });
  sockets.clear();
  if (connectionBudgetPaused.size > 0) {
    connectionBudgetPaused.clear();
    emitPauseChange();
  }
}

export function disconnectNamespace(namespace: SocketNamespace) {
  const socket = sockets.get(namespace);
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  sockets.delete(namespace);
  if (connectionBudgetPaused.delete(namespace)) {
    emitPauseChange();
  }
}
