# Quantia Screen Map

Canonical path: `.cursor/docs/SCREENS.md` (not `docs/SCREENS.md`).
Status: implementation-ready visual brief. The agent is authorized to design and build every listed view directly, without waiting for Figma, missing frames, F1, or visual approval. This is not evidence that code or tests already exist.
Language: English documentation, Spanish user-facing copy. Visual foundation: `DESIGN.md`. Do not fork its tokens or create screen-specific component families.

Related: `.cursorrules` · `AGENTS.md` · `DESIGN.md` · `.cursor/docs/frontend-conventions.md` ·
`.cursor/rules/ui-design-system.mdc` · `.cursor/rules/accessibility-ux.mdc` · `.cursor/rules/api-integration.mdc`

## 1. Product Experience and Source Authority

Quantia is a research workspace for investigators, coordinators, and administrators. Every screen must make its next action, data scope, and save state understandable without explanation.
Pursue Apple-like attention to detail through alignment, typography, responsive composition, stable interaction, clear feedback, and carefully managed focus. Do not copy Apple's branding or treat visual polish as a substitute for working states.
Sunbeam inspires warmth, illustrated research storytelling, and soft framing in expressive areas; Quantia's blue identity, research vocabulary, sober data surfaces, and role model remain its own.

Sources used for this map:

- Quantia Design System and Design Thinking: role matrix, four-level hierarchy, components, state mapping, and DESIGN.md.
- Quantia QA UI/UX and wireframes: role journeys and RF/RNF traceability.
- Quantia Frontend Development, `.cursor/rules/api-integration.mdc`: documented contracts v0.7.0, actual nested endpoint paths, socket scope, polling, and known gaps.
- Quantia General Chat: authenticated shared room, persistence, distributed presence, and cursor history.
- Frame IDs and route inventory supplied by the product owner for this document.

Contract authority: actual @quantia/contracts and exported OpenAPI in the repository override earlier proposed DS endpoints. This session read the frontend integration specification, not the live repository or API. Recheck installed contract version before implementation.
Execution priority: ship coherent working UI from this specification. Missing frames are not blockers. Real data, payload fields, backend capabilities, and role grants must remain truthful.
For screen creation, this direct-build authorization supersedes earlier no-frame/no-build, F1-wait, mandatory Figma comparison, and pre-implementation visual approval requirements in DESIGN.md and older frontend guidance. It does not override security, authentication, permissions, or actual API contracts.
Make routine visual decisions autonomously. Reuse canonical components; if a needed presentational variation is absent, extend and document the canonical API in the same change instead of waiting for a new Figma component or creating a parallel family. No Figma connection, screenshot export, or external illustration asset is required to start or finish.

## 2. Canonical Routes and Permission Rules

Use the product owner's route names below. Earlier frontend documents used /panel, /mis-proyectos/[projectId], and /cartera/[projectId]; these are migration candidates, not additional screens.
Canonical destinations: /dashboard replaces /panel; /proyectos/[id] replaces the two role-specific project-detail paths. If old routes already exist, migrate with reviewed redirects; do not silently add duplicate implementations.
Next.js route groups do not change URL paths. Each public URL belongs to one route implementation; shared views live in feature folders and receive authorized capabilities. Never place duplicate /presupuesto or /reportes pages in competing route groups.
Use [id] for the project/call identifier in this document; derive the UUID from params and validate with the contract, never treat the placeholder as a literal path.

Session bootstrap: refresh through the approved Next session transport -> GET /api/v1/users/me -> hydrate roles/capabilities -> choose landing. Never decode JWT roles in the browser to decide permissions.
Primary landing for multiple roles: ADMINISTRADOR > COORDINADOR > INVESTIGADOR.

| Role          | Landing        | Primary allowed navigation                                                                                                            | Resource scope                                                              |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| INVESTIGADOR  | /mis-tareas    | Mis tareas, accessible project workspace, Chat if enabled                                                                             | Project membership; tasks assigned to self; own permitted mutations         |
| COORDINADOR   | /dashboard     | Dashboard, Proyectos, Tareas, Avances, Presupuesto, Reportes, Chat if enabled                                                         | Managed portfolio; membership-only projects do not confer management rights |
| ADMINISTRADOR | /institucional | Institucional, Proyectos/shared workspaces, Presupuesto, Usuarios, Reportes, Chat; Convocatorias/Auditoria only after contracts exist | Institutional scope with server authorization                               |

Routes /proyectos, /tareas, and /avances may be reused by ADMINISTRADOR for global operational work; they are not separate admin copies. Do not add researcher navigation to these coordinator/global lists without an explicit product decision; researchers enter accessible project detail from Mis tareas.
The API remains the authority. UI may be stricter than backend grants, never looser. Hide unauthorized links/actions entirely, not disabled placeholders. A direct unauthorized URL renders the approved 403 presentation; 401 prompts reauthentication; unknown resources use 404.
Researcher financial detail, user administration, audit, and institutional reporting remain hidden. Researcher PROGRESS_PDF may be offered inside an accessible project if explicitly designed; this does not grant the /reportes management workspace.

## 3. Direct-Build Screen Blueprints (No Figma Dependency)

Use sections 3, 5, 6, and 7 together: composition, route/role/contract, behavior, and overlays. Existing Figma IDs are optional historical references only. Do not fetch them or wait for them by default. Do not claim to have inspected them.
Historical references: investigator 4:2; coordinator dashboard 13:217; administrator call detail 26:82; institutional dashboard 27:164; flows 13:166, 13:179, 26:44. Their exact content is not required for direct implementation.

### 3.1 Shared Composition Defaults

- At wide widths, inset the 240 px navigation surface by space/16 inside the canvas, use radius/featured, a subtle border and no heavy shadow. Separate it from the content with space/24. Navigation rows have 44 px targets, radius/control, an icon, a label, and one calm blue selected treatment. No square edge-to-edge slab, redundant nested nav cards, or loud brand banner.
- Main content uses a centered fluid column up to content-max, space/32 padding on desktop, space/24 on tablet, space/16 on compact screens. Preserve the existing DESIGN.md breakpoint model. Collapse the sidebar to a Dialog drawer before content becomes cramped.
- A quiet header contains breadcrumb/context on the left and connection/user/notification controls on the right. The page heading below has one title, optional single-line context, and at most one primary action. Stack its action below the text on compact screens.
- Default operational page: title row -> FilterBar -> one primary list/table/content region -> pagination. Use open spacing and separators rather than a card around each label. Card backgrounds belong to genuine grouped content, not arbitrary decoration.
- Use Urbanist headings and Source Sans 3 interface text from DESIGN.md as the authorized direct-build direction. Resolve old Inter guidance consistently in the theme, not one screen at a time. Do not wait for a font review; use system fallback if font files are unavailable and report the fallback.
- Build both themes through semantic tokens. Use existing control/card/featured radii and motion tokens. The original research-thread illustration can be a small local SVG built from simple note shapes and connecting nodes; no purchased assets, image generation, or mascot approval is required. Omit artwork rather than delay delivery.
- Default motion: 150 ms controls, 200 ms subtle opacity changes, 250 ms drawer/dialog transform+opacity. No animation-driven layout delays, staggered card reveals, overshoot, decorative loops, or required ambient animation. Reduced-motion mode disables slides/shimmer.

### 3.2 Per-Screen Build Recipes

Every row below is sufficient to compose a first implementation without a frame. Use real API data only when available; absent backend support affects integration, not the ability to create presentational UI.

| Screen               | Wide composition and key components                                                                                                                                                                                                    | Compact adaptation                                                                                                  | First-build detail / state recipe                                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01 Login        | No app sidebar. Two balanced regions: readable form in a plain surface and a muted blue/paper research illustration. Form contains Quantia identity, short welcome, labeled email/password, visibility action, submit, inline feedback | Single form column; art reduced to a small header motif or removed; submit full width                               | Keep form width within reading-max; reserve error space through natural flow, never overlap labels. Loading preserves submit width; invalid credentials remain generic |
| RES-01 My tasks      | App shell; heading plus Registrar avance when context permits; urgency sections Vencidas/Esta semana/Próximas using TaskRow, project label, due date and status; lightweight project filter                                            | Rows become stacked title/project/date/action groups; no card per metadata field                                    | Keep completion target separate from task-open link; partial fetch warning beside affected group, not a false empty state                                              |
| PRJ-01 Project       | Breadcrumb, title/status/member context, one relevant action, tabs Tareas/Bitácora/Documentos; task list, chronological timeline, or evidence table in the same content region                                                         | Tabs wrap/scroll locally only when necessary; header actions stack; dense document columns become labeled file rows | Initial tab=tareas; preserve valid selected tab. Header stays stable while switching tab content; zero duplicate dashboards inside tabs                                |
| COO-01 Dashboard     | Four-level vertical reading order: at most four KpiPanel metrics, AlertList, paired comparison, project DataTable. No second large heading or hero                                                                                     | Metrics 2 columns then 1 when needed; alerts stack; chart has table alternative                                     | Render only supported metrics. Unavailable comparison gets a concise availability explanation, never a fake chart or 0%                                                |
| PRJ-02 Projects      | Heading + Crear proyecto for managers; SearchField/status filters; DataTable with title, status, coordinator, dates and actions                                                                                                        | Prioritize title/status/date; secondary details appear in row expansion or project workspace                        | Default table, not card gallery. Project edit/create opens contextual form; destructive action is in named menu with confirmation                                      |
| TSK-01 Tasks         | Project selector first, FilterBar, DataTable/TaskRow with assignee/status/priority/due date; manager-only Crear tarea                                                                                                                  | Selected project stays visible; rows stack without clipping; filters wrap                                           | Before selection: instruction to select a project, not an empty task list; retain draft if save fails                                                                  |
| PRO-01 Progress      | Project selector, supported author/task filters, ActivityTimeline with author/time/title/body/evidence and relevant actions                                                                                                            | Single chronological column; evidence links wrap; metadata remains readable                                         | A new-entry action opens Registrar avance; no unsupported comment composer. New events offer controlled refresh when reader is in history                              |
| BUD-01 Budget        | Project selector, restrained assigned/executed context, rubric table, executions list and evidence entry where supported; one permitted budget action                                                                                  | Values align in labeled pairs; tables adapt or scroll only in a named local region                                  | Budget 404 uses Sin presupuesto with manager CTA. Create/edit opens form; no Notion sync badge on finance                                                              |
| REP-01 Reports       | Project selector and permitted report-kind choice beside/before a session job list. Each job row shows type, project, text state, timestamp, action                                                                                    | Form then jobs in one column; actions below status, not squeezed next to long titles                                | QUEUED/PROCESSING use text status, READY shows download, FAILED shows supported retry. Session list is explicitly not a historical archive                             |
| ADM-01 Institutional | Same four-level grammar as coordinator, institution scope explicitly named; institutional project table; no invented call totals                                                                                                       | Same responsive hierarchy, no compressed multi-chart dashboard                                                      | Status counts use scoped totals; omit unavailable aggregate metrics. One consistent overview design, not a separate admin visual language                              |
| ADM-02 Call detail   | Breadcrumb, call title/context, summary, associated-project table, budget/evidence section; use explicit unavailable integration state until contracts exist                                                                           | Summary becomes labeled stack; project table uses priority columns                                                  | Build presentational structure now with typed UI view model; fixtures only in development/demo mode. Production says integration unavailable, not no projects          |
| ADM-03 Audit         | Title and context; potential filter area; chronological semantic table with actor, action, entity, time, origin; neutral visual tone                                                                                                   | Labeled audit entries with readable times and no truncated essential action                                         | Build shell and reusable presentation now. Unsupported filters stay non-operational and explained; no fabricated endpoint or audit history                             |
| ADM-04 Users         | Heading + Crear usuario, semantic table of name/email/roles/active state/actions; create/edit contextual form                                                                                                                          | Name/status first, email wraps, roles visible in secondary row; actions remain 44 px                                | Only supported list pagination/sort. No unsupported server role/search filters. Deactivation and hard delete have distinct labels/consequences                         |
| COM-01 Chat          | Chat title/connection context, main chronological message list, composer anchored within conversation region, optional compact presence rail                                                                                           | Presence opens from a named control; composer avoids keyboard overlap; history remains readable                     | Preserve scroll anchor; Nuevos mensajes action when reading history. Plain-text bubbles/rows are restrained; no unsupported reactions/attachments                      |
| COM-02 Notifications | Accessible anchored panel with title, current-session list, timestamp/context, permitted links and empty message                                                                                                                       | Dialog sheet with proper focus management; no new route                                                             | Session-only notices; no fake cross-device unread state. Close returns focus to trigger                                                                                |
| SYS-01 Forbidden     | Existing safe shell if available; compact ErrorState with restrained icon, No tienes permiso, explanation and authorized return                                                                                                        | Same single readable region, no giant error numerals                                                                | Do not disclose resource existence or auto-fetch a forbidden detail to improve the message                                                                             |
| SYS-02 Not found     | Quiet ErrorState with No encontramos esta página, short context and safe return; no decorative hero                                                                                                                                    | Single readable region and full-width return action if useful                                                       | Preserve distinction from budget-empty and chat-disabled; unknown URL is not an invitation to invent a screen                                                          |

### 3.3 Overlay and State Recipes

- Registrar avance: Dialog drawer on wide screens, full-width sheet on compact screens; title and close, labeled title/description, optional task selector, supported evidence links and separate file upload, footer Cancelar/Guardar avance. Scroll body independently, keep actions accessible without obscuring fields. Preserve values on 400/429/network failure; confirmed save displays actual sync state.
- Project/task/user forms: same visual anatomy and focus behavior; only contract fields. Short forms use a centered dialog, longer forms a drawer; choose autonomously based on content, not on missing frame ownership.
- ConfirmDialog: concise consequence, safe cancel, specific destructive verb; no celebratory icon or vague Aceptar. Loading prevents repeat execution and retains dimensions.
- Loading: reproduce the final row/metric silhouette with Skeleton, not a full-page spinner. Refetch keeps existing data. Empty: small original note motif only when useful, specific heading, permitted next action. Filter mismatch has reset action, not create.
- Error: icon + domain explanation + valid recovery beside affected content; validation errors link to fields. Connection banner is nonblocking. Saved-but-sync-failed never looks like lost data. Use the ten-state mapping in DESIGN.md plus section 8.
- These recipes authorize all responsive, empty/loading/error, focus, hover, disabled, dark-theme, and reduced-motion variants directly. No node assignment or F1 review is needed to implement them.

Implementation mode: DIRECT-BUILD for every registry row. Contract labels remain independent: CONTRACT-DOC is documented support, CONTRACT-PARTIAL is scoped support, CONTRACT-BLOCKED is missing backend support. All presentational layouts may be built now; never invent data or relax permissions to wire a blocked operation.

## 4. Endpoint and Realtime Legend

All REST paths below include /api/v1. Use the single typed API client and @quantia/contracts schemas. No browser Supabase, Notion, or Redis access; no ad-hoc requests inside presentational components.
Authentication uses reviewed Next /api/session/login, /refresh, /logout transport handlers to protect the rotating refresh cookie; these forward to /api/v1/auth/login, /auth/refresh, /auth/logout. Refresh credentials are never returned to browser JavaScript.

Socket profiles used by the screen registry:

- N: authenticated /notifications, automatic personal room; documented event presupuesto.ejecucion-baja only, shown only to permitted financial roles. Deduplicate against project events by projectId + updatedAt. No notification REST/history/read-state endpoint is documented.
- P: /projects only while a project-scoped view is mounted. Authenticate then join { projectId } with server ack; rejoin after reconnect. Events: tarea.actualizada, avance.registrado, proyecto.retrasado, presupuesto.ejecucion-baja. The screen consumes only relevant/authorized events and refetches sync/detail fields from REST.
- G: /general only while /chat is mounted; automatic fixed room general, no project join. Events: chat.general.presencia, chat.general.usuario-conectado, chat.general.usuario-desconectado, chat.general.mensaje-creado.
- None: no screen-specific socket; authenticated global shell may still own N.
  One provider owns all sockets. Respect the documented total five-connections-per-user limit across tabs/namespaces; do not create one socket per component/project row. No leave event is documented; unmount/disconnect owned project scope and ignore irrelevant payloads. Do not invent overview/global project subscriptions.
  Missing contract events: reporte.completado and sync.failed. Reports use polling; sync state is read from REST. No screen may subscribe to these proposed names until contracts support them.

## 5. Canonical Screen Registry

Each row is a screen contract: route, access, optional historical reference/build recipe, REST, events, requirements, and integration status. DIRECT-BUILD applies to every row; no visual gate remains. Shared system overlays are mapped separately in section 7.

| Screen ID / route                              | Access and scope                                                                       | Optional reference / direct build | REST consumed / mutations                                                                                                                                                      | Socket profile and events used                                                                                 | RF / RNF traceability                                                            | Integration status                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| AUTH-01 /login                                 | Public; authenticated session returns to safe authorized destination or role landing   | Direct-build: section 3           | Session login -> POST /api/v1/auth/login; session refresh when applicable; GET /api/v1/users/me after success                                                                  | None until authenticated shell mounts                                                                          | RF-01/02/03; RNF-01/02/11/12                                                     | DIRECT-BUILD; CONTRACT-DOC                                                       |
| RES-01 /mis-tareas                             | Investigator; self-assigned tasks in accessible projects                               | 4:2                               | GET /api/v1/users/me; GET /api/v1/projects; GET /api/v1/projects/:projectId/tasks?assigneeId=me.id; PATCH /api/v1/projects/:projectId/tasks/:taskId only when assignee/manager | N only; no cross-project P subscriptions; refetch on focus and after mutations                                 | RF-06/07/08; RNF-01/07/10/11/12                                                  | DIRECT-BUILD; CONTRACT-PARTIAL for global task feed                              |
| PRJ-01 /proyectos/[id]                         | All roles with project access; capabilities depend on resource, not role label alone   | Direct-build: section 3           | GET /api/v1/projects/:id; GET /api/v1/projects/:id/tasks; GET /api/v1/projects/:id/progress; GET /api/v1/projects/:id/documents; nested mutations per sections 6/7             | N + P; tarea.actualizada, avance.registrado, proyecto.retrasado; financial event only in permitted budget view | RF-04/05/06/07/08/14/15; RNF-01/02/09/10/11/12                                   | DIRECT-BUILD; CONTRACT-DOC; comments unsupported                                 |
| COO-01 /dashboard                              | Coordinator; managed portfolio metrics and permitted alerts                            | 183:1051                          | GET /api/v1/projects with permitted status filters/meta.total; scoped budget requests only when justified; GET /api/v1/dashboard is MISSING, do not call                       | N: presupuesto.ejecucion-baja; no invented global project room                                                 | RF-10/11/12/13/19; RNF-01/02/07/11/12                                            | DIRECT-BUILD; CONTRACT-PARTIAL; KPIs from status counts (183:1051)               |
| PRJ-02 /proyectos                              | Coordinator/admin; accessible projects with management capability per row              | Direct-build: section 3           | GET /api/v1/projects; POST /api/v1/projects; PATCH/DELETE /api/v1/projects/:id; member actions only inside approved contextual forms                                           | N; no row-level sockets; refetch after mutation/focus                                                          | RF-04/05/19; RNF-01/02/07/10/11                                                  | DIRECT-BUILD; CONTRACT-DOC                                                       |
| TSK-01 /tareas                                 | Coordinator/admin; selected accessible project; no assumed cross-project endpoint      | Direct-build: section 3           | GET /api/v1/projects for selector; GET/POST /api/v1/projects/:projectId/tasks; GET/PATCH/DELETE /api/v1/projects/:projectId/tasks/:taskId; management UI stricter than API     | N + P for selected project: tarea.actualizada; proyecto.retrasado updates project context                      | RF-06/19; RNF-01/02/07/10/11/12                                                  | DIRECT-BUILD; CONTRACT-DOC for project-scoped view                               |
| PRO-01 /avances                                | Coordinator/admin; selected accessible project                                         | Direct-build: section 3           | GET /api/v1/projects; GET/POST /api/v1/projects/:projectId/progress; GET/PATCH/DELETE /api/v1/projects/:projectId/progress/:progressId where author/manager                    | N + P: avance.registrado; refetch relevant resource; no comment event                                          | RF-07/14/19; RNF-01/02/09/10/11/12                                               | DIRECT-BUILD; CONTRACT-DOC; comments CONTRACT-BLOCKED                            |
| BUD-01 /presupuesto                            | Coordinator/admin only; selected project; edit only manager                            | Direct-build: section 3           | GET /api/v1/projects; GET/POST/PATCH /api/v1/projects/:projectId/budget; GET/POST /api/v1/projects/:projectId/budget/executions                                                | N + P: presupuesto.ejecucion-baja; deduplicate                                                                 | RF-09/11/12/13/19; RNF-01/02/09/11                                               | DIRECT-BUILD; CONTRACT-DOC for project budget; institutional aggregation partial |
| REP-01 /reportes                               | Coordinator/admin; project-scoped reports; financial kinds require canViewBudgetDetail | Direct-build: section 3           | GET /api/v1/projects; POST /api/v1/projects/:projectId/reports; poll GET /api/v1/projects/:projectId/reports/:reportId                                                         | N shell only; NO reporte.completado                                                                            | RF-16; RF-17 institutional portion blocked; RNF-01/02/07/11                      | DIRECT-BUILD; CONTRACT-DOC for individual jobs; no server report-list endpoint   |
| ADM-01 /institucional                          | Administrator only; institutional overview                                             | 27:164                            | GET /api/v1/projects with status filters/meta.total; /api/v1/dashboard, call aggregates, and institutional reports are MISSING                                                 | N; no global project-room fan-out                                                                              | RF-10/11/12/13/17/19; RNF-01/02/07/11/12                                         | DIRECT-BUILD; CONTRACT-PARTIAL; unsupported aggregates blocked                   |
| ADM-02 /convocatorias/[id]                     | Administrator target view; no production navigation until contract exists              | 26:82                             | NONE documented for calls; do not invent /api/v1/convocatorias, /calls, or callId filters                                                                                      | None specified; no call namespace/event documented                                                             | RF-09/17; RNF-01/02/09/11                                                        | DIRECT-BUILD; CONTRACT-BLOCKED                                                   |
| ADM-03 /auditoria                              | Administrator only; coordinator access not approved                                    | Direct-build: section 3           | NONE documented; do not invent /api/v1/audit or /auditoria                                                                                                                     | None; no audit event documented                                                                                | RF-18; RNF-01/02/09/11                                                           | DIRECT-BUILD; CONTRACT-BLOCKED                                                   |
| ADM-04 /usuarios                               | Administrator only; user and role administration                                       | Direct-build: section 3           | GET/POST /api/v1/users; GET/PATCH/DELETE /api/v1/users/:id; GET /api/v1/users/directory?q=... only in supported picker context                                                 | N shell only; no user-change socket event documented                                                           | RF-02/03; RNF-01/02/09/11 (user administration scope; detailed RF ID to confirm) | DIRECT-BUILD; CONTRACT-DOC                                                       |
| COM-01 /chat                                   | All authenticated roles if General Chat enabled; semillero-wide, not project chat      | Direct-build: section 3           | GET /api/v1/chat/general/messages?cursor&limit; POST /api/v1/chat/general/messages                                                                                             | N + G: all four ChatGeneral events from section 4; no P connection solely for chat                             | RNF-01/02/11/12; additive Chat General acceptance; no invented RF number         | DIRECT-BUILD; CONTRACT-DOC                                                       |
| COM-02 notification center (overlay, no route) | Authenticated shell; only received permitted session notices                           | Direct-build: section 3           | NONE; no notification REST, persistent history, or read-state endpoint documented                                                                                              | N: presupuesto.ejecucion-baja; report-ready notice originates from polling/store, not a socket event           | RF-12/13; RNF-01/02/11                                                           | DIRECT-BUILD; CONTRACT-PARTIAL, ephemeral center only                            |
| SYS-01 403 presentation                        | Any denied request/URL; no resource disclosure                                         | Direct-build: section 3           | No dedicated endpoint; render from authorization result                                                                                                                        | No socket for forbidden resource                                                                               | RNF-02/11                                                                        | DIRECT-BUILD; contract error handling                                            |
| SYS-02 404 presentation                        | Unknown route or inaccessible/missing resource as returned by API                      | Direct-build: section 3           | No dedicated endpoint; consume existing request's 404; distinguish special budget/chat 404 meanings                                                                            | None for missing resource                                                                                      | RNF-01/02/11                                                                     | DIRECT-BUILD; contract error handling                                            |

403/404 are semantic error presentations, not new business routes. Use the installed Next.js version's supported error/not-found mechanism; optional explicit /403 or /404 redirects require a routing decision, not automatic file generation.
Do not interpret missing backend integration as an empty database. Build the presentation immediately; production data actions remain absent until supported. Calls/audit may be reached through their documented authorized URLs as explicit integration-unavailable states; keep unsupported operational navigation hidden rather than claiming the modules work. Development fixtures must be isolated from production.

## 6. Screen-Specific Composition and Attention to Detail

### AUTH-01 Login

One calm form beside an original research-note illustration on paper/blue/sage. No fabricated institutional logos, password reset, registration, social sign-in, or onboarding routes.
Use TextField, Button, ErrorState and the shared form pattern. Persistent labels "Correo" / "Contraseña"; generic invalid-credential message; optional password visibility action with accessible name. Successful login waits for /users/me before routing.
Single-flight submit; no layout jump on error; 429 timer from Retry-After; no credentials in URL/storage/logs. On compact screens, reduce artwork first, never form readability. Animate form/panel opacity only within DESIGN.md durations.

### RES-01 My Tasks

Urgency groups: overdue -> this week -> upcoming. Show project identity, task title, assignee context when necessary, due date, status, and permitted update/progress action. No financial widgets or institutional KPI strip.
Cross-project task collection has no dedicated endpoint: enumerate accessible projects with bounded pagination and at most four concurrent nested task requests. Never claim a global count/order after fetching only one page; show progressive coverage or require a project filter until the full required scope is obtained. Do not download the entire institution to manufacture a feed.
A failed project request is a partial-loading error, not "No tienes tareas". Preserve visible tasks while refetching; return navigation preserves filters and scroll. Register progress always has an explicit project/task context.

### PRJ-01 Project Workspace

Default researcher tabs: "Tareas", "Bitácora", "Documentos". Preserve the selected tab in one validated URL parameter (proposed tab=tareas/bitacora/documentos); it is frontend state, never sent as an API query.
Header shows project title, status, responsible identity/context, and one permitted primary action. Avoid a dashboard nested inside every tab. Financial detail is not another researcher tab; authorized finance actions lead to BUD-01 with project context.
Tasks tab uses TaskRow/DataTable and authorized actions. Bitácora uses ActivityTimeline and progress panel. Documents use DataTable/FileUploader with status UPLOADED/SCANNED/QUARANTINED; download only when allowed and SCANNED, obtaining a short-lived URL on demand.
Upload endpoint: POST /api/v1/projects/:id/documents (multipart field file); GET /api/v1/projects/:id/documents/:documentId/download; DELETE /api/v1/projects/:id/documents/:documentId only for managers. Limits documented by integration guide: PDF/PNG/JPEG/XLSX, 25 MB; confirm current contract/config before release.
No generic comment thread, mentions, or reactions until their contract exists; RF-14 remains partial, not silently implemented as chat.

### COO-01 / ADM-01 Overviews

Enforce DESIGN.md Patterns: Level 1 Estado (at most four KPIs; only large DATA values), Level 2 Atención, Level 3 Comparación, Level 4 Detalle. Keep page-title hierarchy without a marketing hero.
Status counts may come from GET /projects status-filter meta.total, scoped by API. A list response does not supply reliable financial-execution, completed-deliverable, call-level, or research-progress aggregates. If unavailable, omit/mark the affected metric as unavailable by approved design; never substitute zero, fabricated percentages, or a count computed from one page.
The existing frame's four slots do not justify inventing values. Real interpreted comparisons require real comparable measures, periods, and approved rules; 78,0% budget versus 45,0% progress is only a sample, not a live alert formula.
Portfolio-wide delayed-project realtime is not documented. Refetch on focus/manual refresh; show freshness honestly rather than claiming all KPIs stream live.
Institutional call-based filters remain design-only until contract support. Do not send unsupported financing, group, call, or date parameters to GET /projects.

### PRJ-02 / TSK-01 / PRO-01 Work Lists

Use a single aligned FilterBar and a compact results region, not a grid of cards for every row. On /tareas and /avances an accessible project selector defines the API scope; project selection belongs in validated frontend URL context, not an invented global endpoint.
Projects permit q/status/sortBy/sortOrder; tasks permit status/priority/assigneeId/sortBy/sortOrder; progress permits taskId/authorId/sortBy/sortOrder, plus supported pagination. Only send actual schema fields.
Only managers create tasks in the UI even if API project-access rules are broader. Assignment choices are project.memberIds plus coordinatorId, not every directory user. Member/coordinator search uses directory q length >=2 and supported fields; it must not become an unregistered custom Select/combobox family.
Mutations use canonical nested paths, never PATCH /api/v1/tasks/:id. Status/priority/assignee changes may be controlled optimistic updates with rollback; other mutations await persistence.

### BUD-01 Budget

Desktop: calm summary followed by rubric/execution table and evidence context. Mobile: labeled stacked detail or locally scrollable genuinely two-dimensional table. Numeric baselines align; no decorative illustrations or colorful metric tiles.
GET budget 404 means "Sin presupuesto" with create action only for a manager, not a global not-found page. Budget has no syncStatus because it lives only in Postgres.
Editing items replaces the list under the documented PATCH contract: preserve unchanged items and confirm destructive effects; do not treat it as a per-item patch. Evidence linkage must reflect returned contract fields; if support/document association is missing, flag a gap instead of inventing a URL or relation.
Severity follows backend rules. Budget low-execution event includes executedPercent/thresholdPercent, not a progressPercent or arbitrary reason field.

### REP-01 Reports

A scoped generation form plus session-owned job status, not a fabricated server-side report archive. Offer documented kinds only: BUDGET_PDF, BUDGET_EXCEL, PROGRESS_PDF according to capability.
POST /projects/:projectId/reports accepts kind, not arbitrary current filters. Do not claim exports preserve filters unless an updated contract supports those parameters. State scope clearly as the selected project and report kind; RF-16 filtered exports and RF-17 institution-wide exports remain partially blocked.
Poll the nested report-status endpoint, back off, survive navigation via approved session job store, and announce READY with Toast. Do not subscribe to reporte.completado, invent progress percentages, or retain signed URLs in storage. No institutional bulk aggregation/download shortcut without backend support.

### ADM-02 Calls / ADM-03 Audit

Implement the presentational layouts now using section 3. Calls: call summary, associated projects, budget context, evidence entry points. Audit: filters, chronological rows with actor/action/entity/time/origin. These are product intent, not assumed response schemas.
Do not fabricate tables with mock data in a production session, expose coordinator audit, or invent endpoints to fit existing frames. Design prototype fixtures must be explicitly labeled and separated from production.

### ADM-04 Users

One semantic table, clear active/inactive state and role labels, contextual create/edit form, explicit destructive confirmation. Prefer PATCH isActive=false to hard delete when the workflow calls for deactivation.
GET /users supports pagination/sortOrder, not role/search filters. Directory search is a different endpoint returning active identity entries; it cannot serve as complete user administration data or imply roles. Required request fields and RoleName enums come from installed contracts.
User creation/edit forms remain on this route as approved overlays, not invented /usuarios/nuevo and /usuarios/[id]/editar routes. Hard delete requires a strong ConfirmDialog; no destructive one-click switch.

### COM-01 General Chat

A single quiet conversation with message list, composer, and public presence list. Wide view may show a restrained presence rail; compact view reveals participants in an accessible approved panel, not an additional permanent sidebar.
Use ChatMessage, PresenceList, MessageComposer, ConnectionStatus and canonical controls. Plain-text messages, author/time, restrained own-message distinction; no glossy bubbles, excessive avatar repetition, neon online dots, unsupported attachments, typing indicators, reactions, editing, or read receipts.
History is newest-first from API; paint chronologically and preserve scroll anchor when loading older cursor pages. New messages never drag a reader away from history; offer a controlled "Nuevos mensajes" action.
Generate clientMessageId once, retain it for retries, deduplicate server/client IDs. Delivery becomes sent only after persisted confirmation; preserve failed draft. Use configured length and rate-limit countdown, not invented capacity.
Presence is authoritative server data, deduplicated across tabs; reconnect replaces the snapshot. A disconnect alone is not proof chat is disabled: refresh/reconcile auth and transport failures; hide feature only when supported config/API evidence confirms disabled (documented disabled REST 404). No infinite reconnect loop.

## 7. Contextual Panels and Shared System Views

These are overlays/states of registered screens, not additional routes. Build them directly from section 3.3; node IDs and design handoff are not prerequisites.

| ID / parent                                                     | Anatomy and authorized behavior                                                                                                                                | Endpoint/event binding                                                                                                                                             | RF / RNF                        |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| OVR-01 Registrar avance / PRJ-01 or RES-01 with project context | Title, description, optional valid task, evidence links, optional recorded date, save/cancel; wide drawer / compact full-width sheet; focus returns to trigger | POST /api/v1/projects/:projectId/progress; optional document upload is a separate supported request; avance.registrado refetches; SyncStatus from response/refetch | RF-07/08/15; RNF-01/02/10/11/12 |
| OVR-02 Project create/edit / PRJ-02 or PRJ-01                   | Approved form with contract fields, manager checks, coordinator/member controls; no route invention                                                            | POST/PATCH /api/v1/projects[/:id]; GET /api/v1/users/directory?q=... for permitted pickers; POST/DELETE nested member endpoints for individual membership changes  | RF-04/05; RNF-02/09/10/11       |
| OVR-03 Task create/edit / PRJ-01 or TSK-01                      | Title, description, permitted assignee, status, priority, due date; one save action; preserve input on failure                                                 | POST/PATCH /api/v1/projects/:projectId/tasks[/:taskId]; tarea.actualizada patches in place                                                                         | RF-06; RNF-01/02/10/11          |
| OVR-04 Session expired / any protected screen                   | Specific reauthentication flow, preserve permitted draft safely, no token leakage, restore intended authorized action                                          | Single-flight refresh once; then session login + GET /users/me; re-check permissions after login                                                                   | RF-01/02/03; RNF-02/11          |
| OVR-05 Notification center / shell                              | Header, current-session event list, contextual permitted links, empty state; no persistent unread badge or fake mark-all-read API                              | Profile N; report job completion from store; no REST history or read mutation                                                                                      | RF-12/13; RNF-01/02/11          |
| SYS-03 Sync failure / affected project/task/progress            | State beside entity, explicit saved-versus-sync distinction; administrator retry stays absent while contract missing                                           | REST syncStatus PENDING/SYNCED/FAILED; NO /sync/:entityType/:id/retry call and NO sync.failed subscription                                                         | RF-15; RNF-10/11                |
| SYS-04 Connection degraded / active live view                   | Nonblocking freshness banner, auto reconnect/manual action, no forced redirect                                                                                 | Actual socket profile; refetch after reconnect; stop loops on connection budget/auth rejection                                                                     | RF-13; RNF-01/11/12             |

API payload for OVR-01 requires title and description; do not reproduce a simplified wireframe that omits required title. evidenceLinks are not an invented binary upload property. TaskId must belong to selected project. Successful POST confirms persistence before pending Notion sync is shown.
No fresh data mutation after automatic re-login without revalidating user intent and preventing duplicate submissions.

## 8. Global State Coverage

Every data-consuming screen must declare applicable states in its handoff, using DESIGN.md components only:

1. Initial loading: local structure-matched Skeleton, never fake zero metrics.
2. Empty/no search results: distinct EmptyState and authorized next action.
3. Validation/400: inline field explanation; preserve draft.
4. 401: one refresh path, then OVR-04 without silent data loss.
5. 403: SYS-01, no resource disclosure or hidden fallback fetch.
6. 404: SYS-02 except documented budget-empty/chat-disabled cases.
7. 409/413: contextual conflict/file-size recovery when the operation supports it.
8. 429: ErrorState/form notice with Retry-After; no early retry or screen-wide blocking of unrelated work.
9. Pending/failed sync: projects/tasks/progress only; never budget/documents/chat/reports.
10. Async job: queued/processing/ready/failed from server, continuing across navigation.
11. Event received: patch/refetch without reordering focused content; user applies changed sort.
12. Socket disconnected: SYS-04; no invented offline-write guarantee.
13. 5xx/offline fetch: scoped ErrorState with recovery; retain already loaded data honestly when safe.
    Applicable is not optional: list nonapplicable states explicitly. Do not attach Socket ConnectionStatus to a screen with no live-data dependency merely as decoration.

## 9. Visual Craft, Navigation, and Motion Rules

- Sidebar is a designed navigation surface, not a square full-height slab pasted onto every role. Proposed refinement: an inset floating surface with radius/featured, subtle boundary, balanced padding, rounded selected row, quiet group labels, and stable active indicator. Choose geometry from section 3.1 and validate it in the running app; no Figma approval is required. Use existing tokens, not ad-hoc values. Mobile uses Radix Dialog drawer.
- Softness is purposeful: control/card/featured radii follow DESIGN.md. Do not turn every control into a pill, over-round tables, or fix an awkward sidebar by adding heavy shadow/glass blur.
- Maintain optical alignment of icon centers, text baselines, row actions, numeric columns, and header actions. Long names wrap intentionally; loading/error never shift button width or shell geometry.
- One clear primary action per decision region. Use whitespace and typography rather than cards around every label. DataTable rows are not card grids; repeated empty rounded boxes fail review.
- Expressive art is original research imagery on muted paper/blue/sage in login/onboarding/true empty states. No decorative backgrounds behind financial data, audit, tables, or forms. No neons, gradients, glow, glassmorphism, oversized mascot dashboards, generic stock illustrations, or fake AI badges.
- Motion uses DESIGN.md tokens: 150 ms subtle control feedback, 200 ms standard transitions, 250 ms panels; transform/opacity only; no spring overshoot, bounce, scale-on-every-hover, parallax, or ornamental entrance cascades.
- Use a brief panel transition with stable content placement, not a slideshow between routes. Pending requests do not delay navigation animations. Preserve scroll/filter context when returning to a list.
- Focus follows logical route navigation, form error correction, and overlay open/close; never a socket event. Reduced motion removes slides/shimmer without hiding content or state meaning.
- Percentages in comparable data use DESIGN.md's one decimal; reuse centralized formatters. Frontend guide examples use a COP currency symbol while DESIGN.md requests explicit COP: normalize the shared formatter after approval, never format per screen.
- Existing source documents disagree on typography, breakpoints, some prop names, and route aliases. Apply this direct-build authorization and DESIGN.md through one coherent code/theme migration; document decisions in the change instead of waiting for F1. Do not mix old and new implementations.

## 10. Contract Gap Ledger (Do Not Implement Around It)

| Need                                            | Current evidence                                      | Consequence / next decision                                                                           |
| ----------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| GET /api/v1/dashboard                           | Missing per frontend integration guidance             | Status-count composition only; missing KPI measures require backend contract, not placeholder numbers |
| Global my-tasks/tasks/progress feeds            | No cross-project endpoint documented                  | Bounded scoped composition for RES-01; project selector for TSK-01/PRO-01; honest coverage            |
| Calls and institutional aggregates              | No endpoint/schema documented                         | ADM-02 production-blocked; ADM-01 partial; no invented call filters                                   |
| Audit                                           | No endpoint documented                                | ADM-03 production-blocked; coordinator permission remains unapproved                                  |
| Institutional/filtered exports                  | Project report POST accepts kind only                 | REP-01 project reports supported; wider RF-16/17 scope blocked                                        |
| Report archive list                             | No endpoint documented                                | Session job tracking only, never claim complete history                                               |
| Report completion event / sync.failed           | Missing in contract                                   | Poll nested report status; refetch resource syncStatus                                                |
| Sync retry                                      | No endpoint documented                                | Hide retry even for administrator until supported                                                     |
| Progress comments                               | No endpoint documented                                | Read-only timeline and author/manager edits only; RF-14 partial                                       |
| Notification persistence/read state             | No REST documented                                    | Session-only event center; no cross-device read history                                               |
| Evidence/expense linkage beyond returned fields | Product requirement exceeds documented budget payload | Obtain actual relation/download contract; no synthesized evidence                                     |

A gap is not permission to build a new backend service, browser Supabase call, fake client database, or inferred endpoint. Record it for the backend owner and keep UI truthful.

## 11. Immediate Implementation and Self-Review

Start work from Screen ID, route, authorized role/resource scope, section 3 build recipe, section 5 integration map, and installed contracts. No Figma URL, node ID, F1 handoff, paired screenshot, or visual approval is required. Do not ask the user to supply missing frames.
Choose unresolved presentational details autonomously using DESIGN.md. Extend canonical component props and document additions in the same change where necessary; do not wait for Figma registration or invent parallel component families. This does not authorize new backend contracts, weaker permissions, or unrelated product routes.
Build order: shared theme/shell and states -> Login -> My tasks + Project + progress drawer -> Projects/Tasks/Progress -> Budget/Reports -> Users -> Chat -> coordinator/institutional overviews with truthful available data -> Calls/Audit presentation with explicit integration-unavailable states.
Complete each functional vertical slice before polishing another: actual data/action, failure recovery, compact layout, and keyboard use. If an illustration or decorative detail delays delivery, omit it and keep the interface polished through typography/spacing.

Self-review per screen (compare the running interface to this written brief, not Figma):

- [ ] Route is unique; old aliases have a documented migration decision.
- [ ] Allowed/denied roles tested with server authorization; identity comes from /users/me.
- [ ] Realistic empty, long-title, high-value, loading, validation, failure, and permission states are usable.
- [ ] Data coverage and integration-unavailable states are honest; no unsupported requests or fabricated success.
- [ ] Canonical components and tokens are reused; any presentational extension is documented, not a parallel family.
- [ ] Inspect the running app at 390, 768, 1280 px; additionally check 320 px reflow and 1440 px composition. Implementation-only screenshots may support quick self-review but are not a Figma comparison gate.
- [ ] No page-level horizontal overflow; two-dimensional tables alone may scroll within a named accessible region.
- [ ] Light/dark, zoom, keyboard/focus/return, and reduced motion remain functional. Use available accessibility tooling and report checks not run.
- [ ] Dashboard has <=4 real KPIs, clear attention/comparison/detail hierarchy, and no decorative data.
- [ ] Inset softly shaped navigation, consistent radii, optical alignment, wrapping, and stable loading states feel intentional.
- [ ] No neon/glow/glass, gratuitous card grids, square generic sidebar, bounce, or ornamental entrance cascade.
- [ ] Run repository checks available for the touched work; report actual results. Do not claim tests or builds passed without running them.

Delivery does not wait for visual sign-off. Report what works, backend-dependent portions, and any known quality issue concisely. Optional later Figma documentation can follow the shipped implementation; it is not a dependency of this UI delivery.

## 12. Product Flows (Not Extra Routes)

Researcher: AUTH-01 -> RES-01 -> PRJ-01 -> OVR-01 -> confirmed save + sync status; return preserves task context.
Coordinator: AUTH-01 -> COO-01 -> scoped alert/project -> BUD-01 or PRJ-01/TSK-01 -> permitted intervention -> REP-01 project report.
Administrator: AUTH-01 -> ADM-01 -> ADM-02 -> BUD-01/evidence -> ADM-03 -> institutional report. Calls, audit, and institution-wide export steps remain contract-gated; do not present this full target journey as operational today.
Common: any authorized shell -> COM-01 if enabled; notification -> authorized resource; denial -> SYS-01; missing route/resource -> SYS-02.
Implement these journeys from their route/state contracts now. Historical flow nodes 13:166, 13:179, 26:44 are optional future references, not dependencies. Do not claim a node-to-journey association was verified.
