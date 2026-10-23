import { handleRefresh } from "@/lib/session/http";

export function POST(request: Request) {
  return handleRefresh(request);
}
