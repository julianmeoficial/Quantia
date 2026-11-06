# Quantia Design System

Canonical path: `DESIGN.md` (repo root). Read before ANY UI work.
Related: `.cursorrules` · `AGENTS.md` · `.cursor/docs/SCREENS.md` · `.cursor/docs/frontend-conventions.md` ·
`.cursor/rules/ui-design-system.mdc` · `.cursor/rules/accessibility-ux.mdc` · `.cursor/rules/api-integration.mdc`

Status: proposed visual direction; pending joint design approval, font testing, contrast checks, and Figma publication. This appendix does not certify the earlier completion checkboxes.
Scope: research project management application, authentication, onboarding, and optional product introduction. Documentation is English; production interface copy is Spanish.

## 1. Product Brief

Quantia helps research teams manage projects, tasks, progress, evidence, budgets, and reporting in one dependable workspace. Researchers need quick updates; coordinators need actionable oversight; administrators need institutional traceability.
The visual direction is warm research software: approachable editorial typography, quiet blue identity, paper-like backgrounds, original research illustrations, and precise operational interfaces.
Borrow Sunbeam's friendliness, generous framing, and illustrated product storytelling, not its service-business content, neon lime, exact assets, or decorative intensity.

## 2. Design Authority and Implementation Boundaries

- Preserve the existing role model, permissions, domain terminology, workflows, and API contracts.
- This proposal retains Quantia's primary blue and operational neutrals. It proposes Urbanist + Source Sans 3 instead of the earlier Inter specification, plus new decorative backgrounds and illustrations. Obtain approval before migrating existing components; never mix both typography systems indefinitely.
- Resolve conflicts explicitly in the shared Figma library and this document. Do not silently replace published decisions with an agent's interpretation.
- An approved Figma component governs its exact geometry; this document governs intent and constraints. Report discrepancies instead of inventing values.
- Existing stack: Next.js, TypeScript, Styled Components, Radix UI, Framer Motion, and Recharts; NestJS API with Supabase/Postgres, Notion integration, Redis, BullMQ, and Socket.io.
- Framer is a visual reference, not a replacement runtime. Do not introduce Tailwind, shadcn/ui, or another UI framework without approval.
- Motion stack (approved by the product owner, 2026-11-05): `motion` (Framer Motion successor, `motion/react`) for component state, presence and layout (FLIP) animation; GSAP (`gsap` + `@gsap/react`, via `src/lib/gsap.ts`) for choreographed one-shot timelines (first-paint reveals, login artwork). Shared tokens live in `src/lib/motion` (§12).
- Read DESIGN.md before UI work. Inspect existing components and the actual repository before proposing paths, commands, dependencies, or APIs.

## 3. Personality and Visual Tone

Keywords: thoughtful, warm, collaborative, clear, credible.
The product should feel like a well-organized research notebook, not a banking portal or an AI startup landing-page kit.

Use two complementary visual modes:

- Expressive mode: login artwork, onboarding, introductory sections, and genuinely empty workspaces. Warm paper, muted blue fields, original illustrations, generous spacing.
- Operational mode: dashboards, tasks, project detail, budgets, evidence, reports, and audit. Neutral surfaces, compact controls, clear alignment, minimal decoration.

Signature motif: a research thread connecting an observation, an evidence card, and a result. Use small rounded nodes and restrained paths in illustrations only; never confuse them with real workflow states.
A friendly character may appear in onboarding or an empty state, but is not required for every screen. Never place smiling mascots next to critical errors, financial warnings, or audit records.

## 4. Design Tokens

Architecture: primitive values -> semantic aliases -> component tokens where useful.
Raw values belong only in token definitions. Components consume semantic theme tokens, not copied hex values.
Figma slash paths map to nested Styled Components theme keys. Figma exports `action/*`; code exposes them as `theme.colors.brand.*` (DS-93). Status uses `error` (not `danger`). Keep one canonical mapping per token.

**Governance (DS-93):** Figma variables → W3C JSON in `src/theme/figma/` → `npm run tokens:build` → `src/theme/{light,dark,scales}.ts`. A token changes in one place (Figma), then re-export and rebuild.

### 4.0 Figma export inventory

| Collection / file                               | Path in repo                                 | Role                                                       |
| ----------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------- |
| Quantia · Semantic / Light                      | `src/theme/figma/semantic.light.tokens.json` | Canonical semantic colors (Light)                          |
| Quantia · Semantic / Dark                       | `src/theme/figma/semantic.dark.tokens.json`  | Canonical semantic colors (Dark)                           |
| Quantia · Primitives (Mode 1)                   | `src/theme/figma/primitives.tokens.json`     | Primitive hex + spacing, radius, layout, size, motion      |
| Component Mode 1 (`button` / `field` / `table`) | Not in repo yet                              | Component tokens for later DS issues — see §4.5            |
| Colección 1 Light/Dark                          | Not ingested                                 | WIP names (`text-same`, `bg-same`); superseded by Semantic |

### 4.1 Operational Colors (from Quantia · Semantic)

Theme API: `theme.colors.{bg,text,border,brand,selection,focus}`.

| Semantic token (Figma) | Light   | Dark    | Theme key              | Purpose                      |
| ---------------------- | ------- | ------- | ---------------------- | ---------------------------- |
| bg/canvas              | #F7F8FA | #101419 | colors.bg.canvas       | Application canvas           |
| bg/surface             | #FFFFFF | #181E25 | colors.bg.surface      | Panels, cards, tables        |
| bg/subtle              | #F0F3F6 | #202832 | colors.bg.subtle       | Grouping and table headers   |
| text/primary           | #18202A | #F2F5F8 | colors.text.primary    | Main content                 |
| text/secondary         | #56616F | #B4BEC9 | colors.text.secondary  | Supporting content           |
| border/subtle          | #D8DEE6 | #35404D | colors.border.subtle   | Nonessential separators      |
| border/control         | #7B8794 | #718096 | colors.border.control  | Necessary control boundaries |
| action/primary         | #315C8C | #79A8D8 | colors.brand.primary   | Brand / primary action       |
| action/primary-hover   | #274A70 | #8DB7E0 | colors.brand.hover     | Primary action hover         |
| action/primary-pressed | #203D5C | #6698CA | colors.brand.pressed   | Primary action pressed       |
| action/on-primary      | #FFFFFF | #101419 | colors.brand.onPrimary | Primary button label         |
| selection/bg           | #EAF1F8 | #203348 | colors.selection.bg    | Selected navigation and rows |
| selection/text         | #274A70 | #B8D5F2 | colors.selection.text  | Selected content             |
| focus/ring             | #315C8C | #79A8D8 | colors.focus.ring      | Keyboard focus               |

Not yet in Semantic export (proposed only — do not invent in generated theme): `color/disabled/*`, `color/overlay`, separate `color/brand/*` distinct from `action/*`.

Subtle borders are not automatically sufficient for accessible input boundaries. Use control borders when necessary. Never reduce an entire disabled form to unreadable opacity.

### 4.2 Status Colors (from Quantia · Semantic)

Figma pattern: `status/{state}/{text|icon|bg}`. Historical name `danger` → Figma/code `error`.

| State   | Light text/icon | Light bg | Dark text/icon | Dark bg |
| ------- | --------------- | -------- | -------------- | ------- |
| success | #247A4A         | #EDF7F0  | #65C78D        | #142B20 |
| warning | #92400E         | #FFFBEB  | #E1AE4C        | #302719 |
| error   | #B43A3A         | #FDEEEE  | #F08080        | #321E23 |
| info    | #256AA5         | #EFF6FF  | #77B8E8        | #192C3C |
| neutral | #56616F         | #EEF1F4  | #B4BEC9        | #252D36 |

Theme keys: `theme.colors.status.<state>.{text,icon,bg}` where state is success, warning, error, info, or neutral.
Use text/icon for labels and icons, bg for soft containers. Filled status buttons require their own tested on-color pairing.
Always combine status with text and, where useful, an icon. Warning yellow #E0B74D from the earlier palette is decorative only, not small text on white.

### 4.3 Expressive Backgrounds and Illustration Palette

Proposed only — **not** in current Semantic Figma export. Do not add to generated `light.ts`/`dark.ts` until variables exist in Figma.

| Token              | Light   | Dark    | Allowed use                          |
| ------------------ | ------- | ------- | ------------------------------------ |
| color/art/paper    | #F8F6F2 | #20211F | Auth and introduction backgrounds    |
| color/art/blue     | #E7EFF7 | #203348 | Research/project illustration panels |
| color/art/sage     | #E8EEE5 | #26332A | Collaboration and fieldwork artwork  |
| color/art/sand     | #F2EBDD | #342E24 | Evidence and document artwork        |
| color/art/lavender | #ECE9F2 | #2C2938 | Occasional exploration artwork       |
| color/art/ink      | #315C8C | #B8D5F2 | Illustration paths and outlines      |

These are art colors, not business-status colors. Lavender is a small optional illustration accent, never a purple gradient or primary action.
Prefer flat fields. No neon, glowing blobs, glass panels, animated gradients, or blurred colored spotlights.
In application views, keep art outside the main reading region. In login and onboarding, one illustration panel may occupy up to roughly 40% of the desktop composition.
No decorative artwork behind tables, form labels, charts, or long paragraphs. Background contrast must remain stable.

### 4.4 Primitives (from Quantia · Primitives / Mode 1)

Exported in `src/theme/figma/primitives.tokens.json` and generated into `src/theme/scales.ts`.

| Token               | Value   | Theme key                                            |
| ------------------- | ------- | ---------------------------------------------------- |
| spacing/4…64        | 4–64 px | `theme.space[4]` … `theme.space[64]` (rem)           |
| radius/control      | 6 px    | `theme.radii.control`                                |
| radius/card         | 10 px   | `theme.radii.card`                                   |
| radius/featured     | 16 px   | `theme.radii.featured`                               |
| layout/sidebar      | 240 px  | `theme.layout.sidebar`                               |
| layout/header       | 64 px   | `theme.layout.header`                                |
| size/control        | 44 px   | `theme.sizes.control`                                |
| size/table-row-min  | 48 px   | `theme.sizes.tableRowMin`                            |
| motion/duration-min | 150     | `theme.motion.duration.fast`                         |
| motion/duration-max | 250     | `theme.motion.duration.slow`                         |
| blue/700            | #315C8C | Primitive aliased by Semantic action/primary (Light) |
| color/value-\*      | hex     | Primitive hex values only; components use Semantic   |

Code adds `motion.duration.base = 200ms` (not in Figma) between min and max.

### 4.5 Component tokens (Mode 1 — not generated yet)

Documented from Figma component export for upcoming component work. Do not hand-copy into screens.

| Token                     | Light example |
| ------------------------- | ------------- |
| button/primary/background | #315C8C       |
| button/primary/hover      | #274A70       |
| button/primary/pressed    | #203D5C       |
| button/primary/foreground | #FFFFFF       |
| field/background          | #FFFFFF       |
| field/border              | #7B8794       |
| field/foreground          | #18202A       |
| table/divider             | #D8DEE6       |
| table/header/background   | #F0F3F6       |

## 5. Typography

Implemented (2026-11-05) via `next/font/google` in `src/app/layout.tsx`: `--font-sans` = Source Sans 3 (400/500/600) → `theme.fonts.sans`; `--font-heading` = Urbanist (500/600) → `theme.fonts.heading`, applied to h1–h3 globally.

Proposed families:

- Urbanist 500/600 for page headings, section headings, and short onboarding headlines. This adds a friendly geometric character without copying Sunbeam's brand.
- Source Sans 3 400/500/600 for body, navigation, controls, tables, and metrics. Prioritize legibility and numeric clarity in dense research workflows.
- Fallback: system-ui, sans-serif. Load approved font files through the project's existing font strategy; avoid blocking remote runtime font requests.
- No third decorative typeface. Do not substitute Inter, Roboto, or Space Grotesk without an explicit design decision.

| Token            | Family        | Size / line height | Weight | Use                                     |
| ---------------- | ------------- | ------------------ | ------ | --------------------------------------- |
| type/display     | Urbanist      | 48 / 56 px         | 500    | Introduction only; 32/40 on mobile      |
| type/page        | Urbanist      | 32 / 40 px         | 600    | Application page title; 24/32 on mobile |
| type/section     | Urbanist      | 24 / 32 px         | 600    | Main section                            |
| type/panel       | Urbanist      | 20 / 28 px         | 600    | Dialog and panel title                  |
| type/body        | Source Sans 3 | 16 / 24 px         | 400    | Main reading and form inputs            |
| type/body-strong | Source Sans 3 | 16 / 24 px         | 600    | Short emphasis                          |
| type/compact     | Source Sans 3 | 14 / 20 px         | 400    | Tables and compact information          |
| type/label       | Source Sans 3 | 14 / 20 px         | 500    | Labels and navigation                   |
| type/button      | Source Sans 3 | 14 / 20 px         | 600    | Button labels                           |
| type/caption     | Source Sans 3 | 12 / 16 px         | 400    | Nonessential metadata only              |
| type/metric      | Source Sans 3 | 32 / 40 px         | 600    | KPI values                              |

Use tabular numerals for metrics, money, dates in aligned tables, and percentages. Right-align quantities, not prose.
No all-caps navigation, extreme tracking, gradient text, or oversized dashboard headlines. Test Spanish accents, long project names, COP values, and zoom before approving fonts.

## 6. Spacing, Shape, and Elevation

Spacing tokens (Figma Primitives → `theme.space`): space/4=4, space/8=8, space/12=12, space/16=16, space/24=24, space/32=32, space/48=48, space/64=64 px (consumed as rem).
Use 8 between icon and label, 8 between label and input, 16–24 within groups, 24 for card padding, 32–48 between major sections, and 48–64 in expressive compositions.
Parent Stack/Grid components own spacing. Do not fix layout with arbitrary heading margins or empty spacer elements.

Radius tokens (Figma → `theme.radii`): radius/control=6, radius/card=10, radius/featured=16 px; code adds `radii.full=9999rem` for avatars/pills. Proposed only: radius/art-frame=24 px (not in current export).
The 24 px art frame is for expressive wrappers only, not ordinary tables or cards. Operational buttons remain 6 px, not pills everywhere.

Elevation tokens (DESIGN.md foundation — not in Figma export yet):

- elevation/0: none; default for operational cards with a subtle border.
- elevation/1/light: 0 2px 8px rgba(24,32,42,0.08) → `theme.elevation.sm`.
- elevation/2/light: 0 8px 24px rgba(24,32,42,0.16) → `theme.elevation.md`.
- elevation/1/dark: 0 2px 8px rgba(0,0,0,0.24) → `theme.elevation.lg` (shared until dark-specific elevation tokens export).
- elevation/2/dark: 0 8px 24px rgba(0,0,0,0.40).
  Use level 2 for floating menus and dialogs. Dark elevation also needs a visible surface boundary.

## 7. Layout and Responsive Patterns

Layout/size from Figma Primitives: sidebar=240 px, header=64 px, control=44 px, table-row-min=48 px → `theme.layout` / `theme.sizes`. Proposed: content-max=1440 px, reading-max=720 px, control-large=48 px (code: `sizes.containerMax` = 1440 px / 90rem).
Code breakpoints (DS-93): `theme.breakpoints` + `theme.media.up('sm'|'md'|'lg'|'xl')` = 390 / 768 / 1280 / 1440 px.
Narrative layout bands: compact below 768 px; medium 768–1279 px; wide 1280 px and above. These are layout thresholds, not device assumptions.
Wide screens: 12-column content grid, 24 px gap, 32 px outer padding. Medium: 8 columns, 24 px padding. Compact: 4 columns, 16 px gap and padding.
Use fluid widths and content-driven wrapping. Breakpoints never justify clipped labels or fixed-height text containers.

- App shell: role-aware sidebar, quiet header, page title/action row, then relevant content.
- Coordinator/administrator overview: four useful KPIs, then actionable alerts, progress versus budget, and detail. Stack KPIs 4/2/1 across wide/medium/compact layouts.
- Researcher home: tasks by urgency and a direct progress action; do not force financial KPIs into this view.
- Project detail: overview, tasks, progress, documents, and permitted budget/administrative views. Preserve filter context in the URL where appropriate.
- Dense tables: local horizontal scrolling, optional column priority, and a detail view. Never create page-wide overflow.
- Compact navigation: accessible drawer; primary work remains visible after it closes.
- Progress entry: side panel on wide screens; full-width sheet/page on compact screens with explicit save/cancel.

## 8. Section and Feature Mapping

Do not copy Sunbeam's CRM, invoices, pricing, testimonials, or sales funnel into the authenticated product.

| Quantia section        | Primary pattern                      | Visual treatment                                       |
| ---------------------- | ------------------------------------ | ------------------------------------------------------ |
| Login / onboarding     | Form + research illustration         | Warm paper canvas, blue/sage art panel                 |
| My tasks               | Urgency list and filters             | Neutral, compact, action-first                         |
| Research overview      | Four KPIs, alerts, comparison        | White surfaces; no colored KPI rainbow                 |
| Projects               | Searchable table; optional card view | Blue selection, restrained project identifiers         |
| Project workspace      | Summary, tabs, activity              | Mostly neutral; optional small art in true empty state |
| Tasks and progress     | Task rows, progress drawer, timeline | Clear saved/sync states                                |
| Documents and evidence | File list, uploader, metadata        | Small document artwork only when empty                 |
| Budget                 | Rubrics, execution, linked evidence  | Tabular numbers, no decorative backgrounds             |
| Reports                | Filter context, job status, download | Persistent progress and accessible feedback            |
| Users and roles        | Administrative table and forms       | Neutral, permission-aware                              |
| Audit                  | Filterable chronological record      | No mascots, no decorative cards                        |
| Synchronization        | Entity status and permitted retry    | Clear technical state, not a fake success badge        |

Optional public introduction, only if in scope: research-focused headline -> actual product preview with accessible feature tabs -> benefits grounded in workflows -> project/evidence/budget sections -> access/contact CTA.
Example headline: "La investigación, en un solo lugar." Example CTA: "Acceder a Quantia". Do not invent testimonials, adoption counts, research results, or institutional endorsements.
An interactive preview may switch between Proyectos, Tareas, Evidencias, and Reportes. Label preview data as demonstration data. Do not add a public marketing site solely because the reference has one.

## 9. Iconography, Illustration, and Background Composition

UI icons: proposed Lucide outline family, subject to dependency approval. Reuse the repository's existing compatible family first.
Tokens: icon/sm=16, icon/md=20, icon/lg=24 px; consistent 1.75–2 px stroke per approved set. Compact icons may be 16 px inside a 44 px interactive target.
Suggested meanings: FolderKanban for projects, ListChecks for tasks, FileText for evidence, Users for collaboration, ChartNoAxesCombined for reports, ShieldCheck for audit, RefreshCw for synchronization. Confirm exported icon names in the installed version.
Icons supplement labels; icon-only controls require accessible names. Never mix emoji, filled pictograms, and unrelated outline styles in the operational UI.

Original illustration family: rounded evidence cards, stacked papers, a notebook, seedling-like research growth, connected nodes, and subtle observation/lens motifs. Show relationships between research artifacts, not generic rockets, AI brains, or floating dashboard cubes.
Use a shared silhouette language, limited art palette, consistent outline weight, simple flat shading, and at most subtle grain confined to artwork. No 3D chrome, heavy plastic gloss, neon edges, or copied Sunbeam characters.
If a character is approved, derive it from a research note or seed shape; use a minimal face and calm expression. Keep one character family, not a different mascot per module.

Composition recipes:

- Login: paper background, white form region, one blue/sage framed illustration; illustration hides or moves below on compact screens.
- Onboarding: short title, explanatory copy, one restrained illustration, one next action. No confetti or auto-playing ambient animation.
- Empty project list: small notebook illustration, "Aún no hay proyectos", and a create action only if permitted.
- No filter results: text and reset action; not the same illustration/message as an empty database.
- Operational dashboard: no large hero; optional tiny research motif in unused header space only when it does not compete with alerts.
- Public product preview: white UI mockup on one muted art field with 24 px outer framing. Preserve actual UI contrast; never wash the preview out to imitate a reveal effect.

Decorative SVGs are hidden from assistive technology and cannot intercept pointer events. Informative illustrations receive meaningful alt text. Use original or appropriately licensed assets; do not hotlink template artwork.

## 10. Canonical Component Registry and Interaction Contracts

Inventory correction: the supplied Notion section 4.3 contains 34 components (11 Base + 8 Composite + 8 Page + 7 System), not 33. Retain every named component. Tabs (DS-108) is an additional Base component. Sheet (DS-109) is an additional System component for form drawers. Add 3 General Chat components for a total of 39. PageTransition (2026-11-05) is an additional System component for the route entrance, for a total of 40. DatePicker (2026-11-05) is an additional Composite for single date/time selection, for a total of 41.
These tables define the proposed canonical design APIs, not a claim that repository implementations already exist. Reconcile with current exports and shared contracts before coding; approve migrations instead of creating aliases with divergent styling.
All controls define default, hover, focus-visible, active, disabled, and loading when applicable. Fields also define error and read-only. Parent layouts own external spacing; component internals use design tokens.

### 10.1 Shared Property Mapping

| Figma property                           | Code property | Allowed mapping                                                                          |
| ---------------------------------------- | ------------- | ---------------------------------------------------------------------------------------- |
| intent=Primary/Secondary/Ghost/Danger    | intent        | primary/secondary/ghost/danger; only on components listed below                          |
| size=Medium/Large                        | size          | md/lg; default md; md targets 44 px, lg targets 48 px where interactive                  |
| state=Loading/Default                    | isLoading     | true/false; a data component exposes busy state, an action prevents duplicate submission |
| tone=Neutral/Info/Success/Warning/Danger | tone          | neutral/info/success/warning/danger; semantic fg/bg tokens, never an arbitrary hex       |

In the per-component matrix, N/A means the prop is intentionally absent, not accepted and ignored. Fixed geometry is documented via tokens, not a public size prop. Loading is not equivalent to disabled. Tone describes meaning; intent describes an action's hierarchy.
For explicit selected/error/checked/connection/delivery states, use the domain/state props below, not invented intent values. Figma-only preview properties for content do not become backend enums.

### 10.2 Base Components (12)

Columns document purpose, anatomy, additional properties, accessibility, Radix ownership, and valid/invalid examples. Shared intent/size/isLoading/tone props are in section 10.6.

| Component  | Purpose and anatomy                                                     | Additional canonical properties                                                              | Accessibility                                                                                | Primitive / composition                           | Valid / invalid example                                                                |
| ---------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Button     | Execute action; container, optional icon, label, busy indicator         | type=button/submit, disabled, onClick, leadingIcon                                           | Native button, visible label, focus, aria-busy when loading; preserve width                  | Native button; no Radix Button primitive          | DO: primary "Guardar avance". DON'T: clickable div or primary styling for every action |
| IconButton | Compact action; target, icon, optional busy indicator                   | accessibleLabel, disabled, onClick, icon                                                     | Required accessible name, 44 px target; tooltip is not its only name                         | Native button; optional canonical Tooltip         | DO: "Abrir acciones del proyecto". DON'T: unlabeled ellipsis                           |
| TextField  | Single-line input; label, field, helper, error                          | id, name, label, value, onChange, type, required, readOnly, error, description               | Native input; label linkage, aria-invalid, described error; preserve input                   | Native input                                      | DO: persistent "Nombre del proyecto". DON'T: placeholder-only label                    |
| TextArea   | Multiline content; label, field, helper, error                          | id, label, value, onChange, rows, maxLength from contract, error, readOnly                   | Native textarea, label/error association; no keyboard trap                                   | Native textarea                                   | DO: "Descripción del avance". DON'T: fixed height clipping long text                   |
| Select     | Select one configured option; label, trigger, value, list, items, error | label, options, value, onValueChange, placeholder, disabled, error                           | Named trigger, keyboard navigation, selected state; don't use for arbitrary free text        | Radix Select: Root, Trigger, Value, Content, Item | DO: project state from permitted options. DON'T: custom div menu without semantics     |
| Checkbox   | Independent selection; control, indicator, label, optional help         | checked=true/false/indeterminate, onCheckedChange, label, disabled, required                 | Label and checked state exposed; Space toggles; indeterminate supported                      | Radix Checkbox: Root, Indicator                   | DO: select table rows. DON'T: checkbox behaving as radio group                         |
| Switch     | Immediate reversible preference; control, thumb, label                  | checked, onCheckedChange, label, disabled                                                    | Accessible switch name/state; keyboard operation                                             | Radix Switch: Root, Thumb                         | DO: toggle an approved preference. DON'T: silently delete data                         |
| Badge      | Summarize state; soft container, icon, label                            | label, icon                                                                                  | Meaning in text; decorative icon hidden; not focusable when static                           | Semantic span; no Radix Badge required            | DO: warning "Atención" + icon. DON'T: unlabeled colored dot                            |
| Avatar     | Public identity; image, predefined chat avatar, fallback initials       | name, src, fallback, avatarKey (`AVATAR_01…05` from contracts; bundled glyph + catalog tint) | Avoid duplicate announcement beside visible name; meaningful alt when standalone             | Radix Avatar: Root, Image, Fallback               | DO: approved public name + initials fallback. DON'T: expose private email as fallback  |
| Tooltip    | Supplement short information; trigger, content, arrow optional          | content, side, delayDuration from shared configuration                                       | Available on focus/hover, Escape dismisses; no essential instructions or interactive content | Radix Tooltip: Provider, Root, Trigger, Content   | DO: explain a compact icon. DON'T: hide form errors inside tooltip                     |
| Link       | Navigate; label, optional external indicator                            | href, children, external, ariaCurrent                                                        | Native anchor, descriptive destination, visible focus; disclose new context if used          | Native anchor / Next.js Link                      | DO: "Ver evidencia". DON'T: anchor without href performing save                        |
| Tabs       | Switch peer panels; list, triggers, content panels                      | items, value, onValueChange, label                                                           | Tablist/tab/tabpanel roles, keyboard arrows, focus-visible ring; controlled URL state OK     | Radix Tabs: Root, List, Trigger, Content          | DO: project Tareas/Bitácora/Documentos. DON'T: nested tabs inside every card           |

### 10.3 Composite Components (9)

| Component       | Purpose and anatomy                                                          | Additional canonical properties                                               | Accessibility                                                                               | Primitive / composition                                                                 | Valid / invalid example                                                                     |
| --------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ProjectCard     | Scan project; title link, status, members, progress, next date               | project, href, canEdit, onAction                                              | Heading/link structure; no nested interactive card link; readable progress                  | Badge, Avatar, ProgressBar, Link; optional Radix DropdownMenu for actions               | DO: one meaningful project summary. DON'T: separate colorful card variant per feature       |
| TaskRow         | Scan/update task; checkbox/control, title, assignee, due date, state         | task, canUpdate, onStatusChange, onOpen                                       | Named row controls; native list/table context, keyboard actions                             | Checkbox, Badge, Avatar, Link                                                           | DO: urgency text and date. DON'T: drag-only completion                                      |
| ProgressBar     | Communicate bounded progress; track, indicator, visible label                | value, max=100, label, indeterminate                                          | Accessible name/value; expose indeterminate honestly; do not announce every animation frame | Radix Progress: Root, Indicator                                                         | DO: "Avance: 45,0 %". DON'T: decorative bar with no value                                   |
| DateRangePicker | Filter/select period; label, trigger, calendar, range, clear                 | value={from,to}, onValueChange, minDate, maxDate, error                       | Named dates, keyboard calendar and text alternative; locale-aware parsing                   | Radix Popover + approved accessible calendar; Radix is not a date-picker implementation | DO: visible start/end labels. DON'T: ambiguous 03/04 without format                         |
| DatePicker      | Select one date (optional time); label, trigger, calendar, clear, time row   | value (ISO\|null), onValueChange, withTime, minDate, maxDate, error, required | Named trigger, keyboard month/day nav, Escape closes, focus returns; Bogota display format  | Radix Popover + shared calendar grid; Select for hour/minute when withTime              | DO: pick due date without typing. DON'T: native type=date as the only control               |
| FilterBar       | Maintain query context; SearchField, filter controls, active chips, reset    | filters, onFiltersChange, onReset, resultCount                                | Named controls/group, logical order; polite count update                                    | SearchField, Select, DateRangePicker, Button                                            | DO: persistent shareable filters. DON'T: reset unrelated filters on pagination              |
| SearchField     | Search records; label, input, search icon, clear action                      | label, value, onChange, onClear, placeholder                                  | Native search input; clear button named; preserve focus                                     | TextField + IconButton; native input type=search                                        | DO: "Buscar proyectos". DON'T: placeholder as sole name                                     |
| Pagination      | Navigate pages; previous, current context, next, optional page-size selector | page, pageSize, totalItems, onPageChange, onPageSizeChange                    | Named nav, current-page semantics, disabled unavailable actions                             | Button/IconButton + optional Select                                                     | DO: page context preserved with filters. DON'T: invent a total for cursor-only API          |
| FileUploader    | Attach evidence; picker/dropzone, constraints, file rows, progress, errors   | accept, maxBytes, files, onFilesChange, onRetry, onCancel from supported API  | Keyboard-accessible native picker; drop not sole method; per-file status/error              | Native input type=file + Button + ProgressBar                                           | DO: backend-defined limits with retry. DON'T: invented file limits or fake completed upload |

### 10.4 Page Components (8)

| Component        | Purpose and anatomy                                                             | Additional canonical properties                                        | Accessibility                                                                                             | Primitive / composition                                                 | Valid / invalid example                                                                          |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| RoleSidebar      | Authorized navigation; brand, groups, active link, profile                      | role, items, activeHref, open, onOpenChange                            | nav landmark, aria-current, skip path; mobile focus management                                            | Link + Radix Dialog for compact drawer                                  | DO: omit unauthorized modules. DON'T: show forbidden financial links disabled                    |
| AppHeader        | Context/global actions; breadcrumb/title context, connection, user menu         | breadcrumbs, user, actions, connectionState                            | Header landmark, named controls; don't duplicate main H1                                                  | Link, Avatar, IconButton, ConnectionStatus; optional Radix DropdownMenu | DO: quiet contextual header. DON'T: second dashboard hero                                        |
| DataTable        | Inspect records; caption, headers, rows, actions, pagination                    | columns, rows, getRowId, sorting, onSortChange, pagination, emptyState | Native table, scope, aria-sort, named row actions; do not claim grid keyboard behavior unless implemented | Native table + canonical controls; not a Radix DataTable primitive      | DO: numeric alignment and local overflow only when necessary. DON'T: page-wide horizontal scroll |
| KpiPanel         | Summarize status; up to four metric slots, label/value/context                  | metrics (max 4), period                                                | Group heading; text equivalents, real periods; no color-only trend                                        | Internal MetricItem only; no public parallel KpiCard API                | DO: four large neutral values. DON'T: new exported KpiCard with competing props                  |
| AlertList        | Prioritize intervention; severity, interpretation, project link, action         | alerts, onAction, emptyState                                           | Ordered severity plus text/icon; no assertive announcement flood                                          | Badge, Link, Button, EmptyState                                         | DO: one actionable interpreted warning. DON'T: alarming color with no explanation                |
| ProgressChart    | Compare progress and execution; title, legend, axes, values, equivalent table   | series, unit, period, tableRows                                        | Accessible summary/table, value labels, non-color series distinction                                      | Recharts + DataTable alternative; no Radix chart                        | DO: labeled paired percentages. DON'T: decorative graph without units                            |
| ActivityTimeline | Trace progress; author, action, timestamp, evidence link                        | items, hasMore, onLoadMore                                             | Semantic ordered list, time element; incoming items do not steal focus                                    | Avatar, Link, Button                                                    | DO: stable chronological records. DON'T: auto-scroll reader away from history                    |
| BudgetPanel      | Review finances and evidence; summary, rubric table, support, permitted actions | budget, canEdit, onEdit, onOpenEvidence                                | Table semantics, COP text, traceable document links; authorization on server                              | DataTable, Link, Button, ConfirmDialog for destructive actions          | DO: expense linked to activity/support. DON'T: expose budget details to researchers              |

### 10.5 System Components (8) and General Chat (3)

| Component        | Purpose and anatomy                                                                                                               | Additional canonical properties                                                                                                                                                                         | Accessibility                                                                                           | Primitive / composition                                                                         | Valid / invalid example                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| EmptyState       | Explain missing content; optional art, title, description, permitted action                                                       | kind=no-records/no-results, title, description, action                                                                                                                                                  | Semantic text; decorative art hidden; action keyboard accessible                                        | Heading/text + Button/Link                                                                      | DO: "Sin proyectos en esta convocatoria". DON'T: blank table or create action without permission     |
| Skeleton         | Preserve loading structure; noninteractive placeholders                                                                           | variant=table/card/list/metric, rows                                                                                                                                                                    | Placeholders hidden; parent aria-busy and accessible loading text                                       | Styled noninteractive blocks; no Radix requirement                                              | DO: match final structure. DON'T: focusable fake controls                                            |
| ErrorState       | Explain failure/recovery; icon, title, details, valid action                                                                      | title, description, errorCode, onRetry, retryLabel                                                                                                                                                      | Text explanation, appropriate live announcement, focus stays stable                                     | Icon + text + Button                                                                            | DO: scoped error with retry. DON'T: clear user draft or show raw stack                               |
| ConfirmDialog    | Confirm consequential action; title, consequence, cancel, confirm                                                                 | open, onOpenChange, title, description, confirmLabel, onConfirm                                                                                                                                         | Focus containment/return, least destructive initial focus, Escape when safe, async duplicate protection | Radix AlertDialog for confirmation; Radix Dialog for ordinary forms, not a second ConfirmDialog | DO: "Eliminar documento" + consequence. DON'T: generic "¿Seguro?"                                    |
| Sheet            | Ordinary form drawer; overlay, header, scroll body, sticky footer                                                                 | open, onOpenChange, title, description, children, footer, triggerRef                                                                                                                                    | Focus trap, Escape, return focus to trigger; side drawer wide / bottom sheet compact                    | Radix Dialog: Root, Portal, Overlay, Content, Title, Description                                | DO: Registrar avance. DON'T: destructive confirm (use ConfirmDialog) or invent SheetV2               |
| Toast            | Transient feedback; title, short description, optional action, close                                                              | open, onOpenChange, title, description, action, duration                                                                                                                                                | Radix announcement behavior, pause on focus/hover, keyboard close; critical failures persist elsewhere  | Radix Toast: Provider, Root, Title, Description, Action, Close, Viewport                        | DO: "Reporte listo" + download. DON'T: disappearing sync failure as sole notice                      |
| SyncStatus       | Distinguish save/sync; status icon, label, retry if permitted                                                                     | status=pending/synced/failed, persisted, canRetry, onRetry                                                                                                                                              | Text state, polite changes, accessible retry; no false saved claim                                      | Badge + Button; no Radix status primitive                                                       | DO: saved but sync failed. DON'T: "Datos perdidos" for Notion-only failure                           |
| ConnectionStatus | Explain live-data freshness; icon, label, reconnect                                                                               | state=connected/reconnecting/disconnected, lastUpdatedAt, onReconnect                                                                                                                                   | Text state, restrained live updates, accessible action                                                  | Badge + Button                                                                                  | DO: "Datos posiblemente desactualizados". DON'T: show connected from stale local state               |
| ChatMessage      | Present a General Chat message; author/avatar, quote, content, edited mark, time, ✓/✓✓, reactions, action toolbar, delivery/retry | message, deliveryState=sending/sent/failed, groupPosition, seenBy, reactionOptions, meId, pop, highlightToken, canEdit, canDelete, onRetry, onDiscard, onReact, onReply, onEdit, onDelete, onQuoteClick | Safe text rendering, author/time readable; controlled live log, no duplicate announcements              | Avatar, text, time, optional Button; native message list item                                   | DO: sent only after persistence confirmation. DON'T: render untrusted HTML or invent read receipts   |
| PresenceList     | Show public online participants; heading, count, avatar/name rows, typing, recently left, connection context                      | users, connectionState, typingIds, meId, recent                                                                                                                                                         | Named list and text presence; don't announce every heartbeat                                            | Avatar + ConnectionStatus; native list                                                          | DO: deduplicate users across tabs. DON'T: expose JWT/email/internal socket metadata                  |
| MessageComposer  | Write/send/edit text; reply/edit context strip, label, TextArea, near-limit counter, send, failure                                | value, onChange, onSend, maxLength from `state.limits`, disabled, error, mode=compose/edit, context, onCancelContext, onEditLast                                                                        | Labeled input, keyboard send via button; never submit during IME composition; preserve failed draft     | TextArea + Button; no invented chat primitive                                                   | DO: REST send then delivery feedback. DON'T: socket-only unpersisted send or unsupported attachments |

### 10.6 Figma -> Code Matrix by Component

Cells contain the Figma value followed by the code value. All mapped dimensions must exist as Figma component properties; N/A dimensions must not be introduced by Cursor.

| Component        | intent                                                           | size                                                                 | isLoading                                     | tone                                                                       |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------- |
| Button           | Primary/Secondary/Ghost/Danger -> primary/secondary/ghost/danger | Medium/Large -> md/lg                                                | Loading/Default -> true/false                 | N/A (derived from intent)                                                  |
| IconButton       | Secondary/Ghost/Danger -> secondary/ghost/danger                 | Medium/Large -> md/lg                                                | Loading/Default -> true/false                 | N/A                                                                        |
| TextField        | N/A                                                              | Medium/Large -> md/lg                                                | N/A                                           | N/A (error prop owns validation)                                           |
| TextArea         | N/A                                                              | N/A                                                                  | N/A                                           | N/A (error prop)                                                           |
| Select           | N/A                                                              | Medium/Large -> md/lg                                                | Loading/Default -> true/false                 | N/A (error prop)                                                           |
| Checkbox         | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| Switch           | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| Badge            | N/A                                                              | N/A                                                                  | N/A                                           | Neutral/Info/Success/Warning/Danger -> neutral/info/success/warning/danger |
| Avatar           | N/A                                                              | Medium/Large -> md/lg (32/40 px visual; interactive wrapper >=44 px) | N/A                                           | N/A                                                                        |
| Tooltip          | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| Link             | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| Tabs             | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| ProjectCard      | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A (project status drives Badge)                                          |
| TaskRow          | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| ProgressBar      | N/A                                                              | N/A                                                                  | N/A (indeterminate prop instead)              | Neutral/Info/Success/Warning/Danger -> neutral/info/success/warning/danger |
| DateRangePicker  | N/A                                                              | Medium/Large -> md/lg                                                | N/A                                           | N/A                                                                        |
| DatePicker       | N/A                                                              | Medium/Large -> md/lg                                                | N/A                                           | N/A (error prop)                                                           |
| FilterBar        | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| SearchField      | N/A                                                              | Medium/Large -> md/lg                                                | Loading/Default -> true/false                 | N/A                                                                        |
| Pagination       | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| FileUploader     | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A (per-file state)                                                       |
| RoleSidebar      | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| AppHeader        | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| DataTable        | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| KpiPanel         | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| AlertList        | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A (severity -> child tone)                                               |
| ProgressChart    | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| ActivityTimeline | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| BudgetPanel      | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| EmptyState       | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| Skeleton         | N/A                                                              | N/A                                                                  | N/A (it is the loading presentation)          | N/A                                                                        |
| ErrorState       | N/A                                                              | N/A                                                                  | Loading/Default -> true/false (retry pending) | N/A (danger by definition)                                                 |
| ConfirmDialog    | Primary/Danger -> primary/danger (confirm button only)           | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| Sheet            | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |
| Toast            | N/A                                                              | N/A                                                                  | N/A                                           | Neutral/Info/Success/Warning/Danger -> neutral/info/success/warning/danger |
| SyncStatus       | N/A                                                              | N/A                                                                  | Loading/Default -> true/false (retry pending) | N/A (status-derived)                                                       |
| ConnectionStatus | N/A                                                              | N/A                                                                  | N/A (connection state instead)                | N/A (state-derived)                                                        |
| ChatMessage      | N/A                                                              | N/A                                                                  | N/A (deliveryState instead)                   | N/A                                                                        |
| PresenceList     | N/A                                                              | N/A                                                                  | Loading/Default -> true/false                 | N/A                                                                        |
| MessageComposer  | N/A                                                              | N/A                                                                  | Loading/Default -> true/false (send pending)  | N/A                                                                        |
| PageTransition   | N/A                                                              | N/A                                                                  | N/A                                           | N/A                                                                        |

Shared Radix foundation mapping: ordinary form panels/mobile drawers use Dialog; destructive confirmation uses AlertDialog; option choice uses Select; supplementary help uses Tooltip; preference toggle uses Switch; independent selection uses Checkbox; transient announcements use Toast. Other components remain semantic HTML or compositions, not fictitious Radix primitives.
General Chat is one semillero-wide authenticated space, not project chat. REST persists every write before the socket distributes it; presence uses chat.general.presencia, usuario-conectado, usuario-desconectado, usuario-actualizado. Preserve cursor-history position when prepending older messages. Order by `seq`, merge by `version`, reconcile optimistic and confirmed messages by `clientMessageId`; after reconnect replay `/updates`. Contracts 0.8.0 support predefined avatars, replies, editing, deletion/moderation, one reaction per user (8-emoji allowlist), typing and read receipts; attachments, mentions, threads and DMs remain unsupported.
Additional extensions (2026-11-05, documented here instead of new families): TextArea `showCounter` (chat renders its own near-limit counter without per-keystroke announcements) and `ref`; IconButton `ref`; RoleSidebar items accept `badge` (unread count, announced in the link name); AppShell `chatEnabled` + `navBadges`. PageTransition (System): route-level 200 ms opacity/8 px rise wrapper used by `src/app/(app)/template.tsx`; no props besides `children`. Additional extensions (2026-11-06): TaskStatusControl is the implementation of TaskRow's canonical `onStatusChange` and is reused in task tables: the status badge becomes a Radix DropdownMenu trigger with the four task states (44 px target, current state disabled, read-only badge when the person cannot edit); no new component family. RoleSidebar items accept `to` (link target, e.g. `/presupuesto?projectId=…`) separate from `href` (active-section match); AppShell `projectScopeId` makes Tareas, Avances, Presupuesto and Reportes open filtered by the project in context, and `fillViewport` locks the shell to the viewport so a full-height section (Chat) scrolls only inside itself; ActivityTimeline items accept `evidence` (several external links per entry). Additional extensions (2026-11-06, input and breakpoints): ActivityTimeline items accept `onEdit`/`onDelete` (ghost buttons shown only when the person may change the entry). ChatMessage actions float over the bubble's top corner instead of sitting beside it (no width cost on narrow screens): mouse/trackpad reveal them on hover or focus, touch reveals them on tap, and on touch a leftward drag of 64 px replies (`useCoarsePointer` in `src/lib/device`; reply glyph pinned behind the row, vertical pan untouched, haptic tick where supported). MessageComposer: Enter sends only with a fine pointer; on touch Enter is a line break and the send button sends (`enterKeyHint` follows). The Chat log never fights the person: programmatic follow-the-tail scrolling yields to wheel, trackpad inertia, touch and keyboard input for 350 ms, and `overscroll-behavior-x: none` blocks the Mac two-finger back swipe. The inline RoleSidebar appears from `lg` (1280 px); 768–1279 px use the drawer so content keeps its width. Sections without an API contract (Convocatorias, Auditoría) render only `ComingSoonScreen` (page header, «Próximamente» Badge and EmptyState; no data, no fixtures) and their RoleSidebar items carry `soon` (a «Pronto» tag); comments and the institutional deviation comparison were removed from the UI. DatePicker (Composite): popover calendar (+ native 24 h time field in Bogotá time when `withTime`, default 09:00) for every API `datetime` field; the popover sits above Sheets (`zIndices.dropdown`), is capped to the viewport, marks today (`aria-current="date"`), and offers Hoy / Limpiar / Listo. CoordinatorPicker (feature, projects): «Responsable del proyecto» lists every active user with the Coordinador role on open (from `GET /users`, administrators only) and narrows as you type; administrators must pick one when creating a project. Mobile pass (2026-11-06, fix/responsive_motion): AppHeader is one sticky 64 px row at every width (translucent with backdrop blur; phones show only the current crumb; «Avisos» is a bell IconButton with count, labelled from `md`; popovers sit at `zIndices.dropdown`). AppShell drops the second gutter below `lg` and sizes the page h1 24/32 → 32/40 from `md`. RoleSidebar drawer: `min(20rem, 86vw)`, header with brand + close, closes on navigation, swipe left (72 px or a flick) to close, dark-safe scrim. Sheet (compact): grabber + drag-down to dismiss (96 px or a flick), rubber-band upwards. Chat: compact one-row header on phones (lead hidden, avatar button icon-only), edge-to-edge log, composer docked as a bar with a growing pill field and a round send button that keeps the keyboard open; keyboard help only with a fine pointer. ChatMessage on touch: hold 420 ms to open actions (floating above the bubble, never over the text; dismissed by tapping elsewhere), «Copiar» action, no system selection callout. Press feedback: Button scale 0.97, IconButton 0.92 (static under reduced motion); TaskStatusControl settles the badge with GSAP (power3.out, no overshoot). Haptics (`haptic()` in `src/lib/device`): `navigator.vibrate` on Android, the native switch tick on iOS Safari 18+, nothing on desktop (browsers expose no Mac trackpad haptics); off under reduced motion; used on send, reactions, swipe threshold, long-press, status change, task completion, drawer and sheet dismiss.
Canonical reuse rule: search current exports first; compose the registered component; if a requirement does not fit, propose a documented API change. Do not create ButtonV2, CustomSelect, DashboardKpiCard, or another parallel family. Internal MetricItem is implementation detail inside KpiPanel, not a 38th public component.

## 11. Patterns

### 11.1 Dashboard Hierarchy (QA Rules)

| Level           | Question                            | Required content and emphasis                                                               | Visual review pass condition                                                                              |
| --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1 - Estado      | How are we doing, within 5 seconds? | Maximum 4 KPIs: active projects, delayed projects, budget execution, completed deliverables | Only KPI VALUES use type/metric in the dashboard body; no competing giant chart values or hero headlines  |
| 2 - Atencion    | What requires action today?         | Alerts in Critical -> Attention -> On track order, with persistent filters                  | Each risk has project, interpretation, severity text/icon, and permitted action reachable within 2 clicks |
| 3 - Comparacion | Where is the deviation?             | Progress by project and budget execution versus progress                                    | Paired labels/values, common context/period, accessible table equivalent; title smaller than KPI values   |
| 4 - Detalle     | What is the evidence?               | Project table, activity, documents, export                                                  | Denser aligned rows, permission-aware evidence links, current filters carried into export                 |

The page title still uses type/page as the navigation anchor; the exclusive-large-type rule concerns dashboard DATA blocks, not semantic heading removal. No promotional display type in the operational dashboard.
Progressive density: space/24 card padding and space/32–48 major separation at the overview; space/12–16 internal table-row padding with >=48 px row targets in detail. Do not apply a spacious marketing-card layout to every table row.
Do not make researchers pass through this institutional dashboard: their home remains urgency-ordered My tasks.

### 11.2 Interpreted Relationships, Not Mental Arithmetic

DO: "Atención: el proyecto ha ejecutado 78,0 % del presupuesto con 45,0 % de avance. Revisar ejecución" with project context and a permitted detail link.
DON'T: two isolated numbers "78 %" and "45 %" that require the coordinator to infer the risk.
These are illustrative values, not live findings. Severity must come from approved domain rules, never an arbitrary frontend threshold. A difference is 33,0 percentage points, not a 33% relative increase. Never imply that spend and progress must always match linearly.
When domain rules do not confirm severity, display a neutral comparison and request review instead of inventing a critical alert. Keep comparison period, scope, source freshness, and units consistent.

### 11.3 Severity Contract

| Domain severity | Spanish label | Semantic tone | Icon (approved family equivalent) | Behavior                                                                  |
| --------------- | ------------- | ------------- | --------------------------------- | ------------------------------------------------------------------------- |
| critical        | Crítico       | danger        | CircleAlert                       | Persistent, first in attention queue, explicit recovery/action            |
| attention       | Atención      | warning       | TriangleAlert                     | Visible explanation and next action                                       |
| on-track        | Al día        | success       | CircleCheck                       | Quiet confirmation; do not manufacture an alert when nothing needs action |

Every severity is color + text + icon, including tables and charts. Icons cannot be the only accessible name. Backend severity changes must not silently reorder a focused row; offer a controlled refresh or update outside the active interaction.

### 11.4 Density, Empty States, and Reflow

- No page-level horizontal scroll at 320/375/390/768/1440 CSS px. Wide two-dimensional tables may scroll only inside their labeled container; all other blocks wrap or stack.
- DO: "Sin proyectos en esta convocatoria" + authorized next action. DON'T: empty borders with no explanation.
- DO: "No encontramos proyectos con estos filtros" + "Limpiar filtros". DON'T: suggest creating duplicate records for a search mismatch.
- Loading, no records, no results, unauthorized, and failed loading are distinct states; never swap one for another to hide uncertainty.
- Long project titles, COP values, evidence filenames, and alert actions must wrap without overlapping or truncating essential meaning.

### 11.5 Ten Technical States -> Visual -> Action

Postgres persistence and Notion synchronization are separate outcomes. Never report data loss when only synchronization failed, or claim a save before the backend confirms it.

| Technical state        | Required visual                                                         | Allowed action                                     | Review check                                                     |
| ---------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| Initial loading        | Structure-matched Skeleton in affected region                           | Continue global navigation                         | No fake zero KPI values or blank replacement page                |
| Empty list             | Context-specific EmptyState                                             | Create if authorized, change filters, or return    | No blank table; no unauthorized CTA                              |
| 401                    | Named session-expired dialog                                            | Reauthenticate, preserve permitted draft safely    | Focus managed; no silent draft loss                              |
| 403                    | Neutral unauthorized state                                              | Return to an authorized view                       | No disclosure of out-of-scope resource details                   |
| 429                    | Visible rate-limit message and retry timing when known                  | Backoff/retry following backend instructions       | No immediate retry loop or fabricated countdown                  |
| sync pending           | SyncStatus: "Guardado. Sincronizando con Notion" only after persistence | Continue working                                   | Save and sync are not conflated                                  |
| sync failed            | Persistent failure banner; clarify whether data was saved               | Administrator-only retry                           | No data-loss claim for sync-only failure                         |
| Job queued/processing  | "Generando reporte" with real status                                    | Continue navigating; download when confirmed ready | No invented progress percentage                                  |
| Event received         | Local 1–2 second highlight, reduced-motion alternative                  | Optional detail or controlled refresh              | No focus theft or row reordering under pointer                   |
| WebSocket disconnected | ConnectionStatus: "Datos posiblemente desactualizados"                  | Automatic reconnect and supported manual reconnect | Don't claim offline edits are saved without backend confirmation |

Additional action lifecycle: saving uses isLoading and prevents duplicate submission; report completion may use a Toast with "Descargar" and real signed URL expiry. These complement the ten-state table, not replace empty/error cases.
Reuse existing realtime event contracts only: tarea.actualizada, avance.registrado, proyecto.retrasado, presupuesto.ejecucion-baja. Do not rename events to match UI labels. Report completion uses REST polling (no `reporte.completado`); Notion sync failure uses entity `syncStatus` (no `sync.failed` socket). See `.cursor/docs/api-connection.md`.
Hide unauthorized navigation, but never treat hidden UI as authorization. Investigator access follows project membership; coordinator access follows assigned portfolio; administrator access follows institutional scope. Coordinator audit access remains subject to explicit approval.

### 11.6 Domain Formatting and Microcopy

Display locale: es-CO. Money includes COP and grouped digits, for example "COP 1.250.000"; apply one shared precision policy from financial requirements, never round stored values. Dates: DD/MM/AAAA; local time when needed uses America/Bogota. Percentages in comparable UI values use exactly one decimal, for example "45,0 %"; retain underlying precision.
Use "Registrar avance", "Adjuntar evidencia", "Revisar ejecución", "Generar reporte", "Limpiar filtros", and "Reintentar sincronización". Avoid "Crear registro en bitácora", "Optimiza tu potencial", and unexplained error codes as sole instructions.
Errors state scope and remedy: "No se pudo cargar el presupuesto. Intenta de nuevo"; never expose raw server traces. General Chat uses "Enviar mensaje" and preserves the draft on failure.

### 11.7 Frame 27:164 Do/Don't Evidence

Requested reference: node 27:164 in the QUANTIA design file identified by the QA source. Candidate deep link: https://www.figma.com/design/MDCBmiDWzKtbKc51yqI7Tx/QUANTIA?node-id=27-164 . File identity is sourced from QA; this node has not yet been visually verified.
Status: PENDING SCREENSHOT VERIFICATION. The available Figma connection in this session did not expose a Design-file screenshot tool. No screenshot is attached or described as inspected. Do not substitute a Sunbeam screenshot or fabricate a bad variant of the frame.
Required evidence before visual sign-off: export the actual frame with file/node identity and capture date; attach annotated crops for the rules below, plus an implementation screenshot at the same viewport, role, data, theme, and state. DON'T examples must be labeled counterexamples, never presented as source-frame content.

| Rule           | DO evidence to annotate                                   | DON'T counterexample to document                       | Observable acceptance                                 |
| -------------- | --------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------- |
| Hierarchy      | Actual crop of KPI/attention/comparison/detail order      | Equal emphasis or huge chart title competing with KPIs | <=4 KPIs, single dominant data block, levels in order |
| Interpretation | Actual alert crop, if present; otherwise mark missing     | Budget/progress shown as disconnected figures          | Relationship, context, severity, next action explicit |
| States         | Actual state-specific capture, not a simulated claim      | Empty/loading/failure rendered identically             | Each of ten states has correct visual and action      |
| Reflow         | Actual frame plus matching compact implementation capture | Body overflow or clipped action                        | No page overflow; local table exception only          |
| Semantics      | Actual status crop                                        | Color-only severity or mismatched label                | Color + Spanish text + icon; shared token mapping     |

Evidence is a release gate, not a claim that frame 27:164 already passes. If the node belongs to another file, obtain its exact URL before exporting.
Visual review checklist: count KPIs; trace level order; inspect alert interpretation; check severity cues; compare empty/loading/failure states; inspect all ten state actions; test long content and page overflow; verify formatting and domain labels; confirm canonical component reuse and Figma props; attach source/implementation screenshot pairs and record deviations.

Postgres persistence and Notion synchronization are separate outcomes. Never report data loss when only synchronization failed, or claim a save before the backend confirms it.

| Situation                | Visual response                                                   | Recovery                                          |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| Initial loading          | Local skeleton                                                    | Keep navigation available                         |
| Saving                   | Busy submit control                                               | Prevent duplicates                                |
| Saved + sync pending     | "Guardado. Sincronizando con Notion"                              | Continue working                                  |
| Sync failed after save   | "El avance está guardado, pero no se pudo sincronizar con Notion" | Administrator retry only                          |
| 401                      | Session-expired dialog                                            | Reauthenticate; preserve permitted draft safely   |
| 403                      | Neutral unauthorized state                                        | Return without revealing out-of-scope resources   |
| 429                      | Rate-limit notice                                                 | Respect backend retry timing; no rapid retry loop |
| Report queued/processing | Persistent job state                                              | Continue navigating                               |
| Report ready             | Notification with download action                                 | Respect signed URL expiry                         |
| Socket disconnected      | Data-may-be-outdated banner                                       | Automatic reconnect and supported manual action   |
| Live update              | Brief local highlight                                             | Do not steal focus or reorder under the pointer   |

Reuse existing realtime event contracts only: tarea.actualizada, avance.registrado, proyecto.retrasado, presupuesto.ejecucion-baja. Do not rename events to match UI labels. Report completion uses REST polling (no `reporte.completado`); Notion sync failure uses entity `syncStatus` (no `sync.failed` socket). See `.cursor/docs/api-connection.md`.
Hide unauthorized navigation, but never treat hidden UI as authorization. Investigator access follows project membership; coordinator access follows assigned portfolio; administrator access follows institutional scope. Coordinator audit access remains subject to explicit approval.

## 12. Motion and Microcopy

Motion tokens: Figma `motion/duration-min=150` → `theme.motion.duration.fast`; code `base=200` ms; Figma `motion/duration-max=250` → `theme.motion.duration.slow`; ease/standard=cubic-bezier(0.2,0,0,1).
Code API (`src/lib/motion`): `transitions.fast|base|slow` mirror the tokens for Motion; `transitions.layout` is a critically damped spring (damping ratio ≈ 1.04, no overshoot) for FLIP moves (sidebar active pill, chat rows, reaction chips, presence rows); `useGsapReveal` is the only sanctioned entrance helper — one 200 ms opacity/translateY reveal on first data or page change, total stagger capped at 240 ms, never re-run by realtime patches. Global `MotionConfig reducedMotion="user"` plus `gsap.matchMedia` keep reduced-motion users on static content.
Chat General is the expressive exception inside operational views (approved 2026-11-05): message entry, reaction «pop» (scale 1→1.22→1 in 250 ms), typing dots, crossfade on edit, collapse on delete and the 1.6 s locate highlight. They stay transform/opacity-only and are disabled under reduced motion (typing dots become static).
Use transform/opacity for panel transitions and short state feedback. Live-update highlight may last 1–2 seconds without flashing. No ambient loops, parallax, cursor effects, or count-up metrics in operational views.
Respect prefers-reduced-motion; content and actions must work without animation.
Spanish copy uses concrete verbs: "Guardar avance", "Adjuntar evidencia", "Generar reporte", "Reintentar". Avoid slogans in forms, exaggerated congratulations, and vague "Algo salió mal" errors.
Use the canonical formatting in Patterns 11.6: es-CO, America/Bogota for relevant local display, DD/MM/AAAA, explicit COP, and exactly one percentage decimal for comparable displayed values. Do not change stored timestamps or numeric precision to match display formatting.

## 13. Accessibility and Responsive Acceptance

- Target WCAG AA; validate actual component combinations rather than declaring a palette compliant.
- Normal text contrast >=4.5:1; large text >=3:1; necessary non-text control/state indicators >=3:1.
- Focus: 2 px ring, 2 px offset, visible against adjacent backgrounds; never obscured by sticky regions.
- Aim for 44 x 44 px targets. Text remains usable at 200% zoom and layouts reflow at 320 CSS px, except legitimately two-dimensional tables within their own scroll region.
- One main page H1, logical heading order, landmarks, skip link, labels, and complete keyboard navigation.
- Announce asynchronous results appropriately without flooding live regions. Never rely solely on color, motion, or a tooltip.
- Test long Spanish content, empty/loading/error states, high values, keyboard, screen readers, light/dark, and reduced motion.

## 14. Governance, Verification, and DON'Ts

Before implementation: read project rules, this file, the approved Figma specification, and the relevant existing components. If the Figma link or asset is unavailable, report it; do not fabricate a reference.
Use named component APIs and semantic tokens shared by Figma and code. Register new reusable components before duplicating them across screens. Add stories only if Storybook is part of the repository; do not imply it already exists.
Verification commands must come from the actual package scripts. Run available typecheck, lint, tests, accessibility checks, and screenshot comparisons; report unavailable tooling and remaining manual checks honestly.
Review at 375, 768, and 1440 px plus the 320 px reflow check. These are QA widths, not additional breakpoints.

Never:

- Generate neon palettes, purple gradients, glassmorphism, glowing blobs, or arbitrary pastel KPI cards.
- Replace research workflows with generic CRM, billing, pricing, or testimonial sections.
- Invent users, metrics, endorsements, research outcomes, API behavior, or successful validation.
- Put mascots, patterned backgrounds, or decorative illustrations behind operational data.
- Hardcode values that already exist as tokens, create one-off component variants, or install dependencies without approval.
- Change domain permissions, backend contracts, or persistence guarantees to simplify UI implementation.
- Claim exact Figma fidelity, published assets, passed tests, or accessibility compliance without evidence.

Release checklist:

- [ ] Typography change and expressive palette approved jointly.
- [ ] Original illustration assets and licenses reviewed.
- [ ] Figma variables and code token mapping synchronized.
- [ ] My tasks, coordinator dashboard, project detail, and budget validated with realistic data.
- [ ] Save/sync/disconnection/report states verified end to end.
- [ ] Contrast, keyboard, screen reader, zoom, responsive, and reduced-motion checks completed.
- [ ] Relevant prototype flows tested with research participants and tutor; findings recorded.
- [ ] Handoff approved by Monica and Julian; institutional requirements confirmed where applicable.

## 15. Reference Notes

Visual inspiration: https://sunbeam.framer.media/ (reference only; no asset or brand reuse).
The Sunbeam font/style inventory supplied during design discussion is inspiration, not an independently verified token export.
This specification adapts the existing Quantia Design System and Design Thinking document, its role matrix and technical-state mapping, and the Coding MDs guidance: brief first, explicit token intent, constrained components, concise rules, and verifiable outputs.
Keep the core specification concise (target below 500 lines); retain the complete canonical registry and Patterns rather than dropping components to meet a line target. Move detailed API payloads and research transcripts to their authoritative documents. Supporting sources: the Quantia QA UI/UX and wireframes page (dashboard hierarchy, accessibility, and Figma file identity) and General Chat page (persistence, presence, and shared-space scope). API properties and Radix mappings in section 10 are design contracts to reconcile with code, not verified repository exports.
