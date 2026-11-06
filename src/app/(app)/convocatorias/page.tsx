import { ComingSoonScreen } from "@/features/coming-soon";

/** Client auth shell blocks an instant static shell. */
export const instant = false;

export default function ConvocatoriasPage() {
  return (
    <ComingSoonScreen
      href="/convocatorias"
      title="Convocatorias"
      summary="Techo, ejecución y proyectos por convocatoria institucional."
    />
  );
}
