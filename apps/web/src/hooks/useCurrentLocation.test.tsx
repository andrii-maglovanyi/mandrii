import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useCurrentLocation } from "./useCurrentLocation";

const { showError } = vi.hoisted(() => ({ showError: vi.fn() }));
vi.mock("./useNotifications", () => ({ useNotifications: () => ({ showError }) }));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (key: string) => key }));
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
it("requests location only on demand and ignores duplicate taps", () => {
  const getCurrentPosition = vi.fn();
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
  const { result } = renderHook(() => useCurrentLocation());
  const onLocated = vi.fn();
  expect(getCurrentPosition).not.toHaveBeenCalled();
  act(() => {
    result.current.locate(onLocated);
    result.current.locate(onLocated);
  });
  expect(getCurrentPosition).toHaveBeenCalledOnce();
  expect(result.current.locating).toBe(true);
  expect(getCurrentPosition.mock.calls[0][2]).toEqual({
    enableHighAccuracy: false,
    maximumAge: 60_000,
    timeout: 10_000,
  });
  act(() => getCurrentPosition.mock.calls[0][0]({ coords: { latitude: 51, longitude: 0 } }));
  expect(onLocated).toHaveBeenCalledWith({ lat: 51, lng: 0 });
  expect(result.current.locating).toBe(false);
});
it("handles denied permissions and ignores late results after unmount", () => {
  const getCurrentPosition = vi.fn();
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
  const { result, unmount } = renderHook(() => useCurrentLocation());
  const onLocated = vi.fn();
  act(() => result.current.locate(onLocated));
  act(() => getCurrentPosition.mock.calls[0][1]({ code: 1 }));
  expect(showError).toHaveBeenCalledWith("Location access denied. Please enable it in your browser settings.");
  act(() => result.current.locate(onLocated));
  unmount();
  getCurrentPosition.mock.calls[1][0]({ coords: { latitude: 51, longitude: 0 } });
  expect(onLocated).not.toHaveBeenCalled();
});

it("honors the device setting without requesting browser permission", async () => {
  const { setDeviceLocationEnabled } = await import("~/lib/pwa/device-preferences");
  setDeviceLocationEnabled(false);
  try {
    const getCurrentPosition = vi.fn();
    vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
    const { result } = renderHook(() => useCurrentLocation());
    act(() => result.current.locate(vi.fn()));
    expect(getCurrentPosition).not.toHaveBeenCalled();
    expect(showError).toHaveBeenCalledWith("Location is disabled in device settings.");
  } finally {
    setDeviceLocationEnabled(true);
  }
});
