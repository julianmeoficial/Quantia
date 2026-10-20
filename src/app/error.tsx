"use client";

import { useEffect } from "react";

import { StatusView } from "./_components/status-view";

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
    <StatusView
      title="Algo salió mal"
      description="Ocurrió un error inesperado. Puedes intentarlo de nuevo."
      action={
        <button type="button" onClick={() => retry()}>
          Reintentar
        </button>
      }
    />
  );
}
