import type { Session } from "next-auth";

import { beforeEach, expect, it, vi } from "vitest";

const { context, getToken, setToken, terminate } = vi.hoisted(() => ({
  context: {
    callback: undefined as
      | ((
          operation: unknown,
          context: { headers?: Record<string, string> },
        ) => Promise<{ headers: Record<string, unknown> }>)
      | undefined,
  },
  getToken: vi.fn(),
  setToken: vi.fn(),
  terminate: vi.fn(),
}));
vi.mock("graphql-ws", () => ({ createClient: () => ({ subscribe: vi.fn(), terminate }) }));
vi.mock("./session-token", () => ({ getApolloAccessToken: getToken, setApolloSessionToken: setToken }));
vi.mock("../config/public", () => ({ publicConfig: { hasura: { endpoint: "https://example.test/graphql" } } }));
vi.mock("@apollo/client/link/context", async (original) => {
  const actual = await original<typeof import("@apollo/client/link/context")>();
  return {
    ...actual,
    setContext: (callback: NonNullable<typeof context.callback>) => {
      context.callback = callback;
      return actual.setContext(callback);
    },
  };
});
const session = (role = "user", token = "token"): Session => ({
  accessToken: token,
  expires: "2099-01-01",
  user: { id: "a", role: role as "admin" | "user", status: "active" },
});
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});
it("resets account data on role changes and sign-out, but not routine token refreshes", async () => {
  const { default: client, syncApolloSession } = await import("./client");
  const reset = vi.spyOn(client, "resetStore").mockResolvedValue([]);
  syncApolloSession(session());
  syncApolloSession(session("user", "refreshed"));
  expect(reset).not.toHaveBeenCalled();
  syncApolloSession(session("admin", "admin-token"));
  expect(reset).toHaveBeenCalledOnce();
  syncApolloSession(null);
  expect(reset).toHaveBeenCalledTimes(2);
  expect(terminate).toHaveBeenCalledTimes(4);
  expect(setToken).toHaveBeenLastCalledWith(null);
});
it("removes old authorization headers when replaying a request after sign-out", async () => {
  await import("./client");
  getToken.mockResolvedValue(undefined);
  const result = await context.callback!(
    {},
    { headers: { Authorization: "Bearer old", authorization: "Bearer old", "x-request-id": "request" } },
  );
  expect(result.headers).toEqual({ "x-request-id": "request" });
});

it("routes public reads through the shared endpoint without looking up an account token", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ data: { venues: [] } }), {
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  const { default: client } = await import("./client");
  const { GET_PUBLIC_VENUE_OPTIONS } = await import("~/graphql/venues");
  await client.query({
    fetchPolicy: "network-only",
    query: GET_PUBLIC_VENUE_OPTIONS,
    variables: { limit: 20, where: {} },
  });
  expect(fetchMock.mock.calls[0][0]).toBe("/api/discovery");
  expect(getToken).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});
