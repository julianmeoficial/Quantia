import type { AppRole } from "./navigation";
import { accessFor, landing } from "./navigation";

export { landing };

/** True only when the catalog lists the path and the roles include it. */
export function canAccess(pathname: string, roles: readonly AppRole[]): boolean {
  return accessFor(pathname, roles) === "allowed";
}
