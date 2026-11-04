import { Suspense } from "react";

import { Skeleton } from "@/components/system";
import { UsersScreen } from "@/features/users";

/** Client auth shell + searchParams block an instant static shell. */
export const instant = false;

export default function UsuariosPage() {
  return (
    <Suspense
      fallback={
        <>
          <Skeleton variant="table" />
        </>
      }
    >
      <UsersScreen />
    </Suspense>
  );
}
