"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/system";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error.digest ?? error.name);
  }, [error]);

  return (
    <ErrorState
      variant="server"
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Puedes intentarlo de nuevo."
      onRetry={() => retry()}
      retryLabel="Reintentar"
    />
  );
}
