import type { UserResponse } from "@quantia/contracts";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { CoordinatorPicker } from "./CoordinatorPicker";
import { isActiveCoordinator } from "./useCoordinators";

function coordinator(id: string, fullName: string, email: string): UserResponse {
  return {
    id,
    email,
    fullName,
    isActive: true,
    roles: ["COORDINADOR"],
    avatar: null,
    avatarRequired: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const ANA = coordinator("11111111-1111-4111-8111-111111111111", "Ana Gómez", "ana@quantia.local");
const LUIS = coordinator(
  "22222222-2222-4222-8222-222222222222",
  "Luis Pérez",
  "luis@quantia.local",
);

function setup(onValueChange = vi.fn()) {
  render(
    <ThemeProvider theme={theme}>
      <CoordinatorPicker
        label="Responsable del proyecto"
        coordinators={[ANA, LUIS]}
        status="ready"
        value={null}
        onValueChange={onValueChange}
      />
    </ThemeProvider>,
  );
  return onValueChange;
}

describe("CoordinatorPicker", () => {
  it("lists every current coordinator as soon as it opens", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Responsable del proyecto/ }));
    const options = await screen.findAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "Ana Gómezana@quantia.local",
      "Luis Pérezluis@quantia.local",
    ]);
  });

  it("narrows by name or email ignoring accents, then picks one", async () => {
    const onValueChange = setup();
    fireEvent.click(screen.getByRole("button", { name: /Responsable del proyecto/ }));
    fireEvent.change(await screen.findByLabelText("Buscar coordinador"), {
      target: { value: "perez" },
    });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    fireEvent.click(options[0]!);
    expect(onValueChange).toHaveBeenCalledWith(LUIS);
  });
});

describe("isActiveCoordinator", () => {
  it("accepts active coordinators only, not administrators or inactive people", () => {
    expect(isActiveCoordinator({ roles: ["COORDINADOR"], isActive: true })).toBe(true);
    expect(isActiveCoordinator({ roles: ["COORDINADOR", "ADMINISTRADOR"], isActive: true })).toBe(
      true,
    );
    expect(isActiveCoordinator({ roles: ["ADMINISTRADOR"], isActive: true })).toBe(false);
    expect(isActiveCoordinator({ roles: ["COORDINADOR"], isActive: false })).toBe(false);
  });
});
