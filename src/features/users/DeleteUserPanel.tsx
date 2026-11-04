"use client";

import type { UserResponse } from "@quantia/contracts";
import { useId, useState } from "react";

import { Button, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { deleteUser } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";

import * as S from "../projects/CreateProjectPanel.styles";

export interface DeleteUserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse | null;
  onSuccess?: () => void;
}

export function DeleteUserPanel({ open, onOpenChange, user, onSuccess }: DeleteUserPanelProps) {
  const nameId = useId();
  const [typedName, setTypedName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!open || !user) return null;

  const handleClose = () => {
    if (isSaving) return;
    setTypedName("");
    setError(null);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (typedName.trim() !== user.fullName) {
      setError(`Escribe exactamente «${user.fullName}» para confirmar.`);
      document.getElementById(nameId)?.focus();
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await deleteUser(user.id);
      setTypedName("");
      onOpenChange(false);
      onSuccess?.();
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      setError(
        apiError.kind === "forbidden"
          ? "No tienes permiso para eliminar usuarios."
          : "No pudimos eliminar el usuario.",
      );
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      title="Eliminar usuario"
      description={`Borrado definitivo de «${user.fullName}». Preferimos desactivar. Esta acción no se puede deshacer.`}
      footer={
        <S.FormActions>
          <Button intent="secondary" type="button" disabled={isSaving} onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            intent="danger"
            type="button"
            isLoading={isSaving}
            onClick={() => {
              void handleSubmit();
            }}
          >
            Eliminar definitivamente
          </Button>
        </S.FormActions>
      }
    >
      <S.Form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <TextField
          id={nameId}
          label={`Escribe «${user.fullName}» (obligatorio)`}
          value={typedName}
          onChange={(event) => setTypedName(event.target.value)}
          autoComplete="off"
        />
        {error ? <S.FormError role="alert">{error}</S.FormError> : null}
      </S.Form>
    </Sheet>
  );
}
