import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

type MockServer = typeof import("~/__mocks__/msw/server").server;

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    clear: () => storage.clear(),
    getItem: (key: string) => storage.get(key) ?? null,
    removeItem: (key: string) => storage.delete(key),
    setItem: (key: string, value: string) => storage.set(key, String(value)),
  },
});

let server: MockServer;

/**
 * MSW Server Setup
 *
 * Start MSW server before all tests and clean up after.
 */
beforeAll(async () => {
  ({ server } = await import("~/__mocks__/msw/server"));
  server.listen({ onUnhandledRequest: "bypass" });
});
afterEach(() => server?.resetHandlers());
afterAll(() => server?.close());
