"use client";

import { createGlobalStyle } from "styled-components";

import { darkPalette, lightPalette, paletteToCssDeclarations } from "./index";

const lightVars = paletteToCssDeclarations(lightPalette);
const darkVars = paletteToCssDeclarations(darkPalette);

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light;
    ${lightVars}
  }

  :root[data-theme="dark"] {
    color-scheme: dark;
    ${darkVars}
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      ${darkVars}
    }
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  body {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.surface.canvas};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.sans};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
    -webkit-font-smoothing: antialiased;
  }

  img,
  picture,
  svg,
  video,
  canvas {
    display: block;
    max-width: 100%;
  }

  input,
  button,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }

  a {
    color: ${({ theme }) => theme.colors.brand.primary};
  }

  :focus-visible {
    outline: ${({ theme }) => theme.borderWidths.thick} solid ${({ theme }) => theme.colors.focus.ring};
    outline-offset: ${({ theme }) => theme.borderWidths.thick};
  }

  ${({ theme }) => theme.media.reducedMotion} {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
