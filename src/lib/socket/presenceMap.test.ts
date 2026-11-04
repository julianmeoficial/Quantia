import { describe, expect, it } from "vitest";

import { removePresenceUser, replacePresenceUsers, upsertPresenceUser } from "./presenceMap";

const ana = { id: "11111111-1111-4111-8111-111111111111", name: "Ana", avatarUrl: null };
const luis = { id: "22222222-2222-4222-8222-222222222222", name: "Luis", avatarUrl: null };

describe("presenceMap", () => {
  it("replaces the snapshot and dedupes by id", () => {
    expect(replacePresenceUsers([ana, { ...ana, name: "Ana 2" }, luis])).toEqual([
      { ...ana, name: "Ana 2" },
      luis,
    ]);
  });

  it("upserts and removes without inventing rows", () => {
    expect(upsertPresenceUser([ana], luis)).toEqual([ana, luis]);
    expect(removePresenceUser([ana, luis], ana.id)).toEqual([luis]);
  });
});
