"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { landing } from "@/lib/auth";

import { useAuth } from "./AuthProvider";
import { NavBoot } from "./NavBoot";

/** `/` no es una vista: manda al aterrizaje del rol o al login. */
export function HomeGate() {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "booting") return;
    if (status === "authenticated" && user) {
      router.replace(landing(user.roles) ?? "/login");
      return;
    }
    if (status === "anonymous" || status === "sessionExpired") router.replace("/login");
  }, [status, user, router]);

  return <NavBoot />;
}
