import { renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const { query, state } = vi.hoisted(() => ({
  query: vi.fn(),
  state: { ready: true, refreshing: false },
}));
vi.mock("@apollo/client", async (original) => ({ ...(await original<object>()), useQuery: query }));
import { useEventDiscovery } from "./useEventDiscovery";
const event = {
  end_date: "2099-01-01T13:00:00Z",
  id: "upcoming",
  is_recurring: false,
  recurrence_rule: null,
  start_date: "2099-01-01T12:00:00Z",
};
const successfulData = { events: [event] };
beforeEach(() => {
  state.refreshing = false;
  state.ready = true;
  query.mockReset();
  query.mockImplementation((_document, options) => {
    if (options.skip) return { data: undefined, loading: false };
    return { data: state.ready ? successfulData : undefined, loading: !state.ready || state.refreshing };
  });
});
it("keeps cached event cards visible while schedules and details refresh", () => {
  const { rerender, result } = renderHook(() => useEventDiscovery({ limit: 12 }));
  expect(result.current.data).toEqual([event]);
  state.refreshing = true;
  rerender();
  expect(result.current.data).toEqual([event]);
  expect(result.current.loading).toBe(false);
  expect(query.mock.calls.at(-1)?.[1].skip).toBe(false);
});
it("waits for schedules on a cold load and does not fetch empty detail lists", () => {
  state.ready = false;
  const { result } = renderHook(() => useEventDiscovery({ limit: 12 }));
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toEqual([]);
  expect(query.mock.calls.at(-1)?.[1].skip).toBe(true);
});

it("retains matching cards on refresh failure without leaking them into a different filter", () => {
  const { rerender, result } = renderHook(
    ({ city }) => useEventDiscovery({ limit: 12, where: { city: { _eq: city } } }),
    {
      initialProps: { city: "London" },
    },
  );
  expect(result.current.data).toEqual([event]);
  query.mockImplementation(() => ({ data: undefined, error: new Error("Connection unavailable"), loading: false }));
  rerender({ city: "London" });
  expect(result.current.data).toEqual([event]);
  expect(result.current.error).toBeUndefined();
  expect(result.current.refreshError?.message).toBe("Connection unavailable");
  rerender({ city: "Paris" });
  expect(result.current.data).toEqual([]);
  expect(result.current.error?.message).toBe("Connection unavailable");
});
