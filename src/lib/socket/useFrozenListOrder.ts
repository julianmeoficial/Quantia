"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function idsOf<T extends { id: string }>(items: T[]): string[] {
  return items.map((item) => item.id);
}

function sameOrder(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((id, index) => id === b[index]);
}

/**
 * D-07: keep the visible list order stable while live updates arrive.
 * Items patch in place; a pending reorder badge applies the natural query order.
 */
export function useFrozenListOrder<T extends { id: string }>(items: T[] | null | undefined) {
  const [frozenIds, setFrozenIds] = useState<string[] | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const lastNaturalRef = useRef<string[]>([]);

  const list = useMemo(() => items ?? [], [items]);
  const naturalIds = useMemo(() => idsOf(list), [list]);

  useEffect(() => {
    if (list.length === 0) {
      lastNaturalRef.current = [];
      return;
    }

    const previous = lastNaturalRef.current;
    if (previous.length === 0) {
      lastNaturalRef.current = naturalIds;
      return;
    }

    if (!sameOrder(previous, naturalIds)) {
      setFrozenIds((current) => current ?? previous);
      setPendingCount((value) => value + 1);
    }

    lastNaturalRef.current = naturalIds;
  }, [list.length, naturalIds]);

  const byId = useMemo(() => {
    const map = new Map<string, T>();
    for (const item of list) map.set(item.id, item);
    return map;
  }, [list]);

  const orderedItems = useMemo(() => {
    if (!frozenIds) return list;

    const ordered: T[] = [];
    const seen = new Set<string>();
    for (const id of frozenIds) {
      const item = byId.get(id);
      if (item) {
        ordered.push(item);
        seen.add(id);
      }
    }
    for (const item of list) {
      if (!seen.has(item.id)) ordered.push(item);
    }
    return ordered;
  }, [byId, frozenIds, list]);

  const applyPendingOrder = useCallback(() => {
    setFrozenIds(naturalIds);
    setPendingCount(0);
    lastNaturalRef.current = naturalIds;
  }, [naturalIds]);

  const releaseFreeze = useCallback(() => {
    setFrozenIds(null);
    setPendingCount(0);
  }, []);

  return {
    items: orderedItems,
    pendingCount,
    hasPendingReorder: pendingCount > 0 && frozenIds !== null,
    applyPendingOrder,
    releaseFreeze,
  };
}
