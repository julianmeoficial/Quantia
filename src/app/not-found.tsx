import Link from "next/link";

import { StatusView } from "./_components/status-view";

export default function NotFound() {
  return (
    <StatusView
      title="Página no encontrada"
      description="La página que buscas no existe o no está disponible."
      action={<Link href="/">Volver al inicio</Link>}
    />
  );
}
