import { fireEvent, render, screen } from "@testing-library/react";
import { useState, type ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it } from "vitest";

import { theme } from "@/theme";

import { DateRangePicker } from "./DateRangePicker";
import { FileUploader } from "./FileUploader";
import { Pagination } from "./Pagination";
import { SearchField } from "./SearchField";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

function SearchHarness() {
  const [value, setValue] = useState("informe");
  return <SearchField label="Buscar" value={value} onChange={setValue} />;
}

describe("composite foundations", () => {
  it("keeps focus on the search field after clearing", () => {
    renderWithTheme(<SearchHarness />);
    const input = screen.getByLabelText("Buscar");
    input.focus();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar buscar" }));
    expect(input).toHaveFocus();
    expect(input).toHaveValue("");
  });

  it("shows a date range as DD/MM/AAAA", () => {
    renderWithTheme(
      <DateRangePicker
        label="Periodo"
        value={{ from: "2026-10-15T05:00:00.000Z", to: "2026-10-20T05:00:00.000Z" }}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByText("15/10/2026 – 20/10/2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /15\/10\/2026/ }));
    expect(screen.getByRole("button", { name: "Mes anterior" })).toBeInTheDocument();
    expect(screen.getByLabelText("Desde")).toBeInTheDocument();
  });

  it("disables the previous page on the first page", () => {
    renderWithTheme(
      <Pagination page={1} pageSize={10} totalItems={36} onPageChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
  });

  it("rejects a file over the given size", () => {
    renderWithTheme(
      <FileUploader
        label="Adjuntar evidencia"
        maxBytes={8}
        files={[]}
        onSelect={() => undefined}
      />,
    );
    const input = screen.getByLabelText("Adjuntar evidencia");
    const file = new File(["demasiado"], "acta.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText("acta.pdf supera el tamaño máximo permitido.")).toBeInTheDocument();
  });
});
