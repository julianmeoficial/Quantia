"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/features/auth/AuthProvider";

import { getQueryClient } from "./client";

export function QueryProvider({ children }: { children: ReactNode }) {
  const client = getQueryClient();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      client.clear();
    }
  }, [client, status]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
