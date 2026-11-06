"use client";

import type { LoginRequest, UserResponse } from "@quantia/contracts";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { loginWithSession, logoutWithSession } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import {
  configureRefresh,
  onAccessToken,
  onSessionExpired,
  refreshAccessToken,
  setAccessToken,
} from "@/lib/api/session";
import { getMe } from "@/lib/api/users";
import type { SessionIdentity } from "@/lib/auth";
import {
  coordinatedRefresh,
  lastGrant,
  publishLogout,
  publishToken,
  startAuthChannel,
} from "@/lib/auth/channel";
import { clearSessionReports } from "@/features/reports/sessionReportsStore";
import { buildLoginHref } from "@/lib/auth";
import { clearDrafts } from "@/lib/auth/drafts";

export type AuthStatus = "booting" | "authenticated" | "anonymous" | "sessionExpired";

interface AuthContextValue {
  status: AuthStatus;
  user: UserResponse | null;
  identity: SessionIdentity | null;
  login: (input: LoginRequest) => Promise<UserResponse>;
  logout: () => Promise<void>;
  /** Optional `from` restores the protected route after re-login. */
  endExpiredSession: (from?: string) => Promise<void>;
  /** Applies a fresh `UserResponse` of the same user (e.g. after `PATCH /users/me/avatar`). */
  replaceUser: (next: UserResponse) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let bootPromise: Promise<string | null> | null = null;

function bootOnce() {
  bootPromise ??= refreshAccessToken();
  return bootPromise;
}

/** Solo para pruebas: el bootstrap de sesión es único por carga. */
export function resetAuthBoot() {
  bootPromise = null;
}

function identityOf(user: UserResponse | null): SessionIdentity | null {
  if (!user) return null;
  return { displayName: user.fullName, roles: user.roles, avatar: user.avatar };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const routerRef = useRef(router);
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [user, setUser] = useState<UserResponse | null>(null);
  const timer = useRef<number | null>(null);
  const ready = useRef(false);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const schedule = useCallback(
    (expiresIn: number) => {
      clearTimer();
      const delay = Math.max((expiresIn - 60) * 1000, 1_000);
      timer.current = window.setTimeout(() => {
        void refreshAccessToken();
      }, delay);
    },
    [clearTimer],
  );

  const dropSession = useCallback(
    (options?: { keepDrafts?: boolean }) => {
      if (!options?.keepDrafts) clearDrafts();
      clearSessionReports();
      setAccessToken(null);
      setUser(null);
      setStatus("anonymous");
      clearTimer();
    },
    [clearTimer],
  );

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    let active = true;
    ready.current = false;

    const stopChannel = startAuthChannel({
      onToken: (grant) => {
        schedule(grant.expiresIn);
        void getMe({ refresh: false })
          .then((me) => {
            if (!active) return;
            setUser(me);
            setStatus("authenticated");
          })
          .catch((error: unknown) => {
            if (!active) return;
            if (error instanceof ApiError && error.kind === "unauthorized") {
              setStatus("sessionExpired");
            }
          });
      },
      onLogout: (keepDrafts) => {
        if (!active) return;
        dropSession({ keepDrafts });
        routerRef.current.replace("/login");
      },
    });

    configureRefresh(() => coordinatedRefresh());

    const stopExpired = onSessionExpired(() => {
      if (!ready.current || !active) return;
      setStatus("sessionExpired");
    });

    const stopToken = onAccessToken(() => {
      const grant = lastGrant();
      if (grant) schedule(grant.expiresIn);
      void getMe({ refresh: false })
        .then((me) => {
          if (!active) return;
          setUser(me);
        })
        .catch(() => undefined);
    });

    void (async () => {
      const token = await bootOnce();
      if (!active) return;
      if (!token) {
        setStatus("anonymous");
        ready.current = true;
        return;
      }
      try {
        const me = await getMe({ refresh: false });
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
        const grant = lastGrant();
        if (grant) schedule(grant.expiresIn);
      } catch {
        if (!active) return;
        setAccessToken(null);
        setStatus("anonymous");
      } finally {
        if (active) ready.current = true;
      }
    })();

    return () => {
      active = false;
      stopChannel();
      stopExpired();
      stopToken();
      configureRefresh(null);
      clearTimer();
    };
  }, [clearTimer, dropSession, schedule]);

  const login = useCallback(
    async (input: LoginRequest) => {
      const grant = await loginWithSession(input);
      setAccessToken(grant.accessToken);
      publishToken(grant);
      schedule(grant.expiresIn);
      const me = await getMe({ refresh: false });
      setUser(me);
      setStatus("authenticated");
      ready.current = true;
      return me;
    },
    [schedule],
  );

  const logout = useCallback(async () => {
    await logoutWithSession();
    publishLogout(false);
    dropSession();
    routerRef.current.replace("/login");
  }, [dropSession]);

  const endExpiredSession = useCallback(
    async (from?: string) => {
      await logoutWithSession();
      publishLogout(true);
      dropSession({ keepDrafts: true });
      routerRef.current.replace(from ? buildLoginHref(from) : "/login");
    },
    [dropSession],
  );

  const replaceUser = useCallback((next: UserResponse) => {
    setUser((current) => (current && current.id === next.id ? next : current));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        identity: identityOf(user),
        login,
        logout,
        endExpiredSession,
        replaceUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
