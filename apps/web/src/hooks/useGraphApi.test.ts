import { gql } from "@apollo/client";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { useGraphApi } from "./useGraphApi";

const { fetchMore, queryResult } = vi.hoisted(() => {
  const fetchMore = vi.fn();
  return {
    fetchMore,
    queryResult: {
      data: { items: [{ id: "first" }], items_aggregate: { aggregate: { count: 30 } } },
      fetchMore,
      loading: false,
    },
  };
});
vi.mock("@apollo/client", async (original) => ({ ...(await original<object>()), useQuery: () => queryResult }));
vi.mock("react-responsive", () => ({ useMediaQuery: () => true }));
const query = gql`
  query Items($where: items_bool_exp, $offset: Int) {
    items(where: $where, offset: $offset) {
      id
    }
    items_aggregate {
      aggregate {
        count
      }
    }
  }
`;
beforeEach(() => {
  vi.clearAllMocks();
  fetchMore.mockResolvedValue({});
});

it("starts pagination again after the filter changes", async () => {
  const { rerender } = renderHook(
    ({ category }) => useGraphApi(query, { offset: 10, where: { category: { _eq: category } } }),
    { initialProps: { category: "one" } },
  );
  await waitFor(() => expect(fetchMore).toHaveBeenCalledTimes(1));
  rerender({ category: "two" });
  await waitFor(() => expect(fetchMore).toHaveBeenCalledTimes(2));
});
it("does not fetch more when the query is skipped", async () => {
  renderHook(() => useGraphApi(query, { offset: 10 }, { skip: true }));
  expect(fetchMore).not.toHaveBeenCalled();
});
it("returns a loading error without an unhandled rejection or a request loop", async () => {
  fetchMore.mockRejectedValue(new Error("Network unavailable"));
  const { result } = renderHook(() => useGraphApi(query, { offset: 10 }));
  await waitFor(() => expect(result.current.error?.message).toBe("Network unavailable"));
  expect(result.current.loading).toBe(false);
  expect(fetchMore).toHaveBeenCalledOnce();
});

it("clears cached results immediately when an authenticated query becomes skipped", () => {
  const { rerender, result } = renderHook(({ skip }) => useGraphApi(query, {}, { skip }), {
    initialProps: { skip: false },
  });
  expect(result.current.data).toHaveLength(1);
  rerender({ skip: true });
  expect(result.current.data).toEqual([]);
  expect(result.current.count).toBe(0);
  expect(result.current.total).toBe(0);
  expect(result.current.hasMore).toBe(false);
  expect(result.current.loading).toBe(false);
});
