import { handleLogout } from "@/lib/session/http";

export function POST(request: Request) {
  return handleLogout(request);
}
