import { ComingSoonScreen } from "@/features/coming-soon";

/** Client auth shell blocks an instant static shell. */
export const instant = false;

export default function AuditoriaPage() {
  return (
    <ComingSoonScreen
      href="/auditoria"
      title="Auditoría"
      summary="Trazabilidad de acciones sobre proyectos, presupuestos y usuarios."
    />
  );
}
