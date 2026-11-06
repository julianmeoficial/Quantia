# DS-132 — Protocolo responsive (390 / 768 / 1280 / 1440)

Breakpoints del tema: `sm` 390 · `md` 768 · `lg` 1280 · `xl` 1440 (`theme.media.up`).

## Por cada ruta de la matriz

| Check           | Criterio                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------- |
| Overflow página | `documentElement.scrollWidth ≤ clientWidth` (±1). Tablas: scroll **solo** en región nombrada. |
| Shell &lt; 1280 | Sidebar inline oculto; menú abre drawer; Esc/overlay cierra (tablets 768–1279 incluidos).     |
| Shell ≥ 1280    | Sidebar inline visible; sin menú hamburguesa (`theme.media.up("lg")`).                        |
| Tablas          | `DataTable` / región con `overflow-x: auto`. Cards solo en Mis tareas (SCREENS).              |
| OVR-01 @ 390    | Sheet inferior usable; footer apilado; targets ≥ 44 px (`theme.sizes.control`).               |
| Charts @ 768    | Gráfica legible + leyenda textual; «Ver como tabla» operable.                                 |
| reduced-motion  | Emular `prefers-reduced-motion: reduce`; Sheet/sidebar sin slide; contenido operable.         |

## Matriz de rutas

| Rol          | Rutas                                                                                           |
| ------------ | ----------------------------------------------------------------------------------------------- |
| Público      | `/login`                                                                                        |
| INVESTIGADOR | `/mis-tareas`, `/proyectos/[id]`, OVR-01, COM-02, `/chat`                                       |
| COORDINADOR  | `/dashboard`, `/proyectos`, `/tareas`, `/avances`, `/presupuesto`, `/reportes`                  |
| ADMIN        | `/institucional`, `/usuarios`, `/presupuesto`, `/reportes`, `/convocatorias/[id]`, `/auditoria` |

## Capturas

Guardar PNG en `e2e/responsive/captures/` (ignorado por git). Mínimo: login, mis-tareas+OVR-01, dashboard+chart, institucional — 390 y 768; landings 1280/1440.

## Smoke automatizado

`npx playwright test e2e/responsive/viewports.spec.ts`
