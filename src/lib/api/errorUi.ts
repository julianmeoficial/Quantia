import type { ApiError } from "./errors";

export type ErrorUiVariant = "forbidden" | "rate-limit" | "session" | "server" | "not-found";

export type ErrorUiProps = {
  variant: ErrorUiVariant;
  title?: string;
  description?: string;
  retryAfterSeconds?: number;
};

/**
 * Maps a normalized ApiError to ErrorState props. Never exposes status codes or stacks.
 */
export function errorStatePropsFromApiError(error: ApiError): ErrorUiProps {
  switch (error.kind) {
    case "forbidden":
      return {
        variant: "forbidden",
        title: "No tienes acceso",
      };
    case "rate_limited":
      return {
        variant: "rate-limit",
        retryAfterSeconds: error.retryAfterSeconds,
      };
    case "not_found":
      return {
        variant: "not-found",
      };
    case "network":
      return {
        variant: "server",
        title: "No pudimos completar la solicitud",
        description: "Revisa tu conexión e inténtalo de nuevo.",
      };
    case "unauthorized":
      // OVR-04 owns the session modal; page scopes fall back to a recoverable server state.
      return {
        variant: "server",
        title: "Tu sesión expiró",
        description: "Inicia sesión de nuevo para continuar.",
      };
    default:
      return {
        variant: "server",
      };
  }
}
