import type { Session } from "next-auth";

import { beforeEach, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("next-auth/react", () => ({ getSession }));
const session = (token: string): Session => ({
  accessToken: token,
  accessTokenExpiresAt: Date.now() + 3_600_000,
  expires: "2099-01-01",
  user: { id: "user" },
});
beforeEach(() => {
  vi.resetModules();
  vi.resetAllMocks();
});

it("reuses the provider's token across GraphQL requests without fetching sessions", async () => {
  const { getApolloAccessToken, setApolloSessionToken } = await import("./session-token");
  setApolloSessionToken(session("current"));
  expect(await Promise.all([getApolloAccessToken(), getApolloAccessToken()])).toEqual(["current", "current"]);
  expect(getSession).not.toHaveBeenCalled();
});
it("coalesces refreshes and suppresses session broadcasts", async () => {
  const { getApolloAccessToken } = await import("./session-token");
  getSession.mockResolvedValue(session("fresh"));
  expect(await Promise.all([getApolloAccessToken(), getApolloAccessToken()])).toEqual(["fresh", "fresh"]);
  expect(getSession).toHaveBeenCalledExactlyOnceWith({ broadcast: false });
});
it("does not restore the old account when a refresh completes after sign-out", async () => {
  const { getApolloAccessToken, setApolloSessionToken } = await import("./session-token");
  let resolve!: (value: Session) => void;
  getSession.mockReturnValue(
    new Promise<Session>((done) => {
      resolve = done;
    }),
  );
  const pending = getApolloAccessToken();
  setApolloSessionToken(null);
  resolve(session("old-account"));
  expect(await pending).toBeUndefined();
  expect(await getApolloAccessToken()).toBeUndefined();
  expect(getSession).toHaveBeenCalledOnce();
});
it("refreshes near-expiry tokens and retries failures", async () => {
  const { getApolloAccessToken, setApolloSessionToken } = await import("./session-token");
  setApolloSessionToken({ ...session("expiring"), accessTokenExpiresAt: Date.now() + 10_000 });
  getSession.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(session("fresh"));
  expect(await getApolloAccessToken()).toBeUndefined();
  expect(await getApolloAccessToken()).toBe("fresh");
});

it("retries null refresh responses instead of permanently caching anonymous credentials", async () => {
  const { getApolloAccessToken, setApolloSessionToken } = await import("./session-token");
  setApolloSessionToken({ ...session("expiring"), accessTokenExpiresAt: Date.now() });
  getSession.mockResolvedValueOnce(null).mockResolvedValueOnce(session("recovered"));
  expect(await getApolloAccessToken()).toBeUndefined();
  vi.useFakeTimers();
  try {
    vi.advanceTimersByTime(30_001);
    expect(await getApolloAccessToken()).toBe("recovered");
  } finally {
    vi.useRealTimers();
  }
});

it("uses the new account's credentials when an old refresh resolves", async () => {
  const { getApolloAccessToken, setApolloSessionToken } = await import("./session-token");
  let resolve!: (value: Session) => void;
  getSession.mockReturnValue(
    new Promise<Session>((done) => {
      resolve = done;
    }),
  );
  const pending = getApolloAccessToken();
  setApolloSessionToken({ ...session("new-account"), user: { id: "new-user" } });
  resolve(session("old-account"));
  expect(await pending).toBe("new-account");
});
