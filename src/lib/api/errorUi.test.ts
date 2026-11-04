import { describe, expect, it } from "vitest";

import { ApiError } from "./errors";
import { errorStatePropsFromApiError } from "./errorUi";

describe("errorStatePropsFromApiError", () => {
  it("maps forbidden without resource disclosure", () => {
    expect(errorStatePropsFromApiError(new ApiError("forbidden", 403))).toEqual({
      variant: "forbidden",
      title: "No tienes acceso",
    });
  });

  it("maps rate_limited with Retry-After", () => {
    expect(
      errorStatePropsFromApiError(new ApiError("rate_limited", 429, undefined, undefined, 12)),
    ).toEqual({
      variant: "rate-limit",
      retryAfterSeconds: 12,
    });
  });

  it("maps network to Spanish connection copy", () => {
    const props = errorStatePropsFromApiError(new ApiError("network", null));
    expect(props.variant).toBe("server");
    expect(props.description).toMatch(/conexión/i);
    expect(JSON.stringify(props)).not.toMatch(/500|TypeError|fetch/i);
  });

  it("maps unknown/server to generic server variant", () => {
    expect(errorStatePropsFromApiError(new ApiError("server", 503)).variant).toBe("server");
    expect(errorStatePropsFromApiError(new ApiError("unknown", null)).variant).toBe("server");
  });
});
