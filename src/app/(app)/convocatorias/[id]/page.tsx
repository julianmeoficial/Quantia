import { CallDetailScreen } from "@/features/institutional";

/** Client auth shell blocks an instant static shell. */
export const instant = false;

interface ConvocatoriaPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConvocatoriaPage({ params }: ConvocatoriaPageProps) {
  const { id } = await params;
  return <CallDetailScreen callId={id} />;
}
