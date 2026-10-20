# Quantia Web

Cliente web de Quantia: Next.js (App Router) + React + TypeScript estricto, Styled Components con
theme tipado (claro/oscuro), Radix UI, Framer Motion + GSAP, Recharts y Socket.io client.

Documentación canónica para agentes y humanos:

| Archivo                                                                        | Uso                                            |
| ------------------------------------------------------------------------------ | ---------------------------------------------- |
| [`.cursorrules`](.cursorrules)                                                 | Stack bloqueado, invariantes, mapa de docs     |
| [`AGENTS.md`](AGENTS.md)                                                       | Flujo de agentes, comandos, Definition of Done |
| [`DESIGN.md`](DESIGN.md)                                                       | Tokens y componentes registrados               |
| [`.cursor/docs/SCREENS.md`](.cursor/docs/SCREENS.md)                           | Inventario de pantallas y roles                |
| [`.cursor/docs/frontend-conventions.md`](.cursor/docs/frontend-conventions.md) | Carpetas, PR, env                              |
| [`.cursor/rules/`](.cursor/rules/)                                             | Reglas modulares (`.mdc`): UI, a11y, API       |

## Requisitos

- Node 22 LTS (`nvm use`)
- npm 10+
- Acceso al registro privado de `@quantia/contracts` (ver `.npmrc.example`)

## Inicio

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL y NEXT_PUBLIC_SOCKET_URL
npm run dev
```

## Scripts

| Script                            | Descripción                        |
| --------------------------------- | ---------------------------------- |
| `npm run dev`                     | Servidor de desarrollo (Turbopack) |
| `npm run build` / `npm start`     | Build y servidor de producción     |
| `npm run lint` / `lint:fix`       | ESLint                             |
| `npm run format` / `format:check` | Prettier                           |
| `npm run typecheck`               | Verificación de tipos              |
| `npm test` / `npm run test:watch` | Vitest + Testing Library           |

## Estructura

```text
src/
├── app/              # rutas (App Router); _components/ = vistas privadas de la ruta
├── components/ui/    # componentes del sistema de diseño (solo los registrados en DESIGN.md)
├── features/         # un módulo por dominio: projects, tasks, progress, budget, reports, audit, sync
├── hooks/            # hooks compartidos
├── lib/
│   ├── api/          # cliente único de la API (/api/v1), sesión en memoria y errores normalizados
│   ├── socket.ts     # Socket.io (/projects, /notifications)
│   ├── gsap.ts       # registro único de plugins de GSAP
│   └── styled-registry.tsx  # registry SSR de Styled Components
├── config/env.ts     # variables públicas validadas con zod
├── providers/        # ThemeProvider, GlobalStyle, MotionConfig
├── theme/            # paleta clara/oscura, tokens y GlobalStyle
└── types/
```

## Theme y modo oscuro

- `theme.colors.*` apunta a custom properties (`var(--q-color-…)`); los valores claros y oscuros
  viven en `src/theme/palette.ts`. El modo oscuro se resuelve en tokens, no por componente.
- Por defecto sigue `prefers-color-scheme`; se fuerza con `data-theme="light" | "dark"` en `<html>`.
- Espaciado, tipografía, radios, elevación y duraciones salen de `src/theme/tokens.ts`
  (`theme.space[4]`, `theme.typography.bodyMedium`, `theme.motion.duration.fast`, …).

## Cliente de la API

```ts
import { api } from "@/lib/api";
import { projectListSchema } from "@quantia/contracts";

const projects = await api.get("/projects", {
  schema: projectListSchema,
  query: { page: 1, pageSize: 20 },
});
```

- El access token vive solo en memoria (`setAccessToken`); el refresh token es una cookie httpOnly.
- Ante un 401 hace un refresh silencioso (configúralo con `configureRefresh` usando el contrato de
  auth) y reintenta una vez; si falla, emite `onSessionExpired` para mostrar el modal de sesión.
- Ante un 429 espera `Retry-After` y reintenta una vez.
- Todos los errores salen como `ApiError` con `kind` normalizado; los 401/403/404 usan mensajes
  genéricos para no revelar recursos fuera del alcance del usuario.
