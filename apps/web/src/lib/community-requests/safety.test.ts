import { describe, expect, it } from "vitest";

import { hasCommunityRequestContactDetails } from "./safety";

describe("hasCommunityRequestContactDetails", () => {
  it("allows a useful public response", () => {
    expect(
      hasCommunityRequestContactDetails("I know a local Ukrainian-speaking mechanic and can explain where to start."),
    ).toBe(false);
  });

  it.each([
    "Write to me at hello@example.com",
    "Call +44 20 1234 5678",
    "See https://example.com",
    "More at www.example.com",
  ])("blocks direct contact details: %s", (value) => {
    expect(hasCommunityRequestContactDetails(value)).toBe(true);
  });
});
