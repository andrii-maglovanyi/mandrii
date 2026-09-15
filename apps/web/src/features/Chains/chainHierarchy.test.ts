import { describe, expect, it } from "vitest";

import { getDescendantChainIds, getEligibleParentChainIds } from "./chainHierarchy";

const chains = [
  { chain_id: null, id: "group" },
  { chain_id: "group", id: "country" },
  { chain_id: "country", id: "city" },
  { chain_id: null, id: "independent" },
];

describe("chain hierarchy helpers", () => {
  it("finds all descendants of a chain", () => {
    expect(getDescendantChainIds(chains, "group")).toEqual(new Set(["group", "country", "city"]));
  });

  it("does not offer a chain or its descendants as parent options", () => {
    expect(getEligibleParentChainIds(chains, "country")).toEqual(new Set());
  });

  it("does not offer a third hierarchy level", () => {
    expect(getEligibleParentChainIds(chains, null)).toEqual(new Set(["group", "independent"]));
  });

  it("does not allow moving a group with children below another group", () => {
    expect(getEligibleParentChainIds(chains, "group")).toEqual(new Set());
  });
});
