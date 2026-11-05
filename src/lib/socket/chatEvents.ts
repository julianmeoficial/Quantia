import {
  ChatGeneralEvent,
  chatGeneralAckSchema,
  chatGeneralEscribiendoPayloadSchema,
  chatGeneralLecturaPayloadSchema,
  chatGeneralMensajeCreadoPayloadSchema,
  chatGeneralMensajeEditadoPayloadSchema,
  chatGeneralMensajeEliminadoPayloadSchema,
  chatGeneralPresenciaPayloadSchema,
  chatGeneralReaccionesActualizadasPayloadSchema,
  chatGeneralSocketErrorSchema,
  chatGeneralUsuarioActualizadoPayloadSchema,
  chatGeneralUsuarioConectadoPayloadSchema,
  chatGeneralUsuarioDesconectadoPayloadSchema,
  type ChatGeneralAck,
  type ChatGeneralSocketError,
} from "@quantia/contracts";
import type { z } from "zod";

/** Every server → client event on `/general`, validated with its contract schema. */
const chatGeneralSchemas = {
  [ChatGeneralEvent.PRESENCIA]: chatGeneralPresenciaPayloadSchema,
  [ChatGeneralEvent.USUARIO_CONECTADO]: chatGeneralUsuarioConectadoPayloadSchema,
  [ChatGeneralEvent.USUARIO_DESCONECTADO]: chatGeneralUsuarioDesconectadoPayloadSchema,
  [ChatGeneralEvent.USUARIO_ACTUALIZADO]: chatGeneralUsuarioActualizadoPayloadSchema,
  [ChatGeneralEvent.MENSAJE_CREADO]: chatGeneralMensajeCreadoPayloadSchema,
  [ChatGeneralEvent.MENSAJE_EDITADO]: chatGeneralMensajeEditadoPayloadSchema,
  [ChatGeneralEvent.MENSAJE_ELIMINADO]: chatGeneralMensajeEliminadoPayloadSchema,
  [ChatGeneralEvent.REACCIONES_ACTUALIZADAS]: chatGeneralReaccionesActualizadasPayloadSchema,
  [ChatGeneralEvent.ESCRIBIENDO]: chatGeneralEscribiendoPayloadSchema,
  [ChatGeneralEvent.LECTURA]: chatGeneralLecturaPayloadSchema,
} as const;

type ChatGeneralSchemas = typeof chatGeneralSchemas;

export type ChatGeneralServerEvent = keyof ChatGeneralSchemas;

export type ChatGeneralPayloadByEvent = {
  [E in ChatGeneralServerEvent]: z.infer<ChatGeneralSchemas[E]>;
};

export const CHAT_GENERAL_SERVER_EVENTS = Object.keys(
  chatGeneralSchemas,
) as ChatGeneralServerEvent[];

/** Returns `null` for payloads that do not match the contract (they are ignored). */
export function parseChatGeneralPayload<E extends ChatGeneralServerEvent>(
  event: E,
  raw: unknown,
): ChatGeneralPayloadByEvent[E] | null {
  const parsed = chatGeneralSchemas[event].safeParse(raw);
  return parsed.success ? (parsed.data as ChatGeneralPayloadByEvent[E]) : null;
}

export function parseChatGeneralSocketError(raw: unknown): ChatGeneralSocketError | null {
  const parsed = chatGeneralSocketErrorSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function parseChatGeneralAck(raw: unknown): ChatGeneralAck | null {
  const parsed = chatGeneralAckSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
