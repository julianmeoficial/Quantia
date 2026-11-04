"use client";

import {
  RealtimeEvent,
  RealtimeNamespace,
  joinProjectRoomSchema,
  type TaskResponse,
  type TareaActualizadaPayload,
} from "@quantia/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { queryKeys } from "@/lib/api/query-keys";
import { refreshAccessToken } from "@/lib/api/session";
import { canManageProject, canViewBudgetDetail } from "@/lib/auth";
import type { ProjectResponse } from "@quantia/contracts";

import {
  clearNamespacePause,
  disconnectNamespace,
  getSocket,
  isNamespacePaused,
  reconnectSocket,
} from "./connection";
import { parseRealtimePayload } from "./events";
import { noticeFromBudgetLow, pushSessionNotice } from "./sessionNotices";

const WORKSPACE_TASKS_PARAMS = {
  page: 1,
  pageSize: 50,
  sortBy: "dueDate" as const,
  sortOrder: "asc" as const,
};

const HIGHLIGHT_MS = 1_500;

export type ProjectSocketState = {
  highlightedTaskId: string | null;
  pendingProgressCount: number;
  clearPendingProgress: () => void;
  projectDelayedAlert: { projectId: string; title: string } | null;
};

type JoinAck = { ok: true; room: string } | { ok: false; error: string };

function patchTaskFromPayload(
  current: TaskResponse[] | undefined,
  payload: TareaActualizadaPayload,
): TaskResponse[] | undefined {
  if (!current) return current;
  return current.map((task) => {
    if (task.id !== payload.taskId) return task;
    return {
      ...task,
      title: payload.title,
      status: payload.status,
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      updatedAt: payload.updatedAt,
    };
  });
}

export function useProjectSocket(
  projectId: string,
  project: ProjectResponse | null,
): ProjectSocketState {
  const { status: authStatus, user } = useAuth();
  const queryClient = useQueryClient();
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [pendingProgressCount, setPendingProgressCount] = useState(0);
  const [projectDelayedAlert, setProjectDelayedAlert] = useState<{
    projectId: string;
    title: string;
  } | null>(null);
  const joinFailed = useRef(false);
  const authRetryUsed = useRef(false);
  const highlightTimer = useRef<number | null>(null);

  const clearPendingProgress = useCallback(() => {
    setPendingProgressCount(0);
  }, []);

  const flashTask = useCallback((taskId: string) => {
    setHighlightedTaskId(taskId);
    if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => {
      setHighlightedTaskId(null);
      highlightTimer.current = null;
    }, HIGHLIGHT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimer.current !== null) window.clearTimeout(highlightTimer.current);
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "authenticated" || !projectId) return;

    joinFailed.current = false;
    authRetryUsed.current = false;

    if (isNamespacePaused(RealtimeNamespace.PROJECTS)) {
      return;
    }

    const socket = getSocket(RealtimeNamespace.PROJECTS);

    const joinRoom = () => {
      if (joinFailed.current || !socket.connected) return;
      const body = joinProjectRoomSchema.parse({ projectId });
      socket.emit("join", body, (ack: JoinAck) => {
        if (!ack?.ok) {
          joinFailed.current = true;
        }
      });
    };

    const onConnect = () => {
      authRetryUsed.current = false;
      joinRoom();
    };

    const onConnectError = () => {
      if (authRetryUsed.current) return;
      authRetryUsed.current = true;
      void refreshAccessToken().then((token) => {
        if (!token) return;
        reconnectSocket(RealtimeNamespace.PROJECTS);
      });
    };

    const onTaskUpdated = (raw: unknown) => {
      const payload = parseRealtimePayload(RealtimeEvent.TAREA_ACTUALIZADA, raw);
      if (!payload || payload.projectId !== projectId) return;

      queryClient.setQueryData<TaskResponse[]>(
        queryKeys.tasks(projectId, WORKSPACE_TASKS_PARAMS),
        (current) => patchTaskFromPayload(current, payload),
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.task(projectId, payload.taskId) });
      if (user) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.myTasks(user.id) });
      }
      flashTask(payload.taskId);
    };

    const onProgress = (raw: unknown) => {
      const payload = parseRealtimePayload(RealtimeEvent.AVANCE_REGISTRADO, raw);
      if (!payload || payload.projectId !== projectId) return;
      void queryClient.invalidateQueries({ queryKey: ["progress", projectId] });
      setPendingProgressCount((value) => value + 1);
    };

    const onProjectDelayed = (raw: unknown) => {
      const payload = parseRealtimePayload(RealtimeEvent.PROYECTO_RETRASADO, raw);
      if (!payload || payload.projectId !== projectId) return;

      void queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });

      queryClient.setQueryData(
        queryKeys.project(projectId),
        (current: ProjectResponse | undefined) =>
          current
            ? {
                ...current,
                status: "DELAYED" as const,
                endDate: payload.endDate,
                updatedAt: payload.updatedAt,
              }
            : current,
      );

      if (user && project && canManageProject(user, project)) {
        setProjectDelayedAlert({ projectId: payload.projectId, title: payload.title });
      }
    };

    const onBudgetLow = (raw: unknown) => {
      const payload = parseRealtimePayload(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, raw);
      if (!payload || payload.projectId !== projectId) return;

      void queryClient.invalidateQueries({ queryKey: queryKeys.budget(projectId) });
      void queryClient.invalidateQueries({ queryKey: ["budget-executions", projectId] });

      if (user && canViewBudgetDetail(user)) {
        pushSessionNotice(
          noticeFromBudgetLow(payload, `/proyectos/${payload.projectId}?tab=presupuesto`),
        );
      }
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on(RealtimeEvent.TAREA_ACTUALIZADA, onTaskUpdated);
    socket.on(RealtimeEvent.AVANCE_REGISTRADO, onProgress);
    socket.on(RealtimeEvent.PROYECTO_RETRASADO, onProjectDelayed);
    socket.on(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, onBudgetLow);

    socket.connect();
    if (socket.connected) joinRoom();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off(RealtimeEvent.TAREA_ACTUALIZADA, onTaskUpdated);
      socket.off(RealtimeEvent.AVANCE_REGISTRADO, onProgress);
      socket.off(RealtimeEvent.PROYECTO_RETRASADO, onProjectDelayed);
      socket.off(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, onBudgetLow);
      disconnectNamespace(RealtimeNamespace.PROJECTS);
    };
  }, [authStatus, flashTask, project, projectId, queryClient, user]);

  return {
    highlightedTaskId,
    pendingProgressCount,
    clearPendingProgress,
    projectDelayedAlert,
  };
}

export function resumeProjectsSocket() {
  clearNamespacePause(RealtimeNamespace.PROJECTS);
  reconnectSocket(RealtimeNamespace.PROJECTS);
}
