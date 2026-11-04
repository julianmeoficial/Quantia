"use client";

import { QueryClient } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: true,
        retry: 1,
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/** Singleton QueryClient for the browser (avoids re-creating across HMR). */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  browserClient ??= makeQueryClient();
  return browserClient;
}
