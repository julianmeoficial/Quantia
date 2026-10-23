import { refreshWithSession, type SessionGrant } from "@/lib/api/auth";
import { setAccessToken } from "@/lib/api/session";

const CHANNEL = "quantia-auth";
const LOCK = "quantia-auth-refresh";
const RECENT_MS = 5_000;

export type AuthChannelMessage =
  | { type: "token"; accessToken: string; expiresIn: number }
  | { type: "logout"; keepDrafts: boolean };

type Handlers = {
  onToken: (grant: SessionGrant) => void;
  onLogout: (keepDrafts: boolean) => void;
};

let channel: BroadcastChannel | null = null;
let recent: { grant: SessionGrant; at: number } | null = null;

export function lastGrant(): SessionGrant | null {
  return recent?.grant ?? null;
}

export function publishToken(grant: SessionGrant) {
  recent = { grant, at: Date.now() };
  channel?.postMessage({ type: "token", ...grant } satisfies AuthChannelMessage);
}

export function publishLogout(keepDrafts: boolean) {
  channel?.postMessage({ type: "logout", keepDrafts } satisfies AuthChannelMessage);
}

export function startAuthChannel(handlers: Handlers) {
  if (typeof BroadcastChannel === "undefined") return () => undefined;
  channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = (event: MessageEvent<AuthChannelMessage>) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "token" && typeof data.accessToken === "string") {
      recent = {
        grant: { accessToken: data.accessToken, expiresIn: data.expiresIn },
        at: Date.now(),
      };
      setAccessToken(data.accessToken);
      handlers.onToken(recent.grant);
    }
    if (data.type === "logout") handlers.onLogout(Boolean(data.keepDrafts));
  };
  return () => {
    channel?.close();
    channel = null;
  };
}

function yieldToMessages() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

/** Una sola pestaña rota el refresh; las demás reciben el access token. */
export async function coordinatedRefresh(): Promise<string | null> {
  const run = async () => {
    await yieldToMessages();
    if (recent && Date.now() - recent.at < RECENT_MS) return recent.grant.accessToken;
    const grant = await refreshWithSession();
    if (!grant) return null;
    setAccessToken(grant.accessToken);
    publishToken(grant);
    return grant.accessToken;
  };

  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request(LOCK, run);
  }
  return run();
}
