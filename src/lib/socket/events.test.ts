import { RealtimeEvent } from "@quantia/contracts";
import { describe, expect, it } from "vitest";

import { parseRealtimePayload } from "./events";

describe("parseRealtimePayload", () => {
  it("accepts a valid tarea.actualizada payload", () => {
    const payload = parseRealtimePayload(RealtimeEvent.TAREA_ACTUALIZADA, {
      projectId: "11111111-1111-4111-8111-111111111111",
      taskId: "22222222-2222-4222-8222-222222222222",
      title: "Revisar protocolo",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: null,
      updatedAt: "2026-11-04T12:00:00.000Z",
    });
    expect(payload?.title).toBe("Revisar protocolo");
  });

  it("drops invalid payloads", () => {
    expect(parseRealtimePayload(RealtimeEvent.TAREA_ACTUALIZADA, { title: "x" })).toBeNull();
  });

  it("parses presupuesto.ejecucion-baja", () => {
    const payload = parseRealtimePayload(RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA, {
      projectId: "11111111-1111-4111-8111-111111111111",
      budgetId: "33333333-3333-4333-8333-333333333333",
      executedPercent: 45.6,
      thresholdPercent: 80,
      updatedAt: "2026-11-04T12:00:00.000Z",
    });
    expect(payload?.executedPercent).toBe(45.6);
  });
});
