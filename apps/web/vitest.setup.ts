import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "~/__mocks__/msw/server";

/**
 * MSW Server Setup
 *
 * Start MSW server before all tests and clean up after.
 */
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
