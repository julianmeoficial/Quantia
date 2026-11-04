"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "styled-components";

import { AuthProvider } from "@/features/auth/AuthProvider";
import { SocketProvider } from "@/lib/socket";
import { StyledComponentsRegistry } from "@/lib/styled-registry";
import { theme } from "@/theme";
import { GlobalStyle } from "@/theme/global-style";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <SocketProvider>{children}</SocketProvider>
          </AuthProvider>
        </MotionConfig>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
