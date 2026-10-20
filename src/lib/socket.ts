"use client";

import { io, type Socket } from "socket.io-client";

import { env } from "@/config/env";
import { getAccessToken } from "@/lib/api/session";

export type SocketNamespace = "/projects" | "/notifications";

const sockets = new Map<SocketNamespace, Socket>();

/**
 * Socket por namespace contra el gateway de la API (nunca contra route handlers de Next.js).
 * Se crea sin conectar; el consumidor llama `connect()` cuando hay sesión.
 */
export function getSocket(namespace: SocketNamespace): Socket {
  const existing = sockets.get(namespace);
  if (existing) return existing;

  const socket = io(`${env.NEXT_PUBLIC_SOCKET_URL.replace(/\/$/, "")}${namespace}`, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth: (cb) => cb({ token: getAccessToken() }),
  });

  sockets.set(namespace, socket);
  return socket;
}

export function disconnectAllSockets() {
  sockets.forEach((socket) => socket.disconnect());
  sockets.clear();
}
