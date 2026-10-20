import "styled-components";

import type { AppTheme } from "./index";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: AppTheme["colors"];
    space: AppTheme["space"];
    radii: AppTheme["radii"];
    borderWidths: AppTheme["borderWidths"];
    fonts: AppTheme["fonts"];
    typography: AppTheme["typography"];
    elevation: AppTheme["elevation"];
    motion: AppTheme["motion"];
    breakpoints: AppTheme["breakpoints"];
    media: AppTheme["media"];
    sizes: AppTheme["sizes"];
    zIndices: AppTheme["zIndices"];
  }
}
