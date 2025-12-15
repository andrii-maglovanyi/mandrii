import { describe, expect, it } from "vitest";

import { isEmail } from "./email";

describe("isEmail", () => {
  describe("valid emails", () => {
    it.each([
      ["user@example.com", "basic email"],
      ["user.name@example.com", "email with dot in local part"],
      ["user+tag@example.com", "email with plus sign"],
      ["user_name@example.com", "email with underscore"],
      ["user-name@example.com", "email with hyphen"],
      ["user123@example.com", "email with numbers"],
      ["USER@EXAMPLE.COM", "uppercase email"],
      ["user@sub.domain.com", "email with subdomain"],
      ["user@example.co.uk", "email with two-part TLD"],
      ["a@bc.de", "minimal valid email"],
      ["very.common@example.com", "common format"],
      ["disposable.style.email.with+symbol@example.com", "complex local part"],
      ["other.email-with-hyphen@example.com", "hyphen in domain"],
      ["fully-qualified-domain@example.com", "hyphenated local part"],
      ["user.name+tag+sorting@example.com", "multiple plus signs"],
      ["x@example.com", "single character local part"],
      ["example@s.example", "short subdomain"],
      ["user%example.com@example.org", "percent sign"],
    ])("accepts %s (%s)", (email) => {
      expect(isEmail(email)).toBe(true);
    });
  });

  describe("invalid emails", () => {
    it.each([
      ["", "empty string"],
      ["   ", "whitespace only"],
      ["notanemail", "no @ symbol"],
      ["@nodomain.com", "no local part"],
      ["nodomain@", "no domain"],
      ["user@", "@ at end"],
      ["@", "only @"],
      ["user@.com", "domain starts with dot"],
      ["user@domain.", "domain ends with dot"],
      ["user@domain..com", "double dot in domain"],
      ["user@-domain.com", "domain starts with hyphen"],
      ["user@domain-.com", "domain ends with hyphen"],
      ["user name@example.com", "space in local part"],
      ["user@exam ple.com", "space in domain"],
      ["user@domain.c", "single char TLD"],
      ["a@b", "no TLD"],
      ["a@b.", "trailing dot, no TLD"],
      ["user@@domain.com", "double @"],
      ["Abc.example.com", "no @ (looks like email)"],
      ["A@b@c@example.com", "multiple @ symbols"],
    ])("rejects %s (%s)", (email) => {
      expect(isEmail(email)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("handles null-like values", () => {
      // @ts-expect-error testing runtime behavior
      expect(isEmail(null)).toBe(false);
      // @ts-expect-error testing runtime behavior
      expect(isEmail(undefined)).toBe(false);
    });

    it("trims whitespace from valid emails", () => {
      expect(isEmail("  user@example.com  ")).toBe(true);
      expect(isEmail("\tuser@example.com\n")).toBe(true);
    });

    it("rejects emails over 254 characters", () => {
      const longLocal = "a".repeat(64);
      const longDomain = "b".repeat(190) + ".com"; // 64 + 1 + 190 + 4 = 259 > 254
      const longEmail = `${longLocal}@${longDomain}`;
      expect(longEmail.length).toBeGreaterThan(254);
      expect(isEmail(longEmail)).toBe(false);
    });

    it("accepts emails at 254 character limit", () => {
      // Create an email exactly at 254 chars
      const local = "a".repeat(64);
      const domainPart = "b".repeat(254 - 64 - 1 - 4); // -1 for @, -4 for .com
      const email = `${local}@${domainPart}.com`;
      expect(email.length).toBe(254);
      expect(isEmail(email)).toBe(true);
    });

    it("allows dots at start/end of local part (browser permissive)", () => {
      // Note: These are technically invalid per RFC 5321 but are often accepted
      // Our regex is permissive like browser validation
      expect(isEmail(".user@domain.com")).toBe(true);
      expect(isEmail("user.@domain.com")).toBe(true);
    });
  });
});
