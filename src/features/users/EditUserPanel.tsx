"use client";

import { RoleName, type UserResponse } from "@quantia/contracts";
import { updateUserRequestSchema } from "@quantia/contracts";
import { useId, useState, type RefObject } from "react";
import styled from "styled-components";

import { Button, Checkbox, Switch, TextField } from "@/components/base";
import { Sheet } from "@/components/system";
import { updateUser } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { ROLE_LABEL, type AppRole } from "@/lib/auth/navigation";

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

export interface EditUserPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserResponse;
  onSuccess?: (user: UserResponse) => void;
  triggerRef?: RefObject<HTMLElement | null>;
}

function EditUserForm({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: UserResponse;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: UserResponse) => void;
}) {
  const emailId = useId();
  const nameId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.fullName);
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<AppRole[]>([...user.roles] as AppRole[]);
  const [isActive, setIsActive] = useState(user.isActive);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const toggleRole = (role: AppRole, checked: boolean) => {
    setRoles((prev) => {
      if (checked) return prev.includes(role) ? prev : [...prev, role];
      return prev.filter((item) => item !== role);
    });
  };

  const handleClose = () => {
    if (isSaving) return;
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const body: {
      email: string;
      fullName: string;
      roles: AppRole[];
      isActive: boolean;
      password?: string;
    } = {
      email: email.trim(),
      fullName: fullName.trim(),
      roles,
      isActive,
    };
    if (password.trim()) body.password = password;

    const parsed = updateUserRequestSchema.safeParse(body);
    if (!parsed.success) {
      setError("Revisa correo, nombre y al menos un rol. La contraseña, si la cambias, mínimo 8.");
      document.getElementById(nameId)?.focus();
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const next = await updateUser(user.id, parsed.data);
      onOpenChange(false);
      onSuccess?.(next);
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      if (apiError.kind === "forbidden") {
        setError("No tienes permiso para editar este usuario.");
      } else if (apiError.kind === "conflict") {
        setError("Ese correo ya está registrado.");
      } else if (apiError.kind === "validation") {
        setError("Revisa los datos del formulario.");
      } else if (apiError.kind === "not_found") {
        setError("No encontrado.");
      } else if (apiError.kind === "rate_limited") {
        setError("Estamos procesando demasiadas solicitudes. Inténtalo de nuevo en unos segundos.");
      } else {
        setError("No pudimos guardar los cambios. Inténtalo de nuevo.");
      }
      setIsSaving(false);
    }
  };

  return (
    <Sheet
      open
      onOpenChange={(next) => {
        if (!next) handleClose();
      }}
      title="Editar usuario"
      description={`Actualiza roles o estado de «${user.fullName}». Preferimos desactivar antes que eliminar.`}
      footer={
        <S.FormActions>
          <Button intent="secondary" type="button" disabled={isSaving} onClick={handleClose}>
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
            Guardar cambios
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
          label="Nueva contraseña (opcional)"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          description="Déjala vacía para no cambiarla."
        />
        <Switch
          label="Usuario activo"
          checked={isActive}
          onCheckedChange={(checked) => setIsActive(checked)}
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

export function EditUserPanel({
  open,
  onOpenChange,
  user,
  onSuccess,
  triggerRef,
}: EditUserPanelProps) {
  if (!open) return null;

  return (
    <span ref={triggerRef}>
      <EditUserForm
        key={`${user.id}:${user.updatedAt}`}
        user={user}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    </span>
  );
}
