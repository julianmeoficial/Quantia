import { fireEvent, render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { Select } from "./Select";

describe("Select", () => {
  it("opens and selects an option with keyboard-compatible click", async () => {
    render(
      <ThemeProvider theme={theme}>
        <Select
          label="Estado del proyecto"
          options={[
            { value: "active", label: "En curso" },
            { value: "delayed", label: "Retrasado" },
          ]}
        />
      </ThemeProvider>,
    );

    const trigger = screen.getByRole("combobox", { name: "Estado del proyecto" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const listbox = await screen.findByRole("listbox");
    const option = within(listbox).getByRole("option", { name: "Retrasado" });
    fireEvent.click(option);
    expect(trigger).toHaveTextContent("Retrasado");
  });
});
