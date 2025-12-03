/**
 * MSW Server Setup for Tests
 *
 * This file sets up the MSW server for use in Vitest tests.
 */

import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/**
 * MSW Server instance for Node.js (Vitest)
 */
export const server = setupServer(...handlers);
