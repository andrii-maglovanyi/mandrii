/**
 * MSW Request Handlers
 *
 * This file exports all request handlers for MSW.
 * Handlers are organized by feature/domain.
 */

import { shopHandlers } from "./shop";

export const handlers = [...shopHandlers];
