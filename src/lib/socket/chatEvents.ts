import {
  ChatGeneralEvent,
  chatGeneralMensajeCreadoPayloadSchema,
  chatGeneralPresenciaPayloadSchema,
  chatGeneralUsuarioConectadoPayloadSchema,
  chatGeneralUsuarioDesconectadoPayloadSchema,
  type ChatGeneralMensajeCreadoPayload,
  type ChatGeneralPresenciaPayload,
  type ChatGeneralUsuarioConectadoPayload,
  type ChatGeneralUsuarioDesconectadoPayload,
} from "@quantia/contracts";

export type ChatGeneralPayloadByEvent = {
  [ChatGeneralEvent.PRESENCIA]: ChatGeneralPresenciaPayload;
  [ChatGeneralEvent.USUARIO_CONECTADO]: ChatGeneralUsuarioConectadoPayload;
  [ChatGeneralEvent.USUARIO_DESCONECTADO]: ChatGeneralUsuarioDesconectadoPayload;
  [ChatGeneralEvent.MENSAJE_CREADO]: ChatGeneralMensajeCreadoPayload;
};

export function parseChatGeneralPayload(
  event: typeof ChatGeneralEvent.PRESENCIA,
  raw: unknown,
): ChatGeneralPresenciaPayload | null;
export function parseChatGeneralPayload(
  event: typeof ChatGeneralEvent.USUARIO_CONECTADO,
  raw: unknown,
): ChatGeneralUsuarioConectadoPayload | null;
export function parseChatGeneralPayload(
  event: typeof ChatGeneralEvent.USUARIO_DESCONECTADO,
  raw: unknown,
): ChatGeneralUsuarioDesconectadoPayload | null;
export function parseChatGeneralPayload(
  event: typeof ChatGeneralEvent.MENSAJE_CREADO,
  raw: unknown,
): ChatGeneralMensajeCreadoPayload | null;
export function parseChatGeneralPayload(
  event: keyof ChatGeneralPayloadByEvent,
  raw: unknown,
): ChatGeneralPayloadByEvent[keyof ChatGeneralPayloadByEvent] | null {
  switch (event) {
    case ChatGeneralEvent.PRESENCIA: {
      const parsed = chatGeneralPresenciaPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case ChatGeneralEvent.USUARIO_CONECTADO: {
      const parsed = chatGeneralUsuarioConectadoPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case ChatGeneralEvent.USUARIO_DESCONECTADO: {
      const parsed = chatGeneralUsuarioDesconectadoPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case ChatGeneralEvent.MENSAJE_CREADO: {
      const parsed = chatGeneralMensajeCreadoPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    default:
      return null;
  }
}
