import { darkColors } from "./dark";
import {
  borderWidths,
  breakpoints,
  elevation,
  fonts,
  media,
  typography,
  zIndices,
  type Breakpoint,
} from "./foundation";
import { lightColors } from "./light";
import { layout, motion, radii, sizes, space } from "./scales";

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

type ColorTree = { readonly [key: string]: string | ColorTree };

/** Serializes a color tree as CSS custom-property declarations for GlobalStyle. */
export function colorsToCssDeclarations(colors: ColorTree): string {
  const declarations: string[] = [];
  const walk = (node: ColorTree, path: string[]) => {
    for (const [key, value] of Object.entries(node)) {
      const nextPath = [...path, toKebab(key)];
      if (typeof value === "string") {
        declarations.push(`${CSS_VAR_PREFIX}-${nextPath.join("-")}: ${value};`);
      } else {
        walk(value, nextPath);
      }
    }
  };
  walk(colors, []);
  return declarations.join("\n");
}

const shared = {
  space,
  radii,
  layout,
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

export const theme = {
  colors: mapToCssVars(lightColors),
  ...shared,
} as const;

export type AppTheme = typeof theme;
export type ThemeMode = "light" | "dark" | "system";
export type ThemeColors = typeof lightColors | typeof darkColors;

export {
  lightColors,
  darkColors,
  space,
  radii,
  layout,
  sizes,
  motion,
  borderWidths,
  fonts,
  typography,
  elevation,
  breakpoints,
  media,
  zIndices,
};

export type { Breakpoint };

/** @deprecated Use colorsToCssDeclarations */
export const paletteToCssDeclarations = colorsToCssDeclarations;
