"use client";

import * as S from "./Skeleton.styles";

export type SkeletonVariant = "metric" | "card" | "list" | "table";

export interface SkeletonProps {
  variant: SkeletonVariant;
  rows?: number;
}

export function Skeleton({ variant, rows = 4 }: SkeletonProps) {
  const safeRows = Math.max(1, Math.min(rows, 12));

  return (
    <S.Region aria-busy="true" aria-live="polite">
      <S.VisuallyHidden>Cargando…</S.VisuallyHidden>
      {variant === "metric" ? <MetricSkeleton /> : null}
      {variant === "card" ? <CardSkeleton /> : null}
      {variant === "list" ? <ListSkeleton rows={safeRows} /> : null}
      {variant === "table" ? <TableSkeleton rows={safeRows} /> : null}
    </S.Region>
  );
}

function MetricSkeleton() {
  return (
    <S.MetricGrid aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <S.Card key={index}>
          <S.Block $width="40%" $height="0.75rem" />
          <S.Block $width="60%" $height="2rem" />
          <S.Block $width="50%" $height="0.75rem" />
        </S.Card>
      ))}
    </S.MetricGrid>
  );
}

function CardSkeleton() {
  return (
    <S.Card aria-hidden>
      <S.Block $width="55%" $height="1.25rem" />
      <S.Block $height="0.875rem" />
      <S.Block $width="80%" $height="0.875rem" />
      <S.Block $width="35%" $height="2.75rem" />
    </S.Card>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <S.List aria-hidden>
      {Array.from({ length: rows }, (_, index) => (
        <S.ListItem key={index}>
          <S.Block $width="2rem" $height="2rem" />
          <S.Block $width="70%" $height="1rem" />
        </S.ListItem>
      ))}
    </S.List>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <S.Table aria-hidden>
      <S.TableRow $header>
        <S.Block $height="0.75rem" />
        <S.Block $height="0.75rem" />
        <S.Block $height="0.75rem" />
        <S.Block $height="0.75rem" />
      </S.TableRow>
      {Array.from({ length: rows }, (_, index) => (
        <S.TableRow key={index}>
          <S.Block $height="1rem" />
          <S.Block $height="1rem" />
          <S.Block $height="1rem" />
          <S.Block $height="1rem" />
        </S.TableRow>
      ))}
    </S.Table>
  );
}
