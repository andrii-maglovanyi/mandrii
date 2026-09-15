import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

import { useMediaQuery } from "./useMediaQuery";

afterEach(() => vi.restoreAllMocks());
it("uses the explicit server default before client hydration", () => {
  function View() {
    return <span>{useMediaQuery({ defaultMatches: true, query: "(max-width: 1279px)" }) ? "mobile" : "desktop"}</span>;
  }
  expect(renderToString(<View />)).toContain("mobile");
});
it("updates when the viewport changes and removes its listener", () => {
  const media = { addEventListener: vi.fn(), matches: false, removeEventListener: vi.fn() };
  vi.spyOn(window, "matchMedia").mockReturnValue(media as unknown as MediaQueryList);
  const { result, unmount } = renderHook(() => useMediaQuery({ query: "(max-width: 767px)" }));
  expect(result.current).toBe(false);
  act(() => {
    media.matches = true;
    media.addEventListener.mock.calls[0][1]();
  });
  expect(result.current).toBe(true);
  unmount();
  expect(media.removeEventListener).toHaveBeenCalledOnce();
});
