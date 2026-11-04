import { describe, expect, it } from "vitest";

import {
  buildLoginHref,
  isSafeReturnCandidate,
  postLoginHref,
  readSafeReturnPath,
} from "./returnPath";

describe("returnPath", () => {
  it("rejects protocol-relative and login loops", () => {
    expect(isSafeReturnCandidate("//evil.example")).toBe(false);
    expect(isSafeReturnCandidate("/login")).toBe(false);
    expect(isSafeReturnCandidate("/login?x=1")).toBe(false);
    expect(isSafeReturnCandidate("https://evil.example")).toBe(false);
    expect(isSafeReturnCandidate("/proyectos")).toBe(true);
    expect(isSafeReturnCandidate("/proyectos?tab=1")).toBe(true);
  });

  it("buildLoginHref encodes from", () => {
    expect(buildLoginHref("/mis-tareas")).toBe("/login?from=%2Fmis-tareas");
    expect(buildLoginHref("//evil")).toBe("/login");
  });

  it("readSafeReturnPath requires canAccess", () => {
    expect(readSafeReturnPath("/mis-tareas", ["INVESTIGADOR"])).toBe("/mis-tareas");
    expect(readSafeReturnPath("/usuarios", ["INVESTIGADOR"])).toBeNull();
    expect(readSafeReturnPath("/usuarios", ["ADMINISTRADOR"])).toBe("/usuarios");
    expect(readSafeReturnPath("//evil", ["ADMINISTRADOR"])).toBeNull();
  });

  it("postLoginHref falls back to landing", () => {
    expect(postLoginHref("/usuarios", ["INVESTIGADOR"], "/mis-tareas")).toBe("/mis-tareas");
    expect(postLoginHref("/mis-tareas", ["INVESTIGADOR"], "/mis-tareas")).toBe("/mis-tareas");
    expect(postLoginHref(null, ["INVESTIGADOR"], "/mis-tareas")).toBe("/mis-tareas");
  });
});
