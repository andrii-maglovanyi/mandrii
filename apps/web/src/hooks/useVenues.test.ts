import { renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type { APIParams } from "~/types";

import { useVenues } from "./useVenues";

const { query } = vi.hoisted(() => ({
  query: vi.fn((_document: unknown, _variables: APIParams) => ({ data: [], loading: false })),
}));
vi.mock("./useGraphApi", () => ({ useGraphApi: query }));
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

it("keeps the event-count cutoff stable when paginating venues", () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-14T12:00:00Z"));
  const { rerender } = renderHook(({ offset }) => useVenues().usePublicVenues({ limit: 12, offset }), {
    initialProps: { offset: 0 },
  });
  const initial = query.mock.calls.at(-1)![1];
  vi.setSystemTime(new Date("2026-09-14T12:01:00Z"));
  rerender({ offset: 12 });
  const next = query.mock.calls.at(-1)![1];
  expect(next.whereEvents).toBe(initial.whereEvents);
  expect(next.offset).toBe(12);
});
