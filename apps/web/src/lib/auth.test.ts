import type { NextAuthConfig } from "next-auth";

import { afterEach, beforeEach, expect, it, vi } from "vitest";

const { nextAuth, sign } = vi.hoisted(() => ({
  nextAuth: vi.fn((_options: NextAuthConfig) => ({ auth: vi.fn(), handlers: {}, signIn: vi.fn(), signOut: vi.fn() })),
  sign: vi.fn((_payload: unknown, ..._options: unknown[]) => "fresh-token"),
}));
vi.mock("next-auth", () => ({ default: nextAuth }));
vi.mock("jsonwebtoken", () => ({ default: { sign } }));
vi.mock("@auth/hasura-adapter", () => ({ HasuraAdapter: vi.fn() }));
vi.mock("next-auth/providers/google", () => ({ default: {} }));
vi.mock("next-auth/providers/resend", () => ({ default: vi.fn() }));
vi.mock("./authSendRequest", () => ({ sendVerificationRequest: vi.fn() }));
vi.mock("./config/env", () => ({ isDevelopment: false, isProduction: false }));
vi.mock("./config/private", () => ({
  privateConfig: {
    auth: { nextAuthSecret: "test-secret" },
    email: { resendApiKey: "test-key" },
    hasura: { adminSecret: "test-admin" },
  },
}));
vi.mock("./config/public", () => ({ publicConfig: { hasura: { endpoint: "https://example.test/graphql" } } }));
vi.mock("./url-helper", () => ({ UrlHelper: { getBaseUrl: () => "https://mandrii.com" } }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllGlobals());
async function callback() {
  await import("./auth");
  return nextAuth.mock.calls[0][0].callbacks!.jwt!;
}
const existingToken = () => ({
  accessToken: "old-token",
  accessTokenExpiry: Date.now() + 3_600_000,
  hasuraClaims: { "x-hasura-default-role": "admin" },
  role: "admin",
  status: "active",
  sub: "user-id",
});

it.each([
  { role: "user", status: "active" },
  { role: "admin", status: "inactive" },
])("regenerates Hasura credentials when a session update changes privileges: %s", async (user) => {
  const fetch = vi.fn().mockResolvedValue(Response.json({ data: { users: [{ id: "user-id", ...user }] } }));
  vi.stubGlobal("fetch", fetch);
  const jwtCallback = await callback();
  const result = await jwtCallback({ token: existingToken(), trigger: "update" } as unknown as Parameters<
    typeof jwtCallback
  >[0]);
  expect(result?.accessToken).toBe("fresh-token");
  expect(sign).toHaveBeenCalledOnce();
  expect(sign.mock.calls[0][0]).toMatchObject({
    "https://hasura.io/jwt/claims": { "x-hasura-allowed-roles": ["user"], "x-hasura-default-role": "user" },
  });
  expect(fetch).toHaveBeenCalledOnce();
});
it("does not query the database or sign a new token for an unchanged, unexpired session", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const jwtCallback = await callback();
  const result = await jwtCallback({ token: existingToken() } as unknown as Parameters<typeof jwtCallback>[0]);
  expect(result?.accessToken).toBe("old-token");
  expect(fetch).not.toHaveBeenCalled();
  expect(sign).not.toHaveBeenCalled();
});

it("limits newly issued privileged Hasura tokens to five minutes", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ data: { users: [{ id: "user-id", role: "admin", status: "active" }] } })),
  );
  const jwtCallback = await callback();
  await jwtCallback({ token: existingToken(), trigger: "update" } as unknown as Parameters<typeof jwtCallback>[0]);
  expect(sign.mock.calls[0][2]).toMatchObject({ expiresIn: 300 });
});

it("ignores client-supplied role and account identifiers during session updates", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(Response.json({ data: { users: [{ id: "user-id", role: "user", status: "active" }] } }));
  vi.stubGlobal("fetch", fetch);
  const jwtCallback = await callback();
  const result = await jwtCallback({
    session: { accessToken: "forged", user: { id: "another-user", role: "admin" } },
    token: existingToken(),
    trigger: "update",
  } as unknown as Parameters<typeof jwtCallback>[0]);
  expect(JSON.parse(fetch.mock.calls[0][1].body).variables).toEqual({ id: "user-id" });
  expect(result).toMatchObject({ accessToken: "fresh-token", role: "user", sub: "user-id" });
});

it.each([{ errors: [{ message: "Unavailable" }] }, { data: { users: [] } }])(
  "does not renew privileges when the account lookup fails: %s",
  async (response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(response)));
    const jwtCallback = await callback();
    await expect(
      jwtCallback({ token: { ...existingToken(), accessTokenExpiry: 0 } } as unknown as Parameters<
        typeof jwtCallback
      >[0]),
    ).rejects.toThrow();
    expect(sign).not.toHaveBeenCalled();
  },
);
