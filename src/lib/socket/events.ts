import {
  RealtimeEvent,
  avanceRegistradoPayloadSchema,
  presupuestoEjecucionBajaPayloadSchema,
  proyectoRetrasadoPayloadSchema,
  tareaActualizadaPayloadSchema,
  type AvanceRegistradoPayload,
  type PresupuestoEjecucionBajaPayload,
  type ProyectoRetrasadoPayload,
  type TareaActualizadaPayload,
} from "@quantia/contracts";

export type PayloadByEvent = {
  [RealtimeEvent.TAREA_ACTUALIZADA]: TareaActualizadaPayload;
  [RealtimeEvent.AVANCE_REGISTRADO]: AvanceRegistradoPayload;
  [RealtimeEvent.PROYECTO_RETRASADO]: ProyectoRetrasadoPayload;
  [RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA]: PresupuestoEjecucionBajaPayload;
};

export function parseRealtimePayload(
  event: typeof RealtimeEvent.TAREA_ACTUALIZADA,
  raw: unknown,
): TareaActualizadaPayload | null;
export function parseRealtimePayload(
  event: typeof RealtimeEvent.AVANCE_REGISTRADO,
  raw: unknown,
): AvanceRegistradoPayload | null;
export function parseRealtimePayload(
  event: typeof RealtimeEvent.PROYECTO_RETRASADO,
  raw: unknown,
): ProyectoRetrasadoPayload | null;
export function parseRealtimePayload(
  event: typeof RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA,
  raw: unknown,
): PresupuestoEjecucionBajaPayload | null;
export function parseRealtimePayload(
  event: keyof PayloadByEvent,
  raw: unknown,
): PayloadByEvent[keyof PayloadByEvent] | null {
  switch (event) {
    case RealtimeEvent.TAREA_ACTUALIZADA: {
      const parsed = tareaActualizadaPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case RealtimeEvent.AVANCE_REGISTRADO: {
      const parsed = avanceRegistradoPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case RealtimeEvent.PROYECTO_RETRASADO: {
      const parsed = proyectoRetrasadoPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    case RealtimeEvent.PRESUPUESTO_EJECUCION_BAJA: {
      const parsed = presupuestoEjecucionBajaPayloadSchema.safeParse(raw);
      return parsed.success ? parsed.data : null;
    }
    default:
      return null;
  }
}
