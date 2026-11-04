# Hallazgos — DS-131

Severidad: `critical` · `serious` · `moderate` · `minor`.  
Estado: `open` · `fixed` · `wontfix` (justificar).

---

## Resumen

| ID        | Severidad | Flujo      | Título                                                                | Estado              |
| --------- | --------- | ---------- | --------------------------------------------------------------------- | ------------------- |
| F01-K-01  | serious   | F-01       | Detalle de proyecto sin `h1` en estado de error                       | fixed               |
| F02-K-01  | serious   | F-02       | Lista `/proyectos` sin `h1` cuando la carga falla                     | fixed               |
| F03-Z-01  | serious   | F-03       | `/auditoria` desbordaba horizontalmente a zoom 200 % (simulado)       | fixed               |
| F0X-D-01  | moderate  | todos      | Fixture e2e con `startDate`/`endDate` date-only rompía Zod `datetime` | fixed               |
| F0X-C-01  | —         | F-01..F-03 | Color no solo en Badge / AlertList / TaskRow / chart                  | pass (sin hallazgo) |
| F0X-VO-01 | —         | F-01..F-03 | Landmarks, nombres y un `h1` por vista (árbol a11y)                   | pass (smoke)        |

---

## Hallazgos detallados

### F01-K-01 — Detalle de proyecto sin `h1` en error

- Severidad: serious
- Flujo: F-01
- Ruta / tema: `/proyectos/[id]` · light
- WCAG: 1.3.1 / 2.4.6 (estructura de encabezados)
- Repro: carga fallida del proyecto → solo `ErrorState` con título en `h2`.
- Esperado: un `h1` de página + mensaje de error.
- Actual: sin `h1`.
- Fix: [`ProjectWorkspaceScreen.tsx`](../../../src/features/projects/ProjectWorkspaceScreen.tsx) — header con `h1` «Proyecto» en rutas de error.
- Estado: fixed

### F02-K-01 — `/proyectos` sin `h1` en error

- Severidad: serious
- Flujo: F-02
- Ruta / tema: `/proyectos` · light
- WCAG: 1.3.1 / 2.4.6
- Repro: respuesta inválida de listado → `ErrorState` a pantalla completa sin título de página.
- Esperado: `h1` «Proyectos» visible.
- Actual: solo `h2` del ErrorState.
- Fix: [`ProjectsListScreen.tsx`](../../../src/features/projects/ProjectsListScreen.tsx) — mantiene header + `h1` en forbidden / rate-limit / server.
- Estado: fixed

### F03-Z-01 — Overflow horizontal en Auditoría (zoom 200 %)

- Severidad: serious
- Flujo: F-03
- Ruta / tema: `/auditoria`
- WCAG: 1.4.4 / 1.4.10
- Repro: viewport 640 px (equiv. 200 % de 1280) o CSS zoom; filtros en fila forzada.
- Esperado: sin scroll horizontal de página.
- Actual: `scrollWidth` > `clientWidth`.
- Fix: `FilterStack` con wrap en [`AuditScreen.tsx`](../../../src/features/audit/AuditScreen.tsx); el smoke usa viewport mitad de ancho.
- Estado: fixed

### F0X-D-01 — Fixture e2e con fechas date-only

- Severidad: moderate (bloqueaba auditoría de detalle/listado)
- Flujo: infraestructura e2e
- WCAG: n/a (dato de prueba)
- Repro: `projectResponseSchema` exige `datetime`; `"2026-01-01"` → `invalid_response`.
- Fix: ISO datetime en [`e2e/a11y/fixtures/auth.ts`](../fixtures/auth.ts) y `lhci-puppeteer.cjs`.
- Estado: fixed

### F0X-C-01 — Color no solo (pass)

- Verificado en código: `TASK_STATUS_PRESENTATION` / `PROJECT_STATUS_PRESENTATION` / AlertList usan label + tone + icono.
- Chart: leyenda con trazo continuo/discontinuo/punteado + «Ver como tabla».
- Smoke DOM en dashboard: badges con texto visible.
- Estado: pass

### F0X-VO-01 — VoiceOver / árbol a11y (smoke)

Árbol de accesibilidad (Playwright + snapshots) por flujo:

| Flujo | Landmarks               | h1                                                                     | Nombres clave                    | Live / overlays                                         |
| ----- | ----------------------- | ---------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------- |
| F-01  | skip, banner, nav, main | Mis tareas / Proyecto / Chat general                                   | Avisos, cuenta, Registrar avance | Esc cierra menú cuenta y avisos; foco vuelve al trigger |
| F-02  | igual + nav por rol     | Dashboard del grupo, Proyectos, Tareas, Avances, Presupuesto, Reportes | FilterBar labels                 | Toggle tabla del chart operable por teclado             |
| F-03  | igual                   | Vista institucional, Usuarios, Auditoría, Convocatoria…                | Filtros Auditoría                | Dark theme institucional OK                             |

**Nota:** este smoke no sustituye un pase completo con rotor VoiceOver en dispositivo real; cubre nombres, roles y focos documentados. Re-validación humana opcional en preview.

---

## Evidencia automatizada

```bash
npx playwright test e2e/a11y/manual/keyboard.spec.ts
# 17 passed
```
