/**
 * Centralized Test Utilities
 *
 * This module exports shared mocks, factories, and utilities for unit tests.
 * Import these instead of duplicating mock definitions across test files.
 *
 * NOTE: Due to Vitest's vi.mock hoisting behavior, mock factory functions
 * CANNOT be imported and passed to vi.mock directly. Instead:
 *
 * 1. For DATA FACTORIES (createCartItem, createMockOrder, etc.):
 *    Import and use them anywhere in your tests.
 *
 * 2. For MOCK FACTORY DEFINITIONS (mockNextIntl, mockI18n, etc.):
 *    These export the return values of mock factories. Copy the patterns
 *    into your vi.mock() calls, or use vi.mock.hoisted() pattern.
 *
 * @example Using data factories:
 * ```typescript
 * import { createCartItem, createMockOrder } from "~/__mocks__/test-utils";
 *
 * // In your test
 * const item = createCartItem({ quantity: 5 });
 * const order = createMockOrder({ status: "processing" });
 * ```
 *
 * @example Referencing mock patterns (for copy-paste):
 * ```typescript
 * // See the exported mock objects in ./mocks.ts for patterns to use with vi.mock()
 * // Example:
 * vi.mock("next-intl", () => ({
 *   useLocale: () => "en",
 * }));
 * ```
 */

export * from "./mocks";
export * from "./factories";
export * from "./helpers";
