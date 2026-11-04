/** Audit fixtures exist only for local design QA (CONTRACT-BLOCKED). */
export function isAuditFixturesEnabled(): boolean {
  return process.env.NODE_ENV === "development";
}
