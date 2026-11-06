# DS-132 — Hallazgos responsive

Severidad: `critical` · `serious` · `moderate` · `minor`. Estado: `open` · `fixed` · `pass` · `wontfix`.

## Resumen

| ID           | Severidad | Viewport | Ruta                                      | Estado       |
| ------------ | --------- | -------- | ----------------------------------------- | ------------ |
| R-CHART-01   | serious   | 768      | `/dashboard`                              | fixed        |
| R-OVR-01     | moderate  | 390      | OVR-01 Sheet footer                       | fixed        |
| R-TABLE-02   | serious   | 390      | `/proyectos/[id]` DataTable + TaskRow     | fixed        |
| R-HDR-01     | moderate  | 390      | AppHeader ConnectionStatus / rol          | fixed        |
| R-SHELL-01   | —         | 390/768  | AppShell drawer                           | pass         |
| R-TABLE-01   | —         | 390      | DataTable scroll local / Mis tareas cards | pass         |
| R-MOTION-01  | —         | *        | prefers-reduced-motion                    | pass         |
| R-OVERFLOW-* | —         | 390–1440 | matriz landings                           | pass (smoke) |

## Detalle

### R-CHART-01 — Leyenda Recharts duplicada (fixed)

- **Flujo:** F-02 dashboard.
- **Repro:** Abrir `/dashboard` a 768 px con puntos de avance.
- **Esperado:** Una leyenda (trazo continuo/discontinuo en texto).
- **Actual:** `<Legend />` de Recharts + `LegendList` textual; ejes apretados.
- **WCAG:** 1.4.10 Reflow / legibilidad.
- **Fix:** Eliminar Legend de Recharts; ticks con `caption`; `min-width: 0` en plot ([`ProgressChartPlot.tsx`](../../src/components/page/ProgressChart/ProgressChartPlot.tsx)).

### R-OVR-01 — Footer Sheet en 390 (fixed)

- **Flujo:** F-01 Registrar avance.
- **Repro:** Abrir OVR-01 a 390 px.
- **Esperado:** Acciones ≥ 44 px sin forzar scroll horizontal de página.
- **Actual:** `min-width: 10rem` por botón podía competir en una sola fila.
- **Fix:** Footer apila a 100 % bajo `md`; fila con `min-width` tokenizada ≥ `md` ([`Sheet.styles.ts`](../../src/components/system/Sheet/Sheet.styles.ts)).

### R-TABLE-02 — Proyecto detalle overflow @390 (fixed)

- **Repro:** `/proyectos/[id]` a 390 px con tareas asignadas.
- **Causa:** (1) `DataTable` sin contención `minmax(0,1fr)` — la tabla empujaba el documento; (2) `Checkbox` en `TaskRow` mostraba la etiqueta larga «Marcar…» en columna `auto`.
- **Fix:** `DataTable` Root en grid; `TaskRow` 2 columnas + wrap; `Checkbox` `labelVisuallyHidden` en filas.

### R-HDR-01 — Header compacto (fixed)

- ConnectionStatus y Tools con `min-width: 0` / wrap; etiqueta de rol oculta &lt; `md`.

### R-SHELL-01 — Sidebar colapsable (pass)

Drawer Radix &lt; 1280 (`lg`); inline ≥ 1280. Tablets usan drawer para dejar espacio a tablas. Verificado en smoke.

### R-TABLE-01 — Tablas (pass)

`DataTable` región scrolleable; Mis tareas usa cards &lt; `md` (SCREENS). Sin card-grid genérico (fuera de alcance).

### R-MOTION-01 — prefers-reduced-motion (pass)

`MotionConfig reducedMotion="user"`; CSS `theme.media.reducedMotion`; Sheet GSAP salta animación. Smoke emula `reduce` y abre OVR-01.

### R-OVERFLOW — Sin desborde de página (pass)

Smoke `assertNoPageHorizontalScroll` en landings a 390 / 768 / 1280 / 1440.
