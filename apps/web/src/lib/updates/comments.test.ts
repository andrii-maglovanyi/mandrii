import { describe, expect, it } from "vitest";

import {
  canEditContentUpdateComment,
  mergeContentUpdateCommentPage,
  reconcileContentUpdateCommentPreview,
} from "./comments";
import { ContentUpdateComment } from "./types";

const comment = (id: string, createdAt = "2026-08-28T08:00:00.000Z"): ContentUpdateComment => ({
  author: { id: "user-1", image: null, name: "Member" },
  body: "Hello",
  createdAt,
  id,
  parentId: null,
  updatedAt: createdAt,
});

describe("content update discussion helpers", () => {
  it("only permits the author to edit during the fifteen-minute window", () => {
    expect(canEditContentUpdateComment(comment("one"), "user-1", Date.parse("2026-08-28T08:14:59.000Z"))).toBe(true);
    expect(canEditContentUpdateComment(comment("one"), "user-2", Date.parse("2026-08-28T08:01:00.000Z"))).toBe(false);
    expect(canEditContentUpdateComment(comment("one"), "user-1", Date.parse("2026-08-28T08:15:00.000Z"))).toBe(false);
  });

  it("merges cursor pages without duplicating preview comments and retains chronological order", () => {
    expect(
      mergeContentUpdateCommentPage(
        [comment("newer", "2026-08-28T08:02:00.000Z"), comment("newest", "2026-08-28T08:03:00.000Z")],
        [comment("newest", "2026-08-28T08:03:00.000Z"), comment("older", "2026-08-28T08:01:00.000Z")],
      ).map(({ id }) => id),
    ).toEqual(["older", "newer", "newest"]);
  });

  it("reconciles changed preview comments without discarding loaded pages", () => {
    const loaded = [comment("one"), comment("older")];
    const edited = { ...comment("one"), body: "Edited" };
    expect(reconcileContentUpdateCommentPreview(loaded, [edited]).map(({ body, id }) => ({ body, id }))).toEqual([
      { body: "Hello", id: "older" },
      { body: "Edited", id: "one" },
    ]);
  });
});
