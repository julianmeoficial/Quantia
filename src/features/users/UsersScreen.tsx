"use client";

import type { UserResponse } from "@quantia/contracts";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

import { Badge, Button, Select } from "@/components/base";
import { DataTable, type DataTableColumn } from "@/components/page";
import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Skeleton,
  Toast,
  ToastProvider,
} from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { USERS_LIST_FILTER_DEFAULTS, usersListFiltersSchema } from "@/features/filters";
import { updateUser } from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { canAccess, canManageUsers } from "@/lib/auth";
import { ROLE_LABEL, type AppRole } from "@/lib/auth/navigation";
import { formatDate } from "@/lib/format";
import { useUrlFilters } from "@/lib/url";

import { CreateUserPanel } from "./CreateUserPanel";
import { DeleteUserPanel } from "./DeleteUserPanel";
import { EditUserPanel } from "./EditUserPanel";
import { useUsersList } from "./useUsersList";
import * as S from "../tasks/sectionPage.styles";

const ActionError = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.status.error.text};
  font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
  line-height: ${({ theme }) => theme.typography.bodySmall.lineHeight};
`;

const SORT_OPTIONS = [
  { value: "desc", label: "Más recientes primero" },
  { value: "asc", label: "Más antiguos primero" },
];

function rolesLabel(roles: readonly string[]): string {
  return roles.map((role) => ROLE_LABEL[role as AppRole] ?? role).join(", ");
}

export function UsersScreen() {
  return (
    <ToastProvider>
      <UsersBody />
    </ToastProvider>
  );
}

function UsersBody() {
  const router = useRouter();
  const { identity, user } = useAuth();
  const createTriggerRef = useRef<HTMLSpanElement>(null);
  const editTriggerRef = useRef<HTMLSpanElement>(null);

  const { values, setFilters } = useUrlFilters({
    schema: usersListFiltersSchema,
    defaults: USERS_LIST_FILTER_DEFAULTS,
    pathname: "/usuarios",
  });

  const { status, users, total, error, stale, reload } = useUsersList(values);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserResponse | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });

  const roles = (identity?.roles ?? []) as readonly AppRole[];
  const allowed = canAccess("/usuarios", roles) && Boolean(user && canManageUsers(user));

  const reactivateUser = useCallback(
    async (target: UserResponse) => {
      setActionError(null);
      setIsActing(true);
      try {
        await updateUser(target.id, { isActive: true });
        setToast({ open: true, title: "Usuario reactivado" });
        reload();
      } catch (cause: unknown) {
        const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setActionError(
          apiError.kind === "forbidden"
            ? "No tienes permiso para reactivar usuarios."
            : "No pudimos reactivar el usuario.",
        );
      } finally {
        setIsActing(false);
      }
    },
    [reload],
  );

  const columns = useMemo(
    (): DataTableColumn<UserResponse>[] => [
      {
        id: "fullName",
        header: "Nombre",
        cell: (row) => row.fullName,
      },
      {
        id: "status",
        header: "Estado",
        cell: (row) => (
          <Badge
            label={row.isActive ? "Activo" : "Inactivo"}
            tone={row.isActive ? "success" : "neutral"}
          />
        ),
      },
      {
        id: "email",
        header: "Correo",
        cell: (row) => row.email,
      },
      {
        id: "roles",
        header: "Roles",
        cell: (row) => rolesLabel(row.roles),
      },
      {
        id: "updatedAt",
        header: "Actualizado",
        cell: (row) => formatDate(row.updatedAt, { withTime: true }),
      },
      {
        id: "actions",
        header: "Acciones",
        cell: (row) => (
          <S.HeaderActions>
            <Button type="button" intent="secondary" onClick={() => setEditing(row)}>
              Editar
            </Button>
            {row.isActive ? (
              <Button type="button" intent="danger" onClick={() => setDeactivateTarget(row)}>
                Desactivar
              </Button>
            ) : (
              <Button
                type="button"
                intent="secondary"
                disabled={isActing}
                onClick={() => {
                  void reactivateUser(row);
                }}
              >
                Reactivar
              </Button>
            )}
            <Button type="button" intent="danger" onClick={() => setDeleteTarget(row)}>
              Eliminar
            </Button>
          </S.HeaderActions>
        ),
      },
    ],
    [isActing, reactivateUser],
  );

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setIsActing(true);
    setActionError(null);
    try {
      await updateUser(deactivateTarget.id, { isActive: false });
      setDeactivateTarget(null);
      setToast({ open: true, title: "Usuario desactivado" });
      reload();
    } catch (cause: unknown) {
      const apiError = cause instanceof ApiError ? cause : new ApiError("unknown", null);
      setActionError(
        apiError.kind === "forbidden"
          ? "No tienes permiso para desactivar usuarios."
          : "No pudimos desactivar el usuario.",
      );
    } finally {
      setIsActing(false);
    }
  };

  if (!allowed) {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  if (status === "error" && error?.kind === "forbidden") {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  if (status === "error" && error?.kind === "rate_limited") {
    return (
      <ErrorState
        variant="rate-limit"
        retryAfterSeconds={error.retryAfterSeconds}
        onRetry={reload}
      />
    );
  }

  if (status === "error") {
    return <ErrorState variant="server" onRetry={reload} />;
  }

  const isBootLoading = status === "idle" || (status === "loading" && users.length === 0);

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>Usuarios</S.Title>
          <S.Subtitle>
            Administración de cuentas y roles. Preferimos desactivar; eliminar es irreversible.
          </S.Subtitle>
        </S.HeaderText>
        <S.HeaderActions>
          <span ref={createTriggerRef}>
            <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
              Crear usuario
            </Button>
          </span>
        </S.HeaderActions>
      </S.Header>

      <Select
        label="Orden"
        options={SORT_OPTIONS}
        value={values.sortOrder}
        onValueChange={(sortOrder) =>
          setFilters({ sortOrder: sortOrder as typeof values.sortOrder, page: 1 })
        }
      />

      {stale ? (
        <S.StaleBanner role="status">
          <S.StaleText>Contenido desactualizado</S.StaleText>
          <Button intent="secondary" type="button" onClick={reload}>
            Reintentar
          </Button>
        </S.StaleBanner>
      ) : null}

      {actionError ? <ActionError role="alert">{actionError}</ActionError> : null}

      {isBootLoading ? (
        <Skeleton variant="table" />
      ) : (
        <>
          <span ref={editTriggerRef} hidden />
          <DataTable
            caption="Usuarios del sistema"
            columns={columns}
            rows={users}
            getRowId={(row) => row.id}
            isLoading={status === "loading"}
            emptyState={
              <EmptyState
                kind="no-records"
                title="Sin usuarios"
                description="Crea el primer usuario administrativo o de investigación."
                action={
                  <Button intent="primary" type="button" onClick={() => setCreateOpen(true)}>
                    Crear usuario
                  </Button>
                }
              />
            }
            pagination={
              total > 0
                ? {
                    page: values.page,
                    pageSize: values.pageSize,
                    totalItems: total,
                    onPageChange: (page) => setFilters({ page }),
                    onPageSizeChange: (pageSize) => setFilters({ page: 1, pageSize }),
                  }
                : undefined
            }
          />
        </>
      )}

      <CreateUserPanel
        open={createOpen}
        onOpenChange={setCreateOpen}
        triggerRef={createTriggerRef}
        onSuccess={() => {
          setToast({ open: true, title: "Usuario creado" });
          reload();
        }}
      />

      {editing ? (
        <EditUserPanel
          open
          user={editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          triggerRef={editTriggerRef}
          onSuccess={() => {
            setEditing(null);
            setToast({ open: true, title: "Usuario actualizado" });
            reload();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeactivateTarget(null);
        }}
        title="Desactivar usuario"
        description={
          deactivateTarget
            ? `Se desactivará a «${deactivateTarget.fullName}». Podrá reactivarse después. Preferimos esta acción al borrado.`
            : "Se desactivará el usuario seleccionado."
        }
        confirmLabel="Desactivar"
        isLoading={isActing}
        onConfirm={() => {
          void handleDeactivate();
        }}
      />

      <DeleteUserPanel
        open={deleteTarget !== null}
        user={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onSuccess={() => {
          setDeleteTarget(null);
          setToast({ open: true, title: "Usuario eliminado" });
          reload();
        }}
      />

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.title}
        description={toast.description}
        tone="success"
      />
    </S.Page>
  );
}
