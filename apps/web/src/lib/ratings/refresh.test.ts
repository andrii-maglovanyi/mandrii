import { afterEach, describe, expect, it, vi } from "vitest";

import { publishRatingRefresh, ratingRefreshKey, subscribeToRatingRefresh } from "./refresh";

describe("rating refresh", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses a stable, content-specific key", () => {
    expect(ratingRefreshKey("venue", "abc")).toBe("venue:abc");
    expect(ratingRefreshKey("event", "abc")).toBe("event:abc");
  });

  it("notifies another tab through BroadcastChannel", () => {
    const postMessage = vi.fn();
    const close = vi.fn();
    vi.stubGlobal(
      "BroadcastChannel",
      class {
        addEventListener = vi.fn();
        close = close;
        postMessage = postMessage;
        removeEventListener = vi.fn();
      },
    );

    publishRatingRefresh("venue", "abc");

    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ key: "venue:abc" }));
    expect(close).toHaveBeenCalled();
  });

  it("refreshes only the matching target", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const refresh = vi.fn();
    const unsubscribe = subscribeToRatingRefresh("event", "abc", refresh);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "mandrii-rating-refresh",
        newValue: JSON.stringify({ id: "a", key: "venue:abc" }),
      }),
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "mandrii-rating-refresh",
        newValue: JSON.stringify({ id: "b", key: "event:abc" }),
      }),
    );

    expect(refresh).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("refreshes this tab when BroadcastChannel is unavailable", () => {
    vi.stubGlobal("BroadcastChannel", undefined);
    const refresh = vi.fn();
    const unsubscribe = subscribeToRatingRefresh("venue", "abc", refresh);

    publishRatingRefresh("venue", "abc");

    expect(refresh).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
