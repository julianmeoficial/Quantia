import { describe, expect, it } from "vitest";

import { LUIS_ID, presenceUser } from "@/test/chatFixtures";

import { removePresenceUser, replacePresenceUsers, upsertPresenceUser } from "./presenceMap";

const ana = presenceUser();
const luis = presenceUser({ id: LUIS_ID, name: "Luis", avatar: "AVATAR_02" });

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
