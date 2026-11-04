import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginScreen } from "@/features/auth/LoginScreen";
import { NavBoot } from "@/features/auth/NavBoot";

export const metadata: Metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<NavBoot />}>
      <LoginScreen />
    </Suspense>
  );
}
