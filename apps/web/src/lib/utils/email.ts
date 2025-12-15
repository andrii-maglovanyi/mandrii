/**
 * RFC 5322 compliant email regex pattern.
 * This pattern validates:
 * - Local part: letters, numbers, and special chars (._%+-)
 * - @ symbol
 * - Domain: letters, numbers, hyphens
 * - TLD: 2+ letters
 *
 * Note: This is intentionally simpler than full RFC 5322 to match
 * common email validation libraries (like Zod's .email()).
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

/**
 * Returns whether the given string is a valid email address.
 * Uses a regex pattern that closely matches Zod's .email() validation
 * to ensure client-server consistency.
 *
 * @param value The email to validate
 * @returns true if the email is valid, false otherwise
 *
 * @example
 * isEmail("user@example.com") // true
 * isEmail("user.name+tag@sub.domain.com") // true
 * isEmail("invalid") // false
 * isEmail("no@tld") // false
 * isEmail("@nodomain.com") // false
 */
export const isEmail = (value: string): boolean => {
  if (!value || typeof value !== "string") {
    return false;
  }

  // Trim and check length constraints
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 254) {
    return false;
  }

  return EMAIL_REGEX.test(trimmed);
};
