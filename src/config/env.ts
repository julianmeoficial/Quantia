import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
  NEXT_PUBLIC_SOCKET_URL: z.url(),
});

// Next.js solo inyecta las variables NEXT_PUBLIC_* en el cliente si se leen de forma estática.
const parsed = schema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
});

if (!parsed.success) {
  throw new Error(
    `Variables de entorno inválidas:\n${z.prettifyError(parsed.error)}\nRevisa .env.local (usa .env.example como referencia).`,
  );
}

export const env = parsed.data;
