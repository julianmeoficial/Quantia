# Figma token exports (canonical)

Source of truth for `npm run tokens:build` → `src/theme/{light,dark}.ts` and scales.

| File                         | Figma collection              | Used by generator                                          |
| ---------------------------- | ----------------------------- | ---------------------------------------------------------- |
| `semantic.light.tokens.json` | Quantia · Semantic / Light    | Yes — semantic colors                                      |
| `semantic.dark.tokens.json`  | Quantia · Semantic / Dark     | Yes — semantic colors                                      |
| `primitives.tokens.json`     | Quantia · Primitives (Mode 1) | Yes — spacing, radius, layout, size, motion, primitive hex |

Not ingested (documented in `DESIGN.md` only):

- `Colección 1` Light/Dark — WIP names (`text-same`, etc.); superseded by Semantic.
- Component Mode 1 (`button` / `field` / `table`) — reserved for component tokens in a later issue.

Workflow: update variables in Figma → re-export W3C JSON into this folder → `npm run tokens:build`.
