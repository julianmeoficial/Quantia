# DS-130 — Handoff (manual)

El agente **no** hace commit, push, PR ni adjuntos a Linear. Eso lo hace Julián.

## Rama

`feature/ds-130-f4` (desde `origin/main`)

## Checks locales (verde)

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:a11y
npm run test:lighthouse   # requiere Chrome for Testing (puppeteer)
```

## Reportes a adjuntar en Linear DS-130

Generados en local (gitignored):

| Carpeta                            | Contenido                                           |
| ---------------------------------- | --------------------------------------------------- |
| `reports/axe/*.json`               | Resultados axe por ruta × tema (0 serious/critical) |
| `reports/lighthouse/*.report.html` | Informes Lighthouse por ruta                        |
| `reports/lighthouse/*.report.json` | JSON Lighthouse                                     |

Última corrida local (desktop, mocks de sesión):

| Ruta             | Accesibilidad | Rendimiento | LCP     |
| ---------------- | ------------- | ----------- | ------- |
| `/login`         | 100           | 100         | ~366 ms |
| `/mis-tareas`    | 100           | 100         | ~204 ms |
| `/dashboard`     | 100           | 100         | ~207 ms |
| `/institucional` | 100           | 100         | ~204 ms |
| `/chat`          | 100           | 100         | ~203 ms |

Umbrales DS-130: a11y ≥ 95, perf ≥ 85, LCP dashboard ≤ 2,5 s.

## Fix a11y incluido

- `AppHeader` account button: `aria-label` incluye las iniciales visibles (WCAG 2.5.3).
- `ProgressChart`: Recharts vía `next/dynamic` (`ssr: false`) para no meter el chart en el chunk inicial.

## PR sugerido (manual)

1. `git add` relevante (no `reports/`, no `.lighthouseci/`).
2. Commit Conventional: `feat(a11y): automate axe + Lighthouse for DS-130`.
3. Push + PR a `main` con `Fixes DS-130`.
4. Adjuntar HTML/JSON de `reports/lighthouse` y JSON de `reports/axe` al issue.
