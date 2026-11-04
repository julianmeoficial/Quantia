# DS-132 — Handoff

El agente **no** hace `git commit`, push ni PR. Julián adjunta este informe y las capturas a Linear DS-132.

## Rama

`feature/ds-132-f4` (desde `origin/main`).

## Qué se entregó

1. Protocolo ([PROTOCOL.md](./PROTOCOL.md)).
2. Hallazgos ([FINDINGS.md](./FINDINGS.md)) — chart, Sheet, DataTable/TaskRow, header fixed; shell/motion pass.
3. Smoke viewports ([viewports.spec.ts](./viewports.spec.ts)) — **27 passed**.
4. Fixes:
   - `ProgressChartPlot`: sin Legend duplicada; ticks compactos.
   - `Sheet` footer: stack full-width &lt; 768.
   - `DataTable` Root grid `minmax(0,1fr)` + scroll local.
   - `TaskRow` / `Checkbox labelVisuallyHidden` (sin desborde @390).
   - `AppHeader` Tools/ConnectionStatus compactos; rol oculto &lt; md.
   - Fixtures e2e con tareas (chart + OVR-01).
5. Capturas en `e2e/responsive/captures/` (gitignored) — lista abajo.

## Checklist issue

- [x] Breakpoints: sidebar colapsable; tablas scroll local / cards en Mis tareas
- [x] Panel Registrar avance usable a 390 (targets ≥ 44)
- [x] Gráficos legibles a 768 (+ «Ver como tabla»)
- [x] prefers-reduced-motion (Sheet / MotionConfig / CSS)
- [ ] Capturas adjuntas en Linear (Julián; PNGs ya generados localmente)

## Capturas generadas (adjuntar)

| Archivo                                               | Contenido           |
| ----------------------------------------------------- | ------------------- |
| `login-390.png` / `login-768.png`                     | Login               |
| `mis-tareas-390.png` / `ovr-01-390.png`               | Mis tareas + OVR-01 |
| `dashboard-768.png` / `dashboard-chart-table-768.png` | Dashboard + tabla   |
| `institucional-390.png` / `institucional-1280.png`    | Institucional       |
| `dashboard-1440.png`                                  | Landing wide        |

## Checks

```bash
npm run lint        # OK
npm run typecheck   # OK
npm run test        # 168 OK
npm run build       # OK
npx playwright test e2e/responsive/viewports.spec.ts  # 27 OK
```

## PR sugerido (Julián)

1. Commit: `fix(ui): responsive audit 390–1440 and reduced-motion for DS-132`.
2. PR a `main` con `Fixes DS-132`.
3. Adjuntar PNGs de `e2e/responsive/captures/` + FINDINGS al issue.
