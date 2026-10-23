"use client";

import type {
  DocumentResponse,
  ProgressResponse,
  ProjectResponse,
  TaskResponse,
  TaskStatus,
  UserResponse,
} from "@quantia/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Badge,
  Button,
  DOCUMENT_STATUS_PRESENTATION,
  PROJECT_STATUS_PRESENTATION,
  Tabs,
} from "@/components/base";
import { FileUploader, TaskRow, type UploadItem } from "@/components/composite";
import { ActivityTimeline, DataTable, type DataTableColumn } from "@/components/page";
import type { SyncStatusValue } from "@/components/system";
import { EmptyState, ErrorState, Skeleton, Toast, ToastProvider } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { RegisterProgressPanel } from "@/features/progress";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_BYTES,
  deleteProjectDocument,
  getDocumentDownload,
  updateProjectTask,
  uploadProjectDocument,
} from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { canCreateProgress, canDeleteDocument, canEditTask, landing } from "@/lib/auth";
import { formatDate } from "@/lib/format";

import * as S from "./ProjectWorkspaceScreen.styles";
import { useProjectWorkspace } from "./useProjectWorkspace";
import { WORKSPACE_TAB_LABEL, parseWorkspaceTab, type WorkspaceTab } from "./workspaceTab";

const HIGHLIGHT_MS = 1500;

function mapSync(status: "PENDING" | "SYNCED" | "FAILED"): SyncStatusValue {
  if (status === "PENDING") return "pending";
  if (status === "FAILED") return "failed";
  return "synced";
}

function actorLabel(userId: string | null, me: UserResponse): string {
  if (!userId) return "Sin asignar";
  if (userId === me.id) return me.fullName;
  return "Integrante del proyecto";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(kb)} KB`;
  }
  return `${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 1 }).format(kb / 1024)} MB`;
}

function mimeLabel(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/png") return "PNG";
  if (mimeType === "image/jpeg") return "JPEG";
  if (mimeType.includes("spreadsheet")) return "XLSX";
  return mimeType;
}

function workspaceSyncBanner(
  project: ProjectResponse,
  tasks: TaskResponse[] | null,
  progress: ProgressResponse[] | null,
): { tone: "info" | "success" | "warning"; message: string } | null {
  const statuses = [
    project.syncStatus,
    ...(tasks?.map((task) => task.syncStatus) ?? []),
    ...(progress?.map((entry) => entry.syncStatus) ?? []),
  ];
  if (statuses.some((status) => status === "FAILED")) {
    return {
      tone: "warning",
      message:
        "Hay datos guardados que no se pudieron sincronizar con Notion. Puedes seguir trabajando en Quantia.",
    };
  }
  if (statuses.some((status) => status === "PENDING")) {
    return {
      tone: "info",
      message: "Sincronizando cambios con Notion…",
    };
  }
  if (tasks || progress) {
    return {
      tone: "success",
      message: "Los cambios están sincronizados con Notion.",
    };
  }
  return null;
}

export interface ProjectWorkspaceScreenProps {
  projectId: string;
}

export function ProjectWorkspaceScreen({ projectId }: ProjectWorkspaceScreenProps) {
  return (
    <ToastProvider>
      <ProjectWorkspaceBody projectId={projectId} />
    </ToastProvider>
  );
}

function ProjectWorkspaceBody({ projectId }: ProjectWorkspaceScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseWorkspaceTab(searchParams.get("tab"));
  const { user } = useAuth();

  const {
    boot,
    tasks,
    progress,
    documents,
    reloadProject,
    reloadTasks,
    reloadProgress,
    reloadDocuments,
    setTaskList,
    setDocumentList,
  } = useProjectWorkspace(projectId, tab);

  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ open: boolean; title: string; description?: string }>({
    open: false,
    title: "",
  });
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const registerTriggerRef = useRef<HTMLSpanElement>(null);

  const setTab = useCallback(
    (next: string) => {
      const value = parseWorkspaceTab(next);
      const params = new URLSearchParams(searchParams.toString());
      if (value === "tareas") params.delete("tab");
      else params.set("tab", value);
      const query = params.toString();
      router.replace(query ? `/proyectos/${projectId}?${query}` : `/proyectos/${projectId}`, {
        scroll: false,
      });
    },
    [projectId, router, searchParams],
  );

  useEffect(() => {
    if (!highlightedId) return;
    const timer = window.setTimeout(() => setHighlightedId(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [highlightedId]);

  const homeHref = landing(user?.roles ?? []) ?? "/mis-tareas";
  const project = boot.status === "ready" ? boot.project : null;
  const allowProgress = user && project ? canCreateProgress(user, project) : false;
  const allowDeleteDoc = user && project ? canDeleteDocument(user, project) : false;

  const onToggleTask = useCallback(
    async (task: TaskResponse, checked: boolean) => {
      if (!user || !project || !canEditTask(user, project, task)) return;
      const previous = task;
      const nextStatus: TaskStatus = checked ? "DONE" : "TODO";
      const optimistic: TaskResponse = {
        ...task,
        status: nextStatus,
        syncStatus: "PENDING",
      };
      setTaskList((list) => list.map((item) => (item.id === task.id ? optimistic : item)));
      setHighlightedId(task.id);
      try {
        const saved = await updateProjectTask(projectId, task.id, { status: nextStatus });
        setTaskList((list) => list.map((item) => (item.id === task.id ? saved : item)));
      } catch (cause: unknown) {
        setTaskList((list) => list.map((item) => (item.id === task.id ? previous : item)));
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setToast({
          open: true,
          title: "No se pudo actualizar la tarea",
          description: error.message,
        });
      }
    },
    [project, projectId, setTaskList, user],
  );

  const onDownload = useCallback(
    async (doc: DocumentResponse) => {
      if (doc.status !== "SCANNED") return;
      setDownloadingId(doc.id);
      try {
        const { url } = await getDocumentDownload(projectId, doc.id);
        window.open(url, "_blank", "noopener,noreferrer");
      } catch (cause: unknown) {
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setToast({
          open: true,
          title: "No se pudo descargar el documento",
          description: error.message,
        });
      } finally {
        setDownloadingId(null);
      }
    },
    [projectId],
  );

  const onDeleteDoc = useCallback(
    async (doc: DocumentResponse) => {
      if (!allowDeleteDoc) return;
      try {
        await deleteProjectDocument(projectId, doc.id);
        setDocumentList((list) => list.filter((item) => item.id !== doc.id));
      } catch (cause: unknown) {
        const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
        setToast({
          open: true,
          title: "No se pudo eliminar el documento",
          description: error.message,
        });
      }
    },
    [allowDeleteDoc, projectId, setDocumentList],
  );

  const onSelectFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const id = `${file.name}-${file.size}-${Date.now()}`;
        setUploads((prev) => [
          ...prev,
          { id, name: file.name, sizeBytes: file.size, status: "uploading", progress: 0 },
        ]);
        void uploadProjectDocument(projectId, file, {
          onProgress: (ratio) => {
            setUploads((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, progress: Math.round(ratio * 100) } : item,
              ),
            );
          },
        })
          .then((created) => {
            setUploads((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "done", progress: 100 } : item,
              ),
            );
            setDocumentList((list) => [created, ...list]);
          })
          .catch((cause: unknown) => {
            const error = cause instanceof ApiError ? cause : new ApiError("unknown", null);
            setUploads((prev) =>
              prev.map((item) =>
                item.id === id ? { ...item, status: "error", error: error.message } : item,
              ),
            );
          });
      }
    },
    [projectId, setDocumentList],
  );

  if (boot.status === "loading") {
    return (
      <S.Page aria-busy="true">
        <Skeleton variant="card" />
        <Skeleton variant="list" rows={4} />
      </S.Page>
    );
  }

  if (boot.status === "error") {
    if (boot.error.kind === "forbidden") {
      return (
        <S.Page>
          <ErrorState
            variant="forbidden"
            onRetry={() => router.push(homeHref)}
            retryLabel="Volver"
          />
        </S.Page>
      );
    }
    if (boot.error.kind === "not_found") {
      return (
        <S.Page>
          <S.Centered>
            <ErrorState
              variant="not-found"
              title="No encontramos esta página"
              description="El proyecto no existe o ya no está disponible."
              onRetry={() => router.push(homeHref)}
              retryLabel="Volver a mi Inicio"
            />
          </S.Centered>
        </S.Page>
      );
    }
    if (boot.error.kind === "rate_limited") {
      return (
        <S.Page>
          <ErrorState
            variant="rate-limit"
            retryAfterSeconds={boot.error.retryAfterSeconds}
            onRetry={reloadProject}
          />
        </S.Page>
      );
    }
    return (
      <S.Page>
        <ErrorState variant="server" onRetry={reloadProject} />
      </S.Page>
    );
  }

  if (!user || !project) return null;

  const statusPresentation = PROJECT_STATUS_PRESENTATION[project.status];
  const StatusIcon = statusPresentation.icon;
  const syncBanner = workspaceSyncBanner(project, tasks.data, progress.data);

  const documentColumns: DataTableColumn<DocumentResponse>[] = [
    {
      id: "name",
      header: "Documento",
      cell: (row) => row.originalName,
    },
    {
      id: "type",
      header: "Tipo / Tamaño",
      cell: (row) => `${mimeLabel(row.mimeType)} · ${formatFileSize(row.sizeBytes)}`,
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => {
        const presentation = DOCUMENT_STATUS_PRESENTATION[row.status];
        const Icon = presentation.icon;
        return <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;
      },
    },
    {
      id: "action",
      header: "Acción",
      cell: (row) => (
        <>
          {row.status === "SCANNED" ? (
            <Button
              intent="secondary"
              size="md"
              type="button"
              isLoading={downloadingId === row.id}
              onClick={() => void onDownload(row)}
            >
              Descargar
            </Button>
          ) : null}
          {allowDeleteDoc ? (
            <Button intent="danger" size="md" type="button" onClick={() => void onDeleteDoc(row)}>
              Eliminar
            </Button>
          ) : null}
        </>
      ),
    },
  ];

  const timelineItems =
    progress.data?.map((entry) => {
      const evidence = entry.evidenceLinks.find((link) => /^https?:\/\//i.test(link));
      return {
        id: entry.id,
        at: entry.recordedAt,
        actor: actorLabel(entry.authorId, user),
        text: entry.title,
        evidenceHref: evidence,
        evidenceLabel: evidence ? "Ver evidencia" : undefined,
        syncStatus: mapSync(entry.syncStatus),
      };
    }) ?? [];

  const tabItems = [
    {
      value: "tareas" satisfies WorkspaceTab,
      label: WORKSPACE_TAB_LABEL.tareas,
      content: (
        <TasksPanel
          panel={tasks}
          projectId={projectId}
          project={project}
          user={user}
          highlightedId={highlightedId}
          onToggle={onToggleTask}
          onRetry={reloadTasks}
        />
      ),
    },
    {
      value: "bitacora" satisfies WorkspaceTab,
      label: WORKSPACE_TAB_LABEL.bitacora,
      content: (
        <BitacoraPanel
          panel={progress}
          items={timelineItems}
          onRetry={reloadProgress}
          canCreate={allowProgress}
        />
      ),
    },
    {
      value: "documentos" satisfies WorkspaceTab,
      label: WORKSPACE_TAB_LABEL.documentos,
      content: (
        <DocumentsPanel
          panel={documents}
          columns={documentColumns}
          onRetry={reloadDocuments}
          canUpload={allowProgress}
          uploads={uploads}
          onSelectFiles={onSelectFiles}
        />
      ),
    },
  ];

  const rateLimitError =
    (tab === "tareas" && tasks.error?.kind === "rate_limited" && tasks.error) ||
    (tab === "bitacora" && progress.error?.kind === "rate_limited" && progress.error) ||
    (tab === "documentos" && documents.error?.kind === "rate_limited" && documents.error) ||
    null;

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.TitleRow>
            <S.Title>{project.title}</S.Title>
            <Badge
              label={statusPresentation.label}
              tone={statusPresentation.tone}
              icon={<StatusIcon />}
            />
          </S.TitleRow>
          {project.description ? <S.Subtitle>{project.description}</S.Subtitle> : null}
          <S.Meta>
            Responsable: {actorLabel(project.coordinatorId, user)}
            {" · "}
            Fecha límite: {formatDate(project.endDate)}
          </S.Meta>
        </S.HeaderText>
        <S.HeaderActions>
          <span ref={registerTriggerRef}>
            <Button
              intent="primary"
              type="button"
              onClick={() => {
                if (!allowProgress) {
                  setToast({
                    open: true,
                    title: "No puedes registrar avance",
                    description: "No tienes permiso para registrar avances en este proyecto.",
                  });
                  return;
                }
                setRegisterOpen(true);
              }}
            >
              Registrar Avance
            </Button>
          </span>
        </S.HeaderActions>
      </S.Header>

      {rateLimitError ? (
        <S.Banner $tone="warning" role="status">
          <S.BannerText>
            Estamos procesando demasiadas solicitudes. Espera un momento antes de volver a
            intentarlo
            {rateLimitError.retryAfterSeconds !== undefined
              ? ` (${rateLimitError.retryAfterSeconds} s).`
              : "."}
          </S.BannerText>
          <Button
            intent="secondary"
            size="md"
            type="button"
            onClick={() => {
              if (tab === "tareas") reloadTasks();
              else if (tab === "bitacora") reloadProgress();
              else reloadDocuments();
            }}
          >
            Reintentar
          </Button>
        </S.Banner>
      ) : null}

      {syncBanner && syncBanner.tone !== "success" ? (
        <S.Banner $tone={syncBanner.tone} role="status">
          <S.BannerText>{syncBanner.message}</S.BannerText>
        </S.Banner>
      ) : null}
      {syncBanner?.tone === "success" && (tab === "bitacora" || tab === "tareas") ? (
        <S.Banner $tone="success" role="status">
          <S.BannerText>{syncBanner.message}</S.BannerText>
        </S.Banner>
      ) : null}

      <Tabs label="Secciones del proyecto" value={tab} onValueChange={setTab} items={tabItems} />

      <RegisterProgressPanel
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        projectId={projectId}
        taskOptions={(tasks.data ?? []).map((task) => ({
          value: task.id,
          label: task.title,
          projectId,
        }))}
        triggerRef={registerTriggerRef}
        onSuccess={() => {
          reloadProgress();
          reloadDocuments();
          if (tab !== "bitacora") setTab("bitacora");
        }}
      />

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.title}
        description={toast.description}
        tone="danger"
      />
    </S.Page>
  );
}

function TasksPanel({
  panel,
  projectId,
  project,
  user,
  highlightedId,
  onToggle,
  onRetry,
}: {
  panel: { status: string; data: TaskResponse[] | null; error: ApiError | null };
  projectId: string;
  project: ProjectResponse;
  user: UserResponse;
  highlightedId: string | null;
  onToggle: (task: TaskResponse, checked: boolean) => void;
  onRetry: () => void;
}) {
  if (panel.status === "loading" && !panel.data) {
    return <Skeleton variant="list" rows={5} />;
  }
  if (panel.status === "error" && !panel.data) {
    if (panel.error?.kind === "rate_limited") {
      return (
        <ErrorState
          variant="rate-limit"
          retryAfterSeconds={panel.error.retryAfterSeconds}
          onRetry={onRetry}
        />
      );
    }
    return <ErrorState variant="server" onRetry={onRetry} />;
  }
  if (!panel.data || panel.data.length === 0) {
    return (
      <EmptyState
        kind="no-records"
        title="Aún no hay tareas en este proyecto"
        description="Cuando se asignen tareas, aparecerán aquí ordenadas por fecha límite."
      />
    );
  }

  return (
    <S.Panel>
      <S.TaskList>
        {panel.data.map((task) => (
          <S.TaskListItem key={task.id}>
            <TaskRow
              title={task.title}
              href={`/proyectos/${projectId}?tab=tareas`}
              assignee={actorLabel(task.assigneeId, user)}
              status={task.status}
              due={task.dueDate}
              canUpdate={canEditTask(user, project, task)}
              checked={task.status === "DONE"}
              onCheckedChange={(checked) => onToggle(task, checked)}
              highlighted={highlightedId === task.id}
            />
          </S.TaskListItem>
        ))}
      </S.TaskList>
    </S.Panel>
  );
}

function BitacoraPanel({
  panel,
  items,
  onRetry,
  canCreate,
}: {
  panel: { status: string; data: ProgressResponse[] | null; error: ApiError | null };
  items: Array<{
    id: string;
    at: string;
    actor: string;
    text: string;
    evidenceHref?: string;
    evidenceLabel?: string;
    syncStatus?: SyncStatusValue;
  }>;
  onRetry: () => void;
  canCreate: boolean;
}) {
  if (panel.status === "loading" && !panel.data) {
    return <Skeleton variant="list" rows={4} />;
  }
  if (panel.status === "error" && !panel.data) {
    if (panel.error?.kind === "rate_limited") {
      return (
        <ErrorState
          variant="rate-limit"
          retryAfterSeconds={panel.error.retryAfterSeconds}
          onRetry={onRetry}
        />
      );
    }
    return <ErrorState variant="server" onRetry={onRetry} />;
  }
  if (!panel.data || panel.data.length === 0) {
    return (
      <EmptyState
        kind="no-records"
        title="La bitácora está vacía"
        description={
          canCreate
            ? "Registra el primer avance para dejar constancia del trabajo del proyecto."
            : "Cuando haya avances registrados, aparecerán en orden cronológico."
        }
      />
    );
  }

  return (
    <S.Panel>
      <ActivityTimeline items={items} />
    </S.Panel>
  );
}

function DocumentsPanel({
  panel,
  columns,
  onRetry,
  canUpload,
  uploads,
  onSelectFiles,
}: {
  panel: { status: string; data: DocumentResponse[] | null; error: ApiError | null };
  columns: DataTableColumn<DocumentResponse>[];
  onRetry: () => void;
  canUpload: boolean;
  uploads: UploadItem[];
  onSelectFiles: (files: File[]) => void;
}) {
  if (panel.status === "loading" && !panel.data) {
    return <Skeleton variant="table" />;
  }
  if (panel.status === "error" && !panel.data) {
    if (panel.error?.kind === "rate_limited") {
      return (
        <ErrorState
          variant="rate-limit"
          retryAfterSeconds={panel.error.retryAfterSeconds}
          onRetry={onRetry}
        />
      );
    }
    return <ErrorState variant="server" onRetry={onRetry} />;
  }

  return (
    <S.Panel>
      {canUpload ? (
        <FileUploader
          label="Adjuntar documento"
          accept={DOCUMENT_ACCEPT}
          maxBytes={DOCUMENT_MAX_BYTES}
          files={uploads}
          onSelect={onSelectFiles}
        />
      ) : null}
      <DataTable
        caption="Documentos del proyecto"
        columns={columns}
        rows={panel.data ?? []}
        getRowId={(row) => row.id}
        emptyState={
          <EmptyState
            kind="no-records"
            title="No hay documentos"
            description="Los archivos verificados del proyecto aparecerán en esta tabla."
          />
        }
      />
    </S.Panel>
  );
}
