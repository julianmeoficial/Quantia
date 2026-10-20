# AGENTS.md — Quantia Web

Guide for any coding agent (Cursor, Claude Code, Codex) and for human reviewers.
If something here conflicts with `.cursorrules`, `.cursorrules` wins.

## What this repo is

Frontend client of Quantia (INNOVATEK'S / GITEMOS research seedbed). Next.js App Router +
React + TypeScript strict + Styled Components + Radix UI + Framer Motion + Recharts, deployed on Vercel.
The only backend is the Quantia API (`/api/v1` + Socket.io). Roles: Investigador, Coordinador, Administrador.
Code in English; UI copy in Spanish.

## Read before acting (in this order)

1. `.cursorrules` — locked stack, invariants, DON'Ts + **documentation map** (always).
2. `DESIGN.md` — tokens and registered components (before ANY UI work).
3. `.cursor/docs/SCREENS.md` — screen inventory, routes, roles and composition blueprints.
4. `.cursor/docs/frontend-conventions.md` — folders, Figma → code, Git/PR, Definition of Done, env vars.
5. `.cursor/rules/*.mdc` — only the rule whose globs match the area you touch:
   - `ui-design-system.mdc` → `src/components/**`, `src/theme/**`, `*.styles.ts` (then read `DESIGN.md`)
   - `accessibility-ux.mdc` → `src/app/**`, `src/components/**`
   - `api-integration.mdc` → `src/lib/**`, `src/features/**`, `src/app/**`

Canonical paths only. Do not look for `docs/SCREENS.md`, `docs/frontend-conventions.md`,
or a missing `ui-design-system.md` — those paths do not exist.

## Repo map

```
src/app/(auth)/            login, session recovery — public
src/app/(investigador)/    Investigador routes ("Mis tareas" is the landing)
src/app/(coordinador)/     Coordinador routes (group dashboard is the landing)
src/app/(admin)/           Administrador routes (institutional view is the landing)
src/components/base/       Button, TextField, Select, Badge…
src/components/composite/  ProjectCard, TaskRow, FilterBar, Pagination…
src/components/page/       RoleSidebar, AppHeader, DataTable, KpiPanel…
src/components/system/     EmptyState, Skeleton, ErrorState, Toast, SyncStatus…
src/features/<domain>/     hooks, services and view logic per domain
src/theme/                 tokens, light/dark themes, mixins, SSR registry
src/app/api/session/       session route handlers (httpOnly refresh cookie)
src/lib/api/               the single API client (auth, refresh, errors, one file per domain)
src/lib/auth/              permissions.ts (role helpers from /users/me)
src/lib/socket/            Socket.io provider (/projects, /notifications, /general)
src/lib/format/            COP, DD/MM/AAAA, percentages
```

Full tree and placement rules: `.cursor/docs/frontend-conventions.md` §1.

## Commands

| Command             | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Local dev server on http://localhost:3000  |
| `npm run lint`      | ESLint (includes jsx-a11y) — zero errors   |
| `npm run typecheck` | `tsc --noEmit` — zero errors               |
| `npm run test`      | Unit, component and axe tests              |
| `npm run build`     | Production build — must pass before any PR |

Setup: Node 22 LTS, `npm ci`, copy `.env.example` → `.env.local`. Variables: conventions §6.

## How a screen is requested

Every UI task must include: the `.cursor/docs/SCREENS.md` entry, the role and route, the API
contract from `@quantia/contracts`, and the Linear issue `DS-xx`. Prefer a Figma frame URL with
`node-id` when available. Template: `.cursor/docs/frontend-conventions.md` §2.
If the screen is not listed in `SCREENS.md`, STOP and ask. Do not invent routes or layouts.

## Workflow

1. Branch from `main`: `feature/ds-xx-short-description`.
2. Read the frame with the Figma MCP (`get_design_context`) and map every value to a theme token.
3. Build with registered components only; implement loading, empty, error and permission states.
4. Run `lint`, `typecheck`, `test`, `build`.
5. Conventional Commits; open a PR to `main` using the PR template, with `Fixes DS-xx`.

## Done means

- All five commands pass with zero errors.
- Screenshot of the build next to the Figma frame at 390, 768 and 1280 px.
- Loading, empty and error states shown; keyboard-only navigation works; `:focus-visible` intact.
- axe: zero violations. No hex/px literals, no `any`, types from `@quantia/contracts`.
  Full checklist: conventions §5.

## Stop and ask (do not guess)

- A screen/route is missing from `.cursor/docs/SCREENS.md`, or a component/token is not in `DESIGN.md`.
- A contract is missing in `@quantia/contracts`, or the API returns a shape that differs from it.
- The task needs a new dependency, a new route group or changes to `.cursorrules`.
- The role permission for a view is not defined in `.cursor/docs/SCREENS.md`.
