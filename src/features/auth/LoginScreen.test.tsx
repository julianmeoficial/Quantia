import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { theme } from "@/theme";

import { LoginScreen } from "./LoginScreen";

const login = vi.hoisted(() => vi.fn());

const replace = vi.hoisted(() => vi.fn());
const searchParams = vi.hoisted(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}));

vi.mock("./AuthProvider", () => ({
  useAuth: () => ({
    status: "anonymous",
    user: null,
    login,
  }),
}));

function renderLogin(ui: ReactElement = <LoginScreen />) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("LoginScreen", () => {
  beforeEach(() => {
    login.mockReset();
    replace.mockReset();
    for (const key of [...searchParams.keys()]) searchParams.delete(key);
  });

  it("muestra etiquetas persistentes y no envía el formulario vacío", () => {
    renderLogin();

    expect(screen.getByLabelText("Correo (obligatorio)")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña (obligatoria)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Inicia sesión de prueba" }));

    expect(screen.getByText("Ingresa tu correo.")).toBeInTheDocument();
    expect(screen.getByText("Ingresa tu contraseña.")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("muestra un error genérico si las credenciales fallan", async () => {
    login.mockRejectedValueOnce(
      new ApiError("unauthorized", 401, "Correo o contraseña incorrectos"),
    );
    renderLogin();
    fillValid();

    fireEvent.click(screen.getByRole("button", { name: "Inicia sesión de prueba" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos");
    expect(screen.queryByText(/no existe|inactivo/i)).not.toBeInTheDocument();
  });

  it("deshabilita el envío y muestra el conteo ante un 429", async () => {
    login.mockRejectedValueOnce(new ApiError("rate_limited", 429, "lock", undefined, 60));
    renderLogin();
    fillValid();

    fireEvent.click(screen.getByRole("button", { name: "Inicia sesión de prueba" }));

    expect(
      await screen.findByText("Demasiados intentos. Vuelve a intentarlo en 60s."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inicia sesión de prueba" })).toBeDisabled();
  });

  it("muestra el error de carga si el servidor no responde", async () => {
    login.mockRejectedValueOnce(new ApiError("network", null));
    renderLogin();
    fillValid();

    fireEvent.click(screen.getByRole("button", { name: "Inicia sesión de prueba" }));

    expect(
      await screen.findByText("Algo salió mal. Vuelve a intentarlo en unos segundos."),
    ).toBeInTheDocument();
  });

  it("restaura la ruta from tras un login exitoso", async () => {
    searchParams.set("from", "/mis-tareas");
    login.mockResolvedValueOnce({
      id: "11111111-1111-4111-8111-111111111111",
      email: "ana@uni.edu.co",
      fullName: "Ana Ruiz",
      roles: ["INVESTIGADOR"],
      isActive: true,
      createdAt: "2026-11-04T12:00:00.000Z",
      updatedAt: "2026-11-04T12:00:00.000Z",
    });
    renderLogin();
    fillValid();
    fireEvent.click(screen.getByRole("button", { name: "Inicia sesión de prueba" }));
    await vi.waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/mis-tareas");
    });
  });

  it("alterna la visibilidad de la contraseña", () => {
    renderLogin();
    const input = screen.getByLabelText("Contraseña (obligatoria)");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Ver" }));
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar" })).toHaveAttribute("aria-pressed", "true");
  });
});

function fillValid() {
  fireEvent.change(screen.getByLabelText("Correo (obligatorio)"), {
    target: { value: "ana@uni.edu.co" },
  });
  fireEvent.change(screen.getByLabelText("Contraseña (obligatoria)"), {
    target: { value: "secretos" },
  });
}
