import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { useUnreadMessages } from "./useUnreadMessages";

const { auth, subscription } = vi.hoisted(() => ({
  auth: { data: { user: { id: "a" } } as { user: { id: string } } | null, status: "authenticated" },
  subscription: vi.fn(() => ({ data: undefined })),
}));
vi.mock("next-auth/react", () => ({ useSession: () => auth }));
vi.mock("~/types/graphql.generated", async (original) => ({
  ...(await original<typeof import("~/types/graphql.generated")>()),
  useMessagingUnreadEventsSubscription: subscription,
}));
beforeEach(() => {
  vi.useFakeTimers();
  auth.data = { user: { id: "a" } };
  auth.status = "authenticated";
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const tick = () =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(1_501);
  });

it("shares concurrent unread requests only within the same account", async () => {
  let resolve!: (response: Response) => void;
  const fetch = vi.fn().mockReturnValue(
    new Promise<Response>((done) => {
      resolve = done;
    }),
  );
  vi.stubGlobal("fetch", fetch);
  const { result: firstResult, unmount: unmountFirst } = renderHook(() => useUnreadMessages());
  const { result: secondResult, unmount: unmountSecond } = renderHook(() => useUnreadMessages());
  await tick();
  expect(fetch).toHaveBeenCalledOnce();
  await act(async () => {
    resolve(Response.json({ latest: null, unreadCount: 3 }));
  });
  expect(firstResult.current).toBe(3);
  expect(secondResult.current).toBe(3);
  unmountFirst();
  unmountSecond();
});

it("discards an old account's response after switching accounts", async () => {
  let resolveOld!: (response: Response) => void;
  const fetch = vi
    .fn()
    .mockReturnValueOnce(
      new Promise<Response>((done) => {
        resolveOld = done;
      }),
    )
    .mockResolvedValueOnce(Response.json({ latest: null, unreadCount: 2 }));
  vi.stubGlobal("fetch", fetch);
  const view = renderHook(() => useUnreadMessages());
  await tick();
  auth.data = { user: { id: "b" } };
  view.rerender();
  expect(view.result.current).toBe(0);
  await tick();
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(view.result.current).toBe(2);
  await act(async () => {
    resolveOld(Response.json({ latest: null, unreadCount: 99 }));
  });
  expect(view.result.current).toBe(2);
  auth.data = null;
  auth.status = "unauthenticated";
  view.rerender();
  expect(view.result.current).toBe(0);
  expect(subscription).toHaveBeenLastCalledWith({ skip: true });
  view.unmount();
});

it("does not request unread data for an anonymous visitor", async () => {
  auth.data = null;
  auth.status = "unauthenticated";
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const view = renderHook(() => useUnreadMessages());
  await tick();
  expect(fetch).not.toHaveBeenCalled();
  view.unmount();
});
