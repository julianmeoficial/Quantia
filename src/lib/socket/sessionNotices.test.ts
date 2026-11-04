import { afterEach, describe, expect, it } from "vitest";

import {
  budgetLowDedupeKey,
  clearSessionNotices,
  getSessionNotices,
  getUnreadNoticeCount,
  markAllNoticesRead,
  noticeFromBudgetLow,
  pushSessionNotice,
} from "./sessionNotices";

const payload = {
  projectId: "11111111-1111-4111-8111-111111111111",
  budgetId: "33333333-3333-4333-8333-333333333333",
  executedPercent: 40,
  thresholdPercent: 80,
  updatedAt: "2026-11-04T12:00:00.000Z",
};

afterEach(() => {
  clearSessionNotices();
});

describe("sessionNotices", () => {
  it("dedupes budget-low by projectId + updatedAt", () => {
    const notice = noticeFromBudgetLow(payload, "/proyectos/x");
    expect(pushSessionNotice(notice)).toBe(true);
    expect(pushSessionNotice(notice)).toBe(false);
    expect(getSessionNotices()).toHaveLength(1);
    expect(budgetLowDedupeKey(payload)).toBe(`${payload.projectId}:${payload.updatedAt}`);
  });

  it("tracks unread count until markAllNoticesRead", () => {
    pushSessionNotice(noticeFromBudgetLow(payload, "/proyectos/x"));
    expect(getUnreadNoticeCount()).toBe(1);
    markAllNoticesRead();
    expect(getUnreadNoticeCount()).toBe(0);
  });
});
