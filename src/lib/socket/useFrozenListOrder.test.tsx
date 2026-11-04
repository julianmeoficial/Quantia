import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFrozenListOrder } from "./useFrozenListOrder";

describe("useFrozenListOrder", () => {
  it("keeps the previous order when natural ids change and applies on demand", () => {
    const first = [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ];
    const second = [
      { id: "b", label: "B" },
      { id: "a", label: "A" },
    ];

    const { result, rerender } = renderHook(({ items }) => useFrozenListOrder(items), {
      initialProps: { items: first },
    });

    expect(result.current.items.map((item) => item.id)).toEqual(["a", "b"]);

    rerender({ items: second });

    expect(result.current.hasPendingReorder).toBe(true);
    expect(result.current.items.map((item) => item.id)).toEqual(["a", "b"]);

    act(() => {
      result.current.applyPendingOrder();
    });

    expect(result.current.hasPendingReorder).toBe(false);
    expect(result.current.items.map((item) => item.id)).toEqual(["b", "a"]);
  });
});
