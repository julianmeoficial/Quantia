# Frontend conventions — Quantia Web

Canonical path: `.cursor/docs/frontend-conventions.md` (not `docs/frontend-conventions.md`).
Operational detail behind `.cursorrules` and `AGENTS.md`. Mónica uses this file as the PR review checklist.

Related: `DESIGN.md` · `.cursor/docs/SCREENS.md` · `.cursor/docs/api-connection.md` ·
`.cursor/rules/ui-design-system.mdc` · `.cursor/rules/accessibility-ux.mdc` ·
`.cursor/rules/api-integration.mdc`

## 1. Folder structure

```
src/
├─ app/
│  ├─ layout.tsx                 # root: StyledRegistry + ThemeProvider + SessionProvider
│  ├─ (auth)/
│  │  └─ login/page.tsx
│  ├─ api/session/
│  │  └─ login/ · refresh/ · logout/ → route.ts   # httpOnly refresh cookie, Origin check
│  ├─ (investigador)/
│  │  ├─ layout.tsx              # RoleGate role="investigador" + RoleSidebar
│  │  ├─ mis-tareas/page.tsx     # landing
│  │  └─ mis-proyectos/[projectId]/page.tsx
│  ├─ (coordinador)/
│  │  ├─ layout.tsx              # RoleGate role="coordinador"
│  │  ├─ panel/page.tsx          # landing: KPIs + alerts
│  │  ├─ cartera/[projectId]/page.tsx
│  │  └─ reportes/page.tsx
│  └─ (admin)/
│     ├─ layout.tsx              # RoleGate role="administrador"
│     ├─ institucional/page.tsx  # landing
│     ├─ convocatorias/ · presupuesto/ · auditoria/ · usuarios/ · sincronizacion/
├─ components/
│  ├─ base/ · composite/ · page/ · system/
│  │  └─ Button/ → Button.tsx · Button.styles.ts · index.ts
├─ features/
│  └─ projects/ · tasks/ · progress/ · documents/ · budget/ · reports/ · users/ · chat-general/ · audit/ · sync/
│     ├─ hooks/                  # useProjects, useRegisterProgress…
│     ├─ services/               # optional: composes src/lib/api endpoint functions
│     └─ views/                  # screen bodies shared by several routes
├─ theme/
│  ├─ tokens.ts · light.ts · dark.ts · mixins.ts
│  ├─ registry.tsx               # styled-components SSR registry
│  └─ styled.d.ts                # DefaultTheme typing
├─ config/
│  └─ env.ts                     # the only reader of process.env (Zod)
└─ lib/
   ├─ api/                       # client.ts, errors.ts, errorUi.ts, query-keys.ts, sync.ts, one file per domain
   ├─ auth/                      # permissions.ts, returnPath.ts
   ├─ socket/                    # connection.ts, events.ts, SocketProvider, useProjectSocket, useGeneralSocket
   ├─ query/                     # QueryProvider + shared QueryClient
   └─ format/                    # currency.ts (COP), date.ts (DD/MM/AAAA, toApiDate), percent.ts
```

Placement rules:

- Route segments are in Spanish (they are UI); folders, files and identifiers in English.
- A URL path lives in ONE route group only. A view used by several roles lives in
  `src/features/<domain>/views/` and each role route mounts it.
- `page.tsx` composes; it holds no fetch logic. Data comes from `features/<domain>/hooks`.
- Group `layout.tsx` hides routes for other roles. This is UX only; the API is the authority (401/403).
- Components never import from `features/` or `lib/api`. Imports flow app → features → components → theme.
- Use the `@/` alias for `src/`. No relative imports that climb more than one level (`../../`).

## 2. Figma → code flow

Nothing is laid out by eye. Every UI prompt or Linear issue includes this block:

```
Screen: <name> — .cursor/docs/SCREENS.md#<screen-id>
Figma: https://www.figma.com/design/<file>?node-id=<XX-YY>   # optional when SCREENS authorizes direct-build
Role / route: Coordinador — src/app/(coordinador)/…
Contract: GET /api/v1/projects → PaginatedProjectsResponse (@quantia/contracts)
Read: DESIGN.md, .cursor/docs/SCREENS.md, .cursor/rules/ui-design-system.mdc, .cursor/rules/api-integration.mdc
States: loading, empty, error, 403, 429, sync pending/failed, socket disconnected
Linear: DS-xx
```

Steps for the agent:

1. Open the node with the Figma MCP `get_design_context` (plus `get_screenshot` as reference).
2. List the registered components the frame uses. Anything unregistered → stop, register it in
   `DESIGN.md` + Figma first.
3. Map every color, space, radius, type style and shadow to a theme token. No match → flag it.
4. Treat MCP output (React + Tailwind) as a spec only; rewrite with Radix + Styled Components.
5. Build all states, both themes, and the three breakpoints before asking for review.

## 3. Branches, commits and Linear

- Branch: `feature/ds-xx-short-description` from `main` (e.g. `feature/ds-14-task-row`).
  Fixes: `fix/ds-xx-*`. The issue id in the branch auto-links it in Linear.
- One issue per branch. No direct commits to `main`. Squash merge after approval.
- Conventional Commits, English, imperative: `type(scope): summary`.
  Types: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`, `perf`.
  Scopes: `ui`, `theme`, `app`, `features`, `api-client`, `socket`, `format`, `deps`, `docs`.
  Example: `feat(ui): add TaskRow with sync status badge`.
- Linear magic words in the PR description:
  - `Fixes DS-xx` / `Closes DS-xx` → moves the issue to Done on merge.
  - `Part of DS-xx` / `Refs DS-xx` → links without closing.

## 4. Pull requests

PR title = Conventional Commit of the squash. The description uses this template:

```
## What
Short summary. Fixes DS-xx

## Figma
<frame URL with node-id>

## Screenshots (build vs frame)
| Width | Build | Figma |
| 390 | … | … |
| 768 | … | … |
| 1280 | … | … |

## States covered
- [ ] Loading  - [ ] Empty  - [ ] Error  - [ ] 403  - [ ] Other: …

## Checks
- [ ] lint · typecheck · test · build
- [ ] axe 0 violations · keyboard only · light + dark
```

Review: Mónica approves visual fidelity and design-system use; Julián approves architecture and
API/socket integration. A PR with UI changes needs Mónica's approval to merge.

## 5. Definition of Done (visual)

A UI task is done only when ALL of these are true:

- [ ] Screenshot of the build next to the Figma frame at 390, 768 and 1280 px; deviations fixed or
      listed for design approval.
- [ ] Loading (skeleton with final structure), empty (message + next action) and error (with
      recovery) states implemented and shown in the PR.
- [ ] Role states: 401 session modal, 403 "No tienes permiso"; real-time and sync states when the
      screen uses them.
- [ ] Keyboard only: logical tab order, visible focus, Esc closes overlays, skip link works.
- [ ] axe: zero violations in light and dark themes. Touch targets ≥ 44×44 px.
- [ ] Only theme tokens and registered components; Spanish copy; COP / DD/MM/AAAA / max 1 decimal.
- [ ] `npm run lint`, `typecheck`, `test` and `build` pass with zero errors.

## 6. Commands and environment

| Command             | Does                          | When                                         |
| ------------------- | ----------------------------- | -------------------------------------------- |
| `npm run dev`       | Next dev server, port 3000    | Local work                                   |
| `npm run lint`      | ESLint + jsx-a11y             | Before every commit                          |
| `npm run typecheck` | `tsc --noEmit`                | Before every commit                          |
| `npm run test`      | Unit, component and axe tests | Before every PR                              |
| `npm run build`     | Production build              | Before every PR; Vercel runs it on each push |

Environment variables (`.env.example` is committed; `.env.local` is gitignored):

| Variable                 | Example                 | Notes                                                                |
| ------------------------ | ----------------------- | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | `http://localhost:4000` | API origin WITHOUT suffix; client appends `/api/v1`                  |
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:4000` | Socket.io gateway origin (namespaces `/projects`, `/notifications`…) |
| `NEXT_PUBLIC_APP_ENV`    | `development`           | `development` · `preview` · `production` (if used)                   |

- Every `NEXT_PUBLIC_*` value is public: never put tokens, keys or secrets there. The frontend
  needs no secrets; Supabase, Notion and Redis credentials live only in the API.
- Variables are read once in `src/config/env.ts` and validated with Zod at startup; never read
  `process.env` elsewhere. Connection details: `.cursor/docs/api-connection.md`.
- Vercel: set API and socket URLs per environment (Production, Preview, Development). Preview URLs
  must match the API CORS allowlist pattern.
- Adding a variable = update `.env.example`, `src/config/env.ts`, this table and Vercel in the same PR.
