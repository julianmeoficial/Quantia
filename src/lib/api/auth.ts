import {
  authTokensResponseSchema,
  loginRequestSchema,
  type LoginRequest,
} from "@quantia/contracts";

import { readRetryAfterSeconds } from "./client";
import { ApiError, toApiError } from "./errors";

const sessionGrantSchema = authTokensResponseSchema.pick({
  accessToken: true,
  expiresIn: true,
});

export type SessionGrant = {
  accessToken: string;
  expiresIn: number;
};

async function postSession(path: string, body?: unknown): Promise<Response> {
  return fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
}

function sessionError(response: Response, body: unknown): ApiError {
  return toApiError(response.status, body, readRetryAfterSeconds(response));
}

/** Login contra el transporte Next. El refresh no vuelve a JavaScript. */
export async function loginWithSession(input: LoginRequest): Promise<SessionGrant> {
  const body = loginRequestSchema.parse(input);
  let response: Response;
  try {
    response = await postSession("/api/session/login", body);
  } catch {
    throw new ApiError("network", null);
  }

  const payload = await response.json().catch(() => undefined);
  if (response.status === 401) {
    throw new ApiError(
      "unauthorized",
      401,
      "Correo o contraseña incorrectos",
      undefined,
      readRetryAfterSeconds(response),
    );
  }
  if (!response.ok) throw sessionError(response, payload);

  const parsed = sessionGrantSchema.safeParse(payload);
  if (!parsed.success) throw new ApiError("invalid_response", response.status);
  return parsed.data;
}

/** `null` si la cookie no sirve. No muestra el modal: lo decide quien llama. */
export async function refreshWithSession(): Promise<SessionGrant | null> {
  try {
    const response = await postSession("/api/session/refresh");
    if (!response.ok) return null;
    const parsed = sessionGrantSchema.safeParse(await response.json().catch(() => undefined));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function logoutWithSession(): Promise<void> {
  try {
    await postSession("/api/session/logout");
  } catch {
    // La limpieza local ocurre igual.
  }
}
