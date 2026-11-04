/**
 * Call/convocatoria fixtures exist only for local design QA.
 * Production and preview builds must never paint fabricated call aggregates.
 */
export function isCallFixturesEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}
