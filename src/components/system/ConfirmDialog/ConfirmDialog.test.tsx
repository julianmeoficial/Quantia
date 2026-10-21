import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("moves initial focus to the cancel action", async () => {
    render(
      <ThemeProvider theme={theme}>
        <ConfirmDialog
          open
          onOpenChange={vi.fn()}
          title="Eliminar documento"
          description="Esta acción no se puede deshacer."
          confirmLabel="Eliminar documento"
          onConfirm={vi.fn()}
        />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    });
  });
});
