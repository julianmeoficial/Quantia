import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";

import { theme } from "@/theme";

import { TaskStatusControl } from "./TaskStatusControl";

function setup(onChange?: (next: string) => void) {
  return render(
    <ThemeProvider theme={theme}>
      <TaskStatusControl status="TODO" title="Redactar informe" onChange={onChange} />
    </ThemeProvider>,
  );
}

describe("TaskStatusControl", () => {
  it("is a plain badge when the person cannot change the status", () => {
    setup();
    expect(screen.getByText("Por hacer")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers the four statuses and reports the chosen one", async () => {
    const onChange = vi.fn();
    setup(onChange);
    const trigger = screen.getByRole("button", {
      name: "Estado de Redactar informe: Por hacer. Cambiar",
    });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });

    const options = await screen.findAllByRole("menuitem");
    expect(options.map((option) => option.textContent)).toEqual([
      "Por hacer",
      "En curso",
      "Bloqueada",
      "Hecha",
    ]);
    // The current status cannot be re-selected.
    expect(options[0]).toHaveAttribute("data-disabled");

    fireEvent.click(options[1]!);
    expect(onChange).toHaveBeenCalledWith("IN_PROGRESS");
  });
});
