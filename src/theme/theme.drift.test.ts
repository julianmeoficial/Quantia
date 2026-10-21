import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { darkColors } from "./dark";
import { breakpoints, media } from "./foundation";
import { lightColors } from "./light";
import { motion, radii, space } from "./scales";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type TokenLeaf = {
  $type?: string;
  $value?:
    | number
    | string
    | {
        alpha?: number;
        hex?: string;
      };
};

const FIGMA_DIR = join(process.cwd(), "src/theme/figma");

/** DESIGN.md §4.1 / §4.2 mirror (post Figma sync) — fails if docs drift from generated theme. */
const DESIGN_MD_LIGHT = {
  "bg.canvas": "#F7F8FA",
  "bg.surface": "#FFFFFF",
  "bg.subtle": "#F0F3F6",
  "text.primary": "#18202A",
  "text.secondary": "#56616F",
  "border.subtle": "#D8DEE6",
  "border.control": "#7B8794",
  "brand.primary": "#315C8C",
  "brand.hover": "#274A70",
  "brand.pressed": "#203D5C",
  "brand.onPrimary": "#FFFFFF",
  "selection.bg": "#EAF1F8",
  "selection.text": "#274A70",
  "focus.ring": "#315C8C",
  "status.success.text": "#247A4A",
  "status.success.icon": "#247A4A",
  "status.success.bg": "#EDF7F0",
  "status.warning.text": "#92400E",
  "status.warning.icon": "#92400E",
  "status.warning.bg": "#FFFBEB",
  "status.error.text": "#B43A3A",
  "status.error.icon": "#B43A3A",
  "status.error.bg": "#FDEEEE",
  "status.info.text": "#256AA5",
  "status.info.icon": "#256AA5",
  "status.info.bg": "#EFF6FF",
  "status.neutral.text": "#56616F",
  "status.neutral.icon": "#56616F",
  "status.neutral.bg": "#EEF1F4",
} as const;

const DESIGN_MD_DARK = {
  "bg.canvas": "#101419",
  "bg.surface": "#181E25",
  "bg.subtle": "#202832",
  "text.primary": "#F2F5F8",
  "text.secondary": "#B4BEC9",
  "border.subtle": "#35404D",
  "border.control": "#718096",
  "brand.primary": "#79A8D8",
  "brand.hover": "#8DB7E0",
  "brand.pressed": "#6698CA",
  "brand.onPrimary": "#101419",
  "selection.bg": "#203348",
  "selection.text": "#B8D5F2",
  "focus.ring": "#79A8D8",
  "status.success.text": "#65C78D",
  "status.success.icon": "#65C78D",
  "status.success.bg": "#142B20",
  "status.warning.text": "#E1AE4C",
  "status.warning.icon": "#E1AE4C",
  "status.warning.bg": "#302719",
  "status.error.text": "#F08080",
  "status.error.icon": "#F08080",
  "status.error.bg": "#321E23",
  "status.info.text": "#77B8E8",
  "status.info.icon": "#77B8E8",
  "status.info.bg": "#192C3C",
  "status.neutral.text": "#B4BEC9",
  "status.neutral.icon": "#B4BEC9",
  "status.neutral.bg": "#252D36",
} as const;

function isTokenLeaf(node: unknown): node is TokenLeaf {
  return typeof node === "object" && node !== null && ("$value" in node || "$type" in node);
}

function resolveColor(value: TokenLeaf["$value"]): string {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null || !value.hex) {
    throw new Error(`Expected color hex, got ${JSON.stringify(value)}`);
  }
  return value.hex.toUpperCase();
}

function walk(node: Json, path: string[], onLeaf: (path: string[], leaf: TokenLeaf) => void): void {
  if (!node || typeof node !== "object" || Array.isArray(node)) return;
  if (isTokenLeaf(node)) {
    onLeaf(path, node);
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    walk(child, [...path, key], onLeaf);
  }
}

function loadFigmaColors(fileName: string): Map<string, string> {
  const data = JSON.parse(readFileSync(join(FIGMA_DIR, fileName), "utf8")) as Json;
  const map = new Map<string, string>();
  walk(data, [], (path, leaf) => {
    if (leaf.$type !== "color") return;
    map.set(path.join("/"), resolveColor(leaf.$value));
  });
  return map;
}

function loadFigmaNumbers(fileName: string): Map<string, number> {
  const data = JSON.parse(readFileSync(join(FIGMA_DIR, fileName), "utf8")) as Json;
  const map = new Map<string, number>();
  walk(data, [], (path, leaf) => {
    if (leaf.$type !== "number" || typeof leaf.$value !== "number") return;
    map.set(path.join("/"), leaf.$value);
  });
  return map;
}

type ColorTree = { readonly [key: string]: string | ColorTree };

function flattenColors(colors: ColorTree, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out[path] = value.toUpperCase();
    } else {
      Object.assign(out, flattenColors(value, path));
    }
  }
  return out;
}

/** Map theme color paths → Figma semantic paths. */
const THEME_TO_FIGMA: Record<string, string> = {
  "bg.canvas": "bg/canvas",
  "bg.surface": "bg/surface",
  "bg.subtle": "bg/subtle",
  "text.primary": "text/primary",
  "text.secondary": "text/secondary",
  "border.subtle": "border/subtle",
  "border.control": "border/control",
  "brand.primary": "action/primary",
  "brand.hover": "action/primary-hover",
  "brand.pressed": "action/primary-pressed",
  "brand.onPrimary": "action/on-primary",
  "selection.bg": "selection/bg",
  "selection.text": "selection/text",
  "focus.ring": "focus/ring",
  "status.success.text": "status/success/text",
  "status.success.icon": "status/success/icon",
  "status.success.bg": "status/success/bg",
  "status.warning.text": "status/warning/text",
  "status.warning.icon": "status/warning/icon",
  "status.warning.bg": "status/warning/bg",
  "status.error.text": "status/error/text",
  "status.error.icon": "status/error/icon",
  "status.error.bg": "status/error/bg",
  "status.info.text": "status/info/text",
  "status.info.icon": "status/info/icon",
  "status.info.bg": "status/info/bg",
  "status.neutral.text": "status/neutral/text",
  "status.neutral.icon": "status/neutral/icon",
  "status.neutral.bg": "status/neutral/bg",
};

describe("theme drift (Figma JSON ↔ generated theme ↔ DESIGN.md)", () => {
  it("light colors match semantic.light.tokens.json", () => {
    const figma = loadFigmaColors("semantic.light.tokens.json");
    const theme = flattenColors(lightColors);
    for (const [themePath, figmaPath] of Object.entries(THEME_TO_FIGMA)) {
      expect(theme[themePath], themePath).toBe(figma.get(figmaPath));
    }
  });

  it("dark colors match semantic.dark.tokens.json", () => {
    const figma = loadFigmaColors("semantic.dark.tokens.json");
    const theme = flattenColors(darkColors);
    for (const [themePath, figmaPath] of Object.entries(THEME_TO_FIGMA)) {
      expect(theme[themePath], themePath).toBe(figma.get(figmaPath));
    }
  });

  it("scales match primitives.tokens.json", () => {
    const numbers = loadFigmaNumbers("primitives.tokens.json");
    expect(space[4]).toBe("0.25rem");
    expect(space[8]).toBe("0.5rem");
    expect(space[16]).toBe("1rem");
    expect(space[64]).toBe("4rem");
    expect(numbers.get("spacing/4")).toBe(4);
    expect(numbers.get("spacing/64")).toBe(64);
    expect(radii.control).toBe("0.375rem");
    expect(numbers.get("radius/control")).toBe(6);
    expect(radii.card).toBe("0.625rem");
    expect(radii.featured).toBe("1rem");
    expect(motion.duration.fast).toBe("150ms");
    expect(motion.duration.slow).toBe("250ms");
    expect(numbers.get("motion/duration-min")).toBe(150);
    expect(numbers.get("motion/duration-max")).toBe(250);
  });

  it("light theme matches DESIGN.md tables", () => {
    const theme = flattenColors(lightColors);
    for (const [path, hex] of Object.entries(DESIGN_MD_LIGHT)) {
      expect(theme[path], path).toBe(hex);
    }
  });

  it("dark theme matches DESIGN.md tables", () => {
    const theme = flattenColors(darkColors);
    for (const [path, hex] of Object.entries(DESIGN_MD_DARK)) {
      expect(theme[path], path).toBe(hex);
    }
  });

  it("exposes media.up breakpoints 390/768/1280/1440", () => {
    expect(breakpoints).toEqual({
      sm: "24.375rem",
      md: "48rem",
      lg: "80rem",
      xl: "90rem",
    });
    expect(media.up("sm")).toBe("@media (min-width: 24.375rem)");
    expect(media.up("md")).toBe("@media (min-width: 48rem)");
    expect(media.up("lg")).toBe("@media (min-width: 80rem)");
    expect(media.up("xl")).toBe("@media (min-width: 90rem)");
  });
});
