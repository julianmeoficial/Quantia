"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/components/base";
import { EmptyState, ErrorState } from "@/components/system";
import { useAuth } from "@/features/auth/AuthProvider";
import { canAccess } from "@/lib/auth";
import type { AppRole } from "@/lib/auth/navigation";

import * as S from "../tasks/sectionPage.styles";

export interface ComingSoonScreenProps {
  /** Section route, used for the permission check (e.g. `/auditoria`). */
  href: string;
  title: string;
  /** One sentence on what the section will offer. */
  summary: string;
}

/**
 * Placeholder for sections whose API contract does not exist yet. It shows no data and
 * no controls: only the promise of what will live here.
 */
export function ComingSoonScreen({ href, title, summary }: ComingSoonScreenProps) {
  const router = useRouter();
  const { identity } = useAuth();
  const roles = (identity?.roles ?? []) as readonly AppRole[];

  if (!canAccess(href, roles)) {
    return (
      <ErrorState
        variant="forbidden"
        onRetry={() => router.replace("/")}
        retryLabel="Ir al inicio"
      />
    );
  }

  return (
    <S.Page>
      <S.Header>
        <S.HeaderText>
          <S.Title>{title}</S.Title>
          <S.Subtitle>{summary}</S.Subtitle>
        </S.HeaderText>
        <S.HeaderActions>
          <Badge label="Próximamente" tone="info" />
        </S.HeaderActions>
      </S.Header>
      <EmptyState
        kind="no-records"
        title="Próximamente"
        description="Estamos terminando esta sección. Cuando esté lista la verás aquí, con datos reales del sistema."
      />
    </S.Page>
  );
}
