import { handleLogin } from "@/lib/session/http";

export function POST(request: Request) {
  return handleLogin(request);
}
