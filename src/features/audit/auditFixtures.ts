import type { AuditEntry } from "./auditViewModel";
import { isAuditFixturesEnabled } from "./isAuditFixturesEnabled";

const FIXTURES: AuditEntry[] = [
  {
    id: "audit-1",
    actorName: "Marta Herrera",
    action: "Actualizó presupuesto",
    entity: "Proyecto · Monitoreo IoT en humedales",
    occurredAt: "2026-10-20T19:30:00.000Z",
    origin: "app",
  },
  {
    id: "audit-2",
    actorName: "Luis Gómez",
    action: "Registró avance",
    entity: "Tarea · Muestreo de campo",
    occurredAt: "2026-10-19T15:05:00.000Z",
    origin: "notion",
  },
  {
    id: "audit-3",
    actorName: "Marta Herrera",
    action: "Desactivó usuario",
    entity: "Usuario · Ana Ruiz",
    occurredAt: "2026-10-18T21:12:00.000Z",
    origin: "app",
  },
  {
    id: "audit-4",
    actorName: "Carlos Pérez",
    action: "Creó proyecto",
    entity: "Proyecto · Energía solar en campus",
    occurredAt: "2026-10-17T14:00:00.000Z",
    origin: "app",
  },
  {
    id: "audit-5",
    actorName: "Sistema sync",
    action: "Sincronizó bitácora",
    entity: "Proyecto · Agrotech comunitario",
    occurredAt: "2026-10-16T11:45:00.000Z",
    origin: "notion",
  },
];

export function listAuditFixtures(): AuditEntry[] {
  if (!isAuditFixturesEnabled()) return [];
  return FIXTURES;
}
