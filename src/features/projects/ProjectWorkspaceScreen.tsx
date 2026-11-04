"use client";

import {
  SyncEntityType,
  type BudgetResponse,
  type DocumentResponse,
  type ProgressResponse,
  type ProjectResponse,
  type TaskResponse,
  type TaskStatus,
  type UserResponse,
} from "@quantia/contracts";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Badge,
  Button,
  DOCUMENT_STATUS_PRESENTATION,
  Link,
  PROJECT_STATUS_PRESENTATION,
  TASK_STATUS_PRESENTATION,
  Tabs,
} from "@/components/base";
import { FileUploader, TaskRow, type UploadItem } from "@/components/composite";
import { ActivityTimeline, DataTable, type DataTableColumn } from "@/components/page";
import type { SyncStatusValue } from "@/components/system";
import {
  EmptyState,
  ErrorState,
  Skeleton,
  SyncStatus,
  Toast,
  ToastProvider,
} from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { RegisterProgressPanel } from "@/features/progress";
import { useRetrySync } from "@/features/sync";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_BYTES,
  deleteProjectDocument,
  errorStatePropsFromApiError,
  getDocumentDownload,
  getProjectBudget,
  updateProjectTask,
  uploadProjectDocument,
} from "@/lib/api";
import { ApiError } from "@/lib/api/errors";
import { useRateLimitLock } from "@/lib/async/useRateLimitLock";
import {
  canCreateProgress,
  canDeleteDocument,
  canEditTask,
  canViewBudgetDetail,
  landing,
} from "@/lib/auth";
import { formatDate, formatPercent } from "@/lib/format";
import { useFrozenListOrder, useProjectSocket } from "@/lib/socket";

import { EditTaskPanel } from "./EditTaskPanel";
import * as S from "./ProjectWorkspaceScreen.styles";
import { buildRiskComparison, pickPriorityTask, progressFromTasks } from "./projectRisk";
import { useProjectWorkspace } from "./useProjectWorkspace";
import { WORKSPACE_TAB_LABEL, parseWorkspaceTab, type WorkspaceTab } from "./workspaceTab";

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

function workspaceSyncAggregate(
  project: ProjectResponse,
  tasks: TaskResponse[] | null,
  progress: ProgressResponse[] | null,
): SyncStatusValue | null {
  const statuses = [
    project.syncStatus,
    ...(tasks?.map((task) => task.syncStatus) ?? []),
    ...(progress?.map((entry) => entry.syncStatus) ?? []),
  ];
  if (statuses.some((status) => status === "FAILED")) return "failed";
  if (statuses.some((status) => status === "PENDING")) return "pending";
  if (tasks || progress) return "synced";
  return mapSync(project.syncStatus);
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
  const { canRetry, isRetrying, retry } = useRetrySync();
  const [retryingProgressId, setRetryingProgressId] = useState<string | null>(null);

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

  const [toast, setToast] = useState<{
    open: boolean;
    title: string;
    description?: string;
    tone?: "danger" | "success" | "neutral";
  }>({
    open: false,
    title: "",
    tone: "danger",
  });
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const registerTriggerRef = useRef<HTMLSpanElement>(null);
  const manageTaskTriggerRef = useRef<HTMLSpanElement>(null);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [editFocus, setEditFocus] = useState<"assignee" | "dueDate">("dueDate");
  const [budget, setBudget] = useState<BudgetResponse | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<"idle" | "loading" | "ready" | "missing">(
    "idle",
  );
  const [localHighlightId, setLocalHighlightId] = useState<string | null>(null);

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

  const homeHref = landing(user?.roles ?? []) ?? "/mis-tareas";
  const project = boot.status === "ready" ? boot.project : null;
  const { highlightedTaskId, pendingProgressCount, clearPendingProgress, projectDelayedAlert } =
    useProjectSocket(projectId, project);

  const highlightedId = localHighlightId ?? highlightedTaskId;

  useEffect(() => {
    if (!localHighlightId) return;
    const timer = window.setTimeout(() => setLocalHighlightId(null), 1_500);
    return () => window.clearTimeout(timer);
  }, [localHighlightId]);

  const frozenTasks = useFrozenListOrder(tasks.data);
  const allowProgress = user && project ? canCreateProgress(user, project) : false;
  const allowDeleteDoc = user && project ? canDeleteDocument(user, project) : false;
  const allowBudget = Boolean(user && canViewBudgetDetail(user));

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      if (!project || !allowBudget) {
        setBudget(null);
        setBudgetStatus("idle");
        return;
      }
      setBudgetStatus("loading");
      try {
        const result = await getProjectBudget(projectId);
        if (cancelled) return;
        setBudget(result);
        setBudgetStatus("ready");
      } catch (cause: unknown) {
        if (cancelled) return;
        setBudget(null);
        setBudgetStatus("missing");
        void cause;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [allowBudget, project, projectId]);

  const priorityTask = useMemo(
    () => (frozenTasks.items.length ? pickPriorityTask(frozenTasks.items) : null),
    [frozenTasks.items],
  );
  const progressPercent = useMemo(
    () => (tasks.data ? progressFromTasks(tasks.data) : null),
    [tasks.data],
  );
  const riskComparison = useMemo(
    () =>
      buildRiskComparison(
        progressPercent,
        budgetStatus === "ready" && budget ? budget.executedPercent : null,
      ),
    [budget, budgetStatus, progressPercent],
  );

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
      setLocalHighlightId(task.id);
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
    const ui = errorStatePropsFromApiError(boot.error);
    if (ui.variant === "not-found") {
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
    const goHome = ui.variant === "forbidden";
    return (
      <S.Page>
        <ErrorState
          {...ui}
          onRetry={goHome ? () => router.push(homeHref) : reloadProject}
          retryLabel={goHome ? "Volver" : undefined}
        />
      </S.Page>
    );
  }

  if (!user || !project) return null;

  const statusPresentation = PROJECT_STATUS_PRESENTATION[project.status];
  const StatusIcon = statusPresentation.icon;
  const syncAggregate = workspaceSyncAggregate(project, tasks.data, progress.data);

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
      const entrySync = mapSync(entry.syncStatus);
      return {
        id: entry.id,
        at: entry.recordedAt,
        actor: actorLabel(entry.authorId, user),
        text: entry.title,
        evidenceHref: evidence,
        evidenceLabel: evidence ? "Ver evidencia" : undefined,
        syncStatus: entrySync,
        lastSyncedAt: entry.syncStatus === "SYNCED" ? entry.updatedAt : undefined,
        canRetrySync: canRetry && entrySync === "failed",
        isRetryingSync: retryingProgressId === entry.id && isRetrying,
        onRetrySync: () => {
          setRetryingProgressId(entry.id);
          void retry({
            entityType: SyncEntityType.PROGRESS,
            id: entry.id,
            projectId,
          }).then((ok) => {
            setRetryingProgressId(null);
            if (ok) reloadProgress();
            else {
              setToast({
                open: true,
                title: "No se pudo reintentar la sincronización",
                description: "Vuelve a intentarlo en unos segundos.",
                tone: "danger",
              });
            }
          });
        },
      };
    }) ?? [];

  const tabItems = [
    {
      value: "tareas" satisfies WorkspaceTab,
      label: WORKSPACE_TAB_LABEL.tareas,
      content: (
        <TasksPanel
          panel={tasks}
          tasks={frozenTasks.items}
          projectId={projectId}
          project={project}
          user={user}
          highlightedId={highlightedId}
          pendingReorder={frozenTasks.hasPendingReorder}
          pendingCount={frozenTasks.pendingCount}
          onApplyOrder={frozenTasks.applyPendingOrder}
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
          pendingNewCount={pendingProgressCount}
          onApplyNew={clearPendingProgress}
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

  const canManagePriority = Boolean(
    user && project && priorityTask && canEditTask(user, project, priorityTask),
  );

  const openEditTask = (focus: "assignee" | "dueDate") => {
    if (!priorityTask) {
      setToast({
        open: true,
        title: "No hay tarea prioritaria",
        description: "Cuando exista una tarea pendiente podrás gestionarla aquí.",
      });
      return;
    }
    if (!canManagePriority) {
      setToast({
        open: true,
        title: "No puedes editar esta tarea",
        description: "Solo el responsable o quien coordina el proyecto pueden cambiarla.",
      });
      return;
    }
    setEditFocus(focus);
    setEditTaskOpen(true);
  };

  const priorityColumns: DataTableColumn<TaskResponse>[] = [
    {
      id: "title",
      header: "Tarea",
      cell: (row) => row.title,
    },
    {
      id: "assignee",
      header: "Responsable",
      cell: (row) => actorLabel(row.assigneeId, user),
    },
    {
      id: "due",
      header: "Fecha",
      cell: (row) => formatDate(row.dueDate),
    },
    {
      id: "status",
      header: "Estado",
      cell: (row) => {
        const presentation = TASK_STATUS_PRESENTATION[row.status];
        const Icon = presentation.icon;
        return <Badge label={presentation.label} tone={presentation.tone} icon={<Icon />} />;
      },
    },
    {
      id: "action",
      header: "Acción",
      cell: () => (
        <Button intent="secondary" type="button" onClick={() => openEditTask("dueDate")}>
          Editar tarea
        </Button>
      ),
    },
  ];

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>{project.title}</S.Title>
          <S.Subtitle>
            {project.status === "DELAYED"
              ? "Detalle de proyecto en riesgo · alcance de gestión."
              : (project.description ?? "Detalle del proyecto · alcance de gestión.")}
          </S.Subtitle>
          <S.MetaRow>
            <Badge
              label={statusPresentation.label}
              tone={statusPresentation.tone}
              icon={<StatusIcon />}
            />
            <S.Meta>Responsable: {actorLabel(project.coordinatorId, user)}</S.Meta>
            <S.Meta>Fecha límite: {formatDate(project.endDate)}</S.Meta>
          </S.MetaRow>
        </S.HeaderText>
        <S.HeaderActions>
          <span ref={manageTaskTriggerRef}>
            <Button intent="primary" type="button" onClick={() => openEditTask("assignee")}>
              Gestionar tarea
            </Button>
          </span>
          <span ref={registerTriggerRef}>
            <Button
              intent="secondary"
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
              Registrar avance
            </Button>
          </span>
        </S.HeaderActions>
      </S.Header>

      {riskComparison ? (
        <S.Banner $tone="warning" role="status">
          <S.BannerText>
            Desviación de {Math.abs(riskComparison.deviationPoints)} puntos porcentuales entre
            ejecución y avance.
          </S.BannerText>
        </S.Banner>
      ) : null}

      <S.RiskGrid>
        <S.RiskCard>
          <S.RiskCardTitle>
            {project.title}
            {riskComparison ? " · mismo periodo disponible" : " · comparación"}
          </S.RiskCardTitle>
          {riskComparison ? (
            <>
              <S.MetricRow>
                <S.MetricLabelRow>
                  <S.MetricLabel>Avance de investigación</S.MetricLabel>
                  <S.MetricValue>{formatPercent(riskComparison.progressPercent)}</S.MetricValue>
                </S.MetricLabelRow>
                <S.Track>
                  <S.Fill $tone="primary" $percent={riskComparison.progressPercent} />
                </S.Track>
              </S.MetricRow>
              <S.MetricRow>
                <S.MetricLabelRow>
                  <S.MetricLabel>Presupuesto ejecutado</S.MetricLabel>
                  <S.MetricValue>{formatPercent(riskComparison.executedPercent)}</S.MetricValue>
                </S.MetricLabelRow>
                <S.Track>
                  <S.Fill $tone="warning" $percent={riskComparison.executedPercent} />
                </S.Track>
              </S.MetricRow>
              <Link href={`/presupuesto?projectId=${projectId}`}>Ver presupuesto</Link>
            </>
          ) : (
            <S.DecisionBody>
              {budgetStatus === "loading" || tasks.status === "loading"
                ? "Cargando medidas comparables…"
                : "La comparación avance/presupuesto solo aparece cuando ambas medidas están disponibles. No se sustituye un dato ausente por cero."}
            </S.DecisionBody>
          )}
        </S.RiskCard>

        <S.RiskCard>
          <S.DecisionTitle>Próxima decisión</S.DecisionTitle>
          <S.DecisionBody>
            {priorityTask
              ? `${priorityTask.title} requiere seguimiento. Revisa responsable y fecha para acordar la recuperación.`
              : "No hay una tarea prioritaria abierta en este momento."}
          </S.DecisionBody>
          <S.DecisionActions>
            <Button
              intent="secondary"
              type="button"
              disabled={!priorityTask}
              onClick={() => openEditTask("assignee")}
            >
              Reasignar
            </Button>
            <Button
              intent="secondary"
              type="button"
              disabled={!priorityTask}
              onClick={() => openEditTask("dueDate")}
            >
              Cambiar fecha
            </Button>
            <Link href={`/reportes?projectId=${projectId}`}>Generar reporte</Link>
          </S.DecisionActions>
        </S.RiskCard>
      </S.RiskGrid>

      <S.PrioritySection aria-labelledby="project-comments-heading">
        <S.PriorityTitle id="project-comments-heading">Comentarios</S.PriorityTitle>
        <EmptyState
          kind="no-records"
          title="Comentarios no disponibles"
          description="Esta función estará disponible cuando el contrato de la API lo permita. Las menciones tampoco están expuestas aún."
        />
      </S.PrioritySection>

      {priorityTask ? (
        <S.PrioritySection aria-labelledby="priority-task-heading">
          <S.PriorityTitle id="priority-task-heading">Tarea que requiere acción</S.PriorityTitle>
          <DataTable
            caption="Tarea prioritaria"
            columns={priorityColumns}
            rows={[priorityTask]}
            getRowId={(row) => row.id}
          />
        </S.PrioritySection>
      ) : null}

      {rateLimitError ? (
        <WorkspaceRateLimitBanner
          key={`${tab}:${rateLimitError.retryAfterSeconds ?? 0}:${rateLimitError.message}`}
          retryAfterSeconds={rateLimitError.retryAfterSeconds ?? 5}
          onRetry={() => {
            if (tab === "tareas") reloadTasks();
            else if (tab === "bitacora") reloadProgress();
            else reloadDocuments();
          }}
        />
      ) : null}

      {projectDelayedAlert ? (
        <S.Banner $tone="danger" role="status">
          <S.BannerText>
            El proyecto «{projectDelayedAlert.title}» quedó marcado como retrasado.
          </S.BannerText>
        </S.Banner>
      ) : null}
      {syncAggregate && syncAggregate !== "synced" ? (
        <SyncStatus
          status={syncAggregate}
          persisted
          entity="project"
          canRetry={canRetry && syncAggregate === "failed"}
          isLoading={isRetrying && retryingProgressId === null}
          onRetry={() => {
            void retry({
              entityType: SyncEntityType.PROJECT,
              id: projectId,
            }).then((ok) => {
              if (ok) {
                reloadProject();
                reloadTasks();
                reloadProgress();
                return;
              }
              setToast({
                open: true,
                title: "No se pudo reintentar la sincronización",
                description: "Vuelve a intentarlo en unos segundos.",
                tone: "danger",
              });
            });
          }}
        />
      ) : null}
      {syncAggregate === "synced" && (tab === "bitacora" || tab === "tareas") ? (
        <SyncStatus
          status="synced"
          persisted
          entity="project"
          lastSyncedAt={project.syncStatus === "SYNCED" ? project.updatedAt : undefined}
        />
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
          projectTitle: project?.title,
        }))}
        triggerRef={registerTriggerRef}
        onSuccess={() => {
          reloadProgress();
          reloadDocuments();
          if (tab !== "bitacora") setTab("bitacora");
        }}
      />

      <EditTaskPanel
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        project={project}
        task={priorityTask}
        me={user}
        focusField={editFocus}
        triggerRef={manageTaskTriggerRef}
        onSuccess={(updated) => {
          setTaskList((list) => list.map((item) => (item.id === updated.id ? updated : item)));
          setLocalHighlightId(updated.id);
          setToast({
            open: true,
            title: "Tarea actualizada",
            description: updated.title,
            tone: "success",
          });
        }}
      />

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast((prev) => ({ ...prev, open }))}
        title={toast.title}
        description={toast.description}
        tone={toast.tone ?? "danger"}
      />
    </S.Page>
  );
}

function TasksPanel({
  panel,
  tasks,
  projectId,
  project,
  user,
  highlightedId,
  pendingReorder,
  pendingCount,
  onApplyOrder,
  onToggle,
  onRetry,
}: {
  panel: { status: string; data: TaskResponse[] | null; error: ApiError | null };
  tasks: TaskResponse[];
  projectId: string;
  project: ProjectResponse;
  user: UserResponse;
  highlightedId: string | null;
  pendingReorder: boolean;
  pendingCount: number;
  onApplyOrder: () => void;
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
      {pendingReorder ? (
        <S.Banner $tone="info" role="status">
          <S.BannerText>
            {pendingCount > 1
              ? `Lista actualizada · ${pendingCount} cambios nuevos`
              : "Lista actualizada · Reordenar"}
          </S.BannerText>
          <Button type="button" intent="secondary" size="md" onClick={onApplyOrder}>
            Aplicar orden
          </Button>
        </S.Banner>
      ) : null}
      <S.TaskList>
        {tasks.map((task) => (
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
  pendingNewCount,
  onApplyNew,
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
  pendingNewCount: number;
  onApplyNew: () => void;
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
      {pendingNewCount > 0 ? (
        <S.Banner $tone="info" role="status">
          <S.BannerText>
            {pendingNewCount === 1 ? "1 avance nuevo" : `${pendingNewCount} avances nuevos`}
          </S.BannerText>
          <Button type="button" intent="secondary" size="md" onClick={onApplyNew}>
            Ver actualizaciones
          </Button>
        </S.Banner>
      ) : null}
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

function WorkspaceRateLimitBanner({
  retryAfterSeconds,
  onRetry,
}: {
  retryAfterSeconds: number;
  onRetry: () => void;
}) {
  const { locked, remaining } = useRateLimitLock(retryAfterSeconds);

  return (
    <S.Banner $tone="warning" role="status">
      <S.BannerText>
        Estamos procesando demasiadas solicitudes.
        {locked ? ` Podrás reintentar en ${remaining} s.` : " Ya puedes volver a intentarlo."}
      </S.BannerText>
      <Button intent="secondary" size="md" type="button" disabled={locked} onClick={onRetry}>
        Reintentar
      </Button>
    </S.Banner>
  );
}
