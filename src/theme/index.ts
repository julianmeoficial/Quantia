import { darkPalette, lightPalette, type Palette } from "./palette";
import {
  borderWidths,
  breakpoints,
  elevation,
  fonts,
  media,
  motion,
  radii,
  sizes,
  space,
  typography,
  zIndices,
} from "./tokens";

const CSS_VAR_PREFIX = "--q-color";

type CssVarMap<T> = { [K in keyof T]: T[K] extends string ? string : CssVarMap<T[K]> };

function toKebab(value: string) {
  return value.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function mapToCssVars<T extends object>(node: T, path: string[] = []): CssVarMap<T> {
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => {
      const nextPath = [...path, toKebab(key)];
      return [
        key,
        typeof value === "string"
          ? `var(${CSS_VAR_PREFIX}-${nextPath.join("-")})`
          : mapToCssVars(value as object, nextPath),
      ];
    }),
  ) as CssVarMap<T>;
}

/** Serializa una paleta como declaraciones de custom properties para GlobalStyle. */
export function paletteToCssDeclarations(palette: Palette): string {
  const declarations: string[] = [];
  const walk = (node: object, path: string[]) => {
    for (const [key, value] of Object.entries(node)) {
      const nextPath = [...path, toKebab(key)];
      if (typeof value === "string") {
        declarations.push(`${CSS_VAR_PREFIX}-${nextPath.join("-")}: ${value};`);
      } else {
        walk(value as object, nextPath);
      }
    }
  };
  walk(palette, []);
  return declarations.join("\n");
}

export const theme = {
  colors: mapToCssVars(lightPalette),
  space,
  radii,
  borderWidths,
  fonts,
  typography,
  elevation,
  motion,
  breakpoints,
  media,
  sizes,
  zIndices,
} as const;

export type AppTheme = typeof theme;
export type ThemeMode = "light" | "dark" | "system";

export { darkPalette, lightPalette, type Palette };
