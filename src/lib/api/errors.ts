export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "rate_limited"
  | "invalid_response"
  | "server"
  | "unknown";

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  network: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  unauthorized: "Tu sesión expiró. Inicia sesión de nuevo para continuar.",
  forbidden: "No tienes permiso para realizar esta acción.",
  not_found: "El recurso solicitado no está disponible.",
  conflict: "La información cambió mientras trabajabas. Recarga e inténtalo de nuevo.",
  validation: "Revisa los datos enviados.",
  rate_limited: "Hay demasiadas solicitudes. Inténtalo de nuevo en unos segundos.",
  invalid_response: "Recibimos una respuesta inesperada del servidor.",
  server: "Ocurrió un error en el servidor. Inténtalo más tarde.",
  unknown: "Ocurrió un error inesperado.",
};

export class ApiError extends Error {
  constructor(
    public readonly kind: ApiErrorKind,
    public readonly status: number | null,
    message: string = DEFAULT_MESSAGES[kind],
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 400 || status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

function readMessage(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "message" in body) {
    const { message } = body;
    if (typeof message === "string" && message.trim()) return message;
  }
  return undefined;
}

/**
 * Normaliza una respuesta fallida. En 401/403/404 se usa siempre el mensaje genérico
 * para no revelar la existencia de recursos fuera del alcance del usuario.
 */
export function toApiError(status: number, body: unknown): ApiError {
  const kind = kindFromStatus(status);
  const exposeServerMessage = kind === "validation" || kind === "conflict";
  const message = (exposeServerMessage && readMessage(body)) || DEFAULT_MESSAGES[kind];
  return new ApiError(kind, status, message, exposeServerMessage ? body : undefined);
}
