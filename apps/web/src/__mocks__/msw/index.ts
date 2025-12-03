/**
 * MSW Mock Service Worker
 *
 * This module provides MSW setup for mocking API calls in tests.
 *
 * Usage in tests:
 * ```typescript
 * import { server } from "~/__mocks__/msw";
 * import { shopErrorHandlers } from "~/__mocks__/msw/handlers/shop";
 *
 * // Override handlers for specific test scenarios
 * server.use(shopErrorHandlers.networkError);
 * ```
 */

export { server } from "./server";
export { handlers } from "./handlers";
export * from "./handlers/shop";
export * from "./data";
