import { describe, expect, it } from "vitest";

import { buildBudgetLines, executedByItemId } from "./buildBudgetLines";

const ITEM_A = "11111111-1111-4111-8111-111111111111";
const ITEM_B = "22222222-2222-4222-8222-222222222222";
const USER = "33333333-3333-4333-8333-333333333333";
const BUDGET = "44444444-4444-4444-8444-444444444444";
const PROJECT = "55555555-5555-4555-8555-555555555555";

describe("buildBudgetLines", () => {
  it("sums executions per item and marks Completa / Faltante", () => {
    const spent = executedByItemId([
      {
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        itemId: ITEM_A,
        kind: "PAYMENT",
        amount: "74000000.00",
        occurredAt: "2026-01-10T00:00:00.000Z",
        registeredById: USER,
        note: null,
        createdAt: "2026-01-10T00:00:00.000Z",
      },
      {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        itemId: ITEM_B,
        kind: "PAYMENT",
        amount: "29000000.00",
        occurredAt: "2026-01-11T00:00:00.000Z",
        registeredById: USER,
        note: null,
        createdAt: "2026-01-11T00:00:00.000Z",
      },
    ]);

    expect(spent.get(ITEM_A)).toBe("74000000.00");
    expect(spent.get(ITEM_B)).toBe("29000000.00");

    const lines = buildBudgetLines(
      {
        id: BUDGET,
        projectId: PROJECT,
        totalAmount: "110000000.00",
        currency: "COP",
        alertThresholdPercent: 80,
        executedAmount: "103000000.00",
        executedPercent: 93.6,
        items: [
          {
            id: ITEM_A,
            category: "Equipos de campo",
            plannedAmount: "80000000.00",
            notes: null,
          },
          {
            id: ITEM_B,
            category: "Movilidad",
            plannedAmount: "30000000.00",
            notes: null,
          },
        ],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      [
        {
          id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
          itemId: ITEM_A,
          kind: "PAYMENT",
          amount: "74000000.00",
          occurredAt: "2026-01-10T00:00:00.000Z",
          registeredById: USER,
          note: null,
          createdAt: "2026-01-10T00:00:00.000Z",
        },
        {
          id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
          itemId: ITEM_B,
          kind: "PAYMENT",
          amount: "29000000.00",
          occurredAt: "2026-01-11T00:00:00.000Z",
          registeredById: USER,
          note: null,
          createdAt: "2026-01-11T00:00:00.000Z",
        },
      ],
    );

    expect(lines[0]?.status).toBe("missing");
    expect(lines[1]?.status).toBe("missing");
    expect(lines[0]?.spent).toBe("74000000.00");
  });
});
