"use client";

import { RoleName, type UserResponse } from "@quantia/contracts";
import { createUserRequestSchema } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";

import { Button, Checkbox, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { createUser } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { ROLE_LABEL, type AppRole } from "@/lib/auth/navigation";
import styled from "styled-components";

import * as S from "../projects/CreateProjectPanel.styles";

const RoleFieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space[8]};
  margin: 0;
  padding: 0;
  border: 0;
`;

const Legend = styled.legend`
  margin-block-end: ${({ theme }) => theme.space[8]};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.label.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyStrong.fontWeight};
`;

const ROLE_OPTIONS = [
  RoleName.INVESTIGADOR,
  RoleName.COORDINADOR,
  RoleName.ADMINISTRADOR,
] as const satisfies readonly AppRole[];

export interface CreateUserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: UserResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

export function CreateUserPanel({
  open,
  onOpenChange,
  onSuccess,
  triggerRef,
}: CreateUserPanelProps) {
  const emailId = useId();
  const nameId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<AppRole[]>([RoleName.INVESTIGADOR]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setEmail("");
    setFullName("");
    setPassword("");
    setRoles([RoleName.INVESTIGADOR]);
    setError(null);
    setIsSaving(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (isSaving) return;
    if (!next) reset();
    onOpenChange(next);
  };

  const toggleRole = (role: AppRole, checked: boolean) => {
    setRoles((prev) => {
      if (checked) return prev.includes(role) ? prev : [...prev, role];
      return prev.filter((item) => item !== role);
    });
  };

  const handleSubmit = async () => {
    const parsed = createUserRequestSchema.safeParse({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      roles,
      isActive: true,
    });
    if (!parsed.success) {
      setError("Revisa correo, nombre, contraseña (mín. 8) y al menos un rol.");
      document.getElementById(emailId)?.focus();
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const user = await createUser(parsed.data);
      reset();
      onOpenChange(false);
      onSuccess?.(user);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para crear usuarios.");
      } else if (apiError.kind === "conflict") {
        setError("Ese correo ya está registrado.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los datos del formulario.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos crear el usuario. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Crear usuario"
      description="Define identidad, contraseña inicial y roles. La acción queda registrada en auditoría del servidor."
      triggerRef={triggerRef}
      footer={
        <S.FormActions>
          <Button
            intent="secondary"
            type="button"
            disabled={isSaving}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            intent="primary"
            type="button"
            isLoading={isSaving}
            onClick={() => {
              void handleSubmit();
            }}
          >
            Crear usuario
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
          label="Nombre completo (obligatorio)"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <TextField
          id={emailId}
          label="Correo (obligatorio)"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextField
          id={passwordId}
          label="Contraseña (obligatorio)"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          description="Mínimo 8 caracteres."
        />
        <RoleFieldset>
          <Legend>Roles (obligatorio)</Legend>
          {ROLE_OPTIONS.map((role) => (
            <Checkbox
              key={role}
              label={ROLE_LABEL[role]}
              checked={roles.includes(role)}
              onCheckedChange={(checked) => toggleRole(role, checked === true)}
            />
          ))}
        </RoleFieldset>
        {error ? <S.FormError role="alert">{error}</S.FormError> : null}
      </S.Form>
    </Sheet>
  );
}
