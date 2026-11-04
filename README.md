# Quantia Web

Cliente web de Quantia: Next.js (App Router) + React + TypeScript estricto, Styled Components con
theme tipado (claro/oscuro), Radix UI, Framer Motion, Recharts y Socket.io client.

Documentación canónica para agentes y humanos:

| Archivo                                                                        | Uso                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- |
| [`.cursorrules`](.cursorrules)                                                 | Stack bloqueado, invariantes, mapa de docs              |
| [`AGENTS.md`](AGENTS.md)                                                       | Flujo de agentes, comandos, Definition of Done          |
| [`DESIGN.md`](DESIGN.md)                                                       | Tokens y componentes registrados                        |
| [`.cursor/docs/SCREENS.md`](.cursor/docs/SCREENS.md)                           | Inventario de pantallas y roles                         |
| [`.cursor/docs/frontend-conventions.md`](.cursor/docs/frontend-conventions.md) | Carpetas, PR, env                                       |
| [`.cursor/docs/api-connection.md`](.cursor/docs/api-connection.md)             | Conexión frontend↔API (HTTP, sesión, sockets, sync, F3) |
| [`.cursor/rules/`](.cursor/rules/)                                             | Reglas modulares (`.mdc`): UI, a11y, API                |

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

| Script                            | Descripción                                             |
| --------------------------------- | ------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo (Turbopack)                      |
| `npm run build` / `npm start`     | Build y servidor de producción                          |
| `npm run lint` / `lint:fix`       | ESLint                                                  |
| `npm run format` / `format:check` | Prettier                                                |
| `npm run typecheck`               | Verificación de tipos                                   |
| `npm test` / `npm run test:watch` | Vitest + Testing Library (+ axe en componentes)         |
| `npm run test:a11y`               | Playwright + `@axe-core/playwright` (rutas principales) |
| `npm run test:lighthouse`         | Lighthouse CI (a11y ≥ 95, perf ≥ 85, LCP ≤ 2,5 s)       |

## Estructura

```text
src/
├── app/                 # rutas (App Router); api/session/* = cookie httpOnly
├── components/
│   ├── base/            # Button, TextField, Select…
│   ├── composite/       # FilterBar, TaskRow…
│   ├── page/            # AppShell, AppHeader, DataTable…
│   └── system/          # EmptyState, ErrorState, SyncStatus, ConnectionStatus…
├── features/            # un módulo por dominio (projects, tasks, progress, reports, sync…)
├── lib/
│   ├── api/             # cliente único /api/v1, sesión, errores, sync retry
│   ├── auth/            # permisos y return path post-login
│   ├── socket/          # Socket.io (/projects, /notifications, /general)
│   ├── query/           # React Query provider
│   └── format/          # COP, DD/MM/AAAA, porcentajes
├── config/env.ts        # variables públicas validadas con Zod
├── providers/           # Theme, Query, Socket, Motion
└── theme/               # paleta clara/oscura, tokens y registry SSR
```

Detalle de carpetas y PR: [`.cursor/docs/frontend-conventions.md`](.cursor/docs/frontend-conventions.md).
Conexión a la API (F3): [`.cursor/docs/api-connection.md`](.cursor/docs/api-connection.md).

## Theme y modo oscuro

- `theme.colors.*` apunta a custom properties (`var(--q-color-…)`); los valores claros y oscuros
  viven en `src/theme/palette.ts`. El modo oscuro se resuelve en tokens, no por componente.
- Por defecto sigue `prefers-color-scheme`; se fuerza con `data-theme="light" | "dark"` en `<html>`.
- Espaciado, tipografía, radios, elevación y duraciones salen de `src/theme/tokens.ts`
  (`theme.space[4]`, `theme.typography.bodyMedium`, `theme.motion.duration.fast`, …).

## Cliente de la API

```ts
import { listProjects } from "@/lib/api";

const projects = await listProjects({ page: 1, pageSize: 20 });
```

- El access token vive solo en memoria; el refresh token es una cookie httpOnly (`/api/session/*`).
- Ante un 401 hace un refresh silencioso (single-flight) y reintenta una vez; si falla, emite
  `onSessionExpired` (modal OVR-04) y puede restaurar la ruta con `?from=`.
- Ante un 429 espera `Retry-After` (UI con countdown); el cliente puede reintentar una vez tras la espera.
- Errores normalizados como `ApiError`; mapeo a `ErrorState` vía `errorStatePropsFromApiError`.
- Tiempo real: Socket.io autenticado con JWT; sync Notion con `SyncStatus` + reintento admin provisional;
  reportes asíncronos por polling (sin eventos `reporte.completado` / `sync.failed` en el contrato).
