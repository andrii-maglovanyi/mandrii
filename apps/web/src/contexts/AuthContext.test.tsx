import type { PropsWithChildren } from "react";

import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import AuthProvider, { useAuth } from "./AuthContext";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  refetch: vi.fn(),
  session: vi.fn(),
  sync: vi.fn(),
}));
vi.mock("next-auth/react", () => ({
  SessionProvider: ({ children }: PropsWithChildren) => children,
  useSession: mocks.session,
}));
vi.mock("@apollo/client", async (original) => ({ ...(await original<object>()), useQuery: mocks.query }));
vi.mock("~/lib/apollo/client", () => ({ syncApolloSession: mocks.sync }));
const wrapper = ({ children }: PropsWithChildren) => <AuthProvider>{children}</AuthProvider>;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
  mocks.session.mockReturnValue({ data: { user: { id: "current" } }, status: "authenticated" });
  mocks.query.mockReturnValue({
    data: { users_by_pk: { id: "current", status: "active" } },
    loading: false,
    refetch: mocks.refetch,
  });
});
afterEach(() => vi.unstubAllGlobals());

it("does not replace an existing profile with a loading state during background refresh", () => {
  mocks.query.mockReturnValue({
    data: { users_by_pk: { id: "current", status: "active" } },
    loading: true,
    refetch: mocks.refetch,
  });
  const { result } = renderHook(useAuth, { wrapper });
  expect(result.current.isLoading).toBe(false);
  expect(result.current.profile?.id).toBe("current");
});
it("does not expose a cached profile after sign-out", async () => {
  mocks.session.mockReturnValue({ data: null, status: "unauthenticated" });
  const { result } = renderHook(useAuth, { wrapper });
  expect(result.current.profile).toBeNull();
  expect(result.current.isLoading).toBe(false);
  await result.current.refetchProfile();
  expect(mocks.refetch).not.toHaveBeenCalled();
  expect(mocks.sync).toHaveBeenCalledWith(null);
});
it("does not mix the previous account's profile into a new session", () => {
  mocks.query.mockReturnValue({
    data: { users_by_pk: { id: "previous", role: "admin" } },
    loading: true,
    refetch: mocks.refetch,
  });
  const { result } = renderHook(useAuth, { wrapper });
  expect(result.current.profile).toBeNull();
  expect(result.current.isLoading).toBe(true);
});
