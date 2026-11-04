# Protocolo de auditoría manual — DS-131 (F-01 · F-02 · F-03)

Baseline: WCAG 2.1 AA + [accessibility-ux.mdc](../../../.cursor/rules/accessibility-ux.mdc).
Herramientas: teclado solo, árbol de accesibilidad del browser, VoiceOver (macOS), zoom 200 %.
Temas: light y dark (`data-theme`).

## Flujos

| ID   | Rol           | Ruta de entrada          | Pasos mínimos                                                                     |
| ---- | ------------- | ------------------------ | --------------------------------------------------------------------------------- |
| F-01 | INVESTIGADOR  | `/login` → `/mis-tareas` | Proyecto → tabs → Registrar avance → avisos → `/chat`                             |
| F-02 | COORDINADOR   | `/dashboard`             | `/proyectos` → `/tareas` → `/avances` → `/presupuesto` → `/reportes`              |
| F-03 | ADMINISTRADOR | `/institucional`         | `/usuarios` → `/presupuesto` → `/reportes` → `/convocatorias/[id]` → `/auditoria` |

## 1. Teclado

En cada pantalla del flujo:

1. Primer Tab: skip link «Saltar al contenido» visible al foco; Enter salta a `#contenido`.
2. Tab / Shift+Tab: orden = orden visual; sin `tabIndex` positivo; sin trampas fuera de overlays.
3. Todo control operable tiene `:focus-visible` (anillo del theme).
4. Enter / Space activan botones y links.
5. Overlays (drawer, dialog, menú, popover avisos):
   - foco entra al abrir;
   - `Esc` cierra;
   - foco vuelve al trigger;
   - Tab cicla dentro del overlay (Radix).
6. Tablas / FilterBar / Pagination: alcanzables y accionables sin ratón.

## 2. VoiceOver / lector

En al menos un happy-path por flujo:

1. Rotor: headings (un `h1` por vista, orden `h1→h2→h3`), landmarks (`banner`/`nav`/`main`).
2. Controles: nombre accesible en español (no enums crudos).
3. Live regions: SyncStatus, ConnectionStatus, contador 429, «N mensajes nuevos» — polite; alert solo si bloquea.
4. Tablas: caption / headers asociados.
5. `ProgressChart`: título + leyenda no solo color; «Ver como tabla» usable y anunciable.

## 3. Color no solo

1. Status de proyecto/tarea/documento vía `statusPresentation` + Badge (label + icono + tone).
2. AlertList: Crítico / Atención / Al día con label + icono.
3. Series del chart distinguibles por trazo (continuo / discontinuo / punteado), no solo color.

## 4. Zoom 200 %

1. `document.documentElement.style.zoom = '200%'` (o viewport equivalente).
2. Landings F-01/F-02/F-03: sin scroll horizontal de página; sin solapes que oculten acciones.
3. Texto y targets siguen legibles / ≥ 44 px cuando aplica.

## 5. Registro

Cada fallo → entrada en [FINDINGS.md](./FINDINGS.md) con severidad y estado.
Tras el fix → re-correr el paso y marcar `fixed`.
