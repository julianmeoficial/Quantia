import { SyncEntityType } from "@quantia/contracts";
import { beforeEach, describe, expect, it, vi } from "vitest";

const post = vi.fn();

vi.mock("./client", () => ({
  api: {
    post: (...args: unknown[]) => post(...args),
  },
}));

describe("retrySync", () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue(undefined);
  });

  it("posts to /sync/:entityType/:id/retry", async () => {
    const { retrySync } = await import("./sync");
    const id = "11111111-1111-4111-8111-111111111111";
    await retrySync(SyncEntityType.TASK, id);
    expect(post).toHaveBeenCalledWith(
      `/sync/TASK/${id}/retry`,
      undefined,
      expect.objectContaining({ schema: expect.anything() }),
    );
  });

  it("rejects invalid uuids before calling the API", async () => {
    const { retrySync } = await import("./sync");
    await expect(retrySync(SyncEntityType.PROJECT, "not-a-uuid")).rejects.toMatchObject({
      name: "ZodError",
    });
    expect(post).not.toHaveBeenCalled();
  });
});
