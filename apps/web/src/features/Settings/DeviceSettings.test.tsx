import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { isDeviceLocationEnabled } from "~/lib/pwa/device-preferences";
import { OFFLINE_ARTICLES_KEY } from "~/lib/pwa/offline-reading";

import { DeviceSettings } from "./DeviceSettings";

const { confirm } = vi.hoisted(() => ({ confirm: vi.fn() }));
vi.mock("~/contexts/DialogContext", () => ({ useDialog: () => ({ openConfirmDialog: confirm }) }));
vi.mock("next-intl", () => ({ useLocale: () => "uk" }));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (key: string) => key }));
vi.mock("~/components/layout/PushNotifications/PushNotifications", () => ({
  PushNotifications: () => <button>Device notification toggle</button>,
}));
vi.mock("~/components/layout/Pwa/PwaProvider", () => ({
  usePwa: () => ({ canInstall: false, installed: false, installing: false, waiting: null }),
}));
beforeEach(() => {
  localStorage.clear();
  confirm.mockReset();
});
it("persists the location switch and exposes device notification and offline controls", () => {
  render(<DeviceSettings />);
  fireEvent.click(screen.getByRole("checkbox", { name: "Allow Find me on this device" }));
  expect(isDeviceLocationEnabled()).toBe(false);
  expect(screen.getByRole("button", { name: "Device notification toggle" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Read saved articles" })).toHaveAttribute("href", "/offline.html?lang=uk");
});
it("removes only saved articles after confirmation", async () => {
  localStorage.setItem(OFFLINE_ARTICLES_KEY, "[]");
  localStorage.setItem("other-setting", "keep");
  confirm.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
  render(<DeviceSettings />);
  fireEvent.click(screen.getByRole("button", { name: "Remove all saved articles" }));
  await waitFor(() => expect(confirm).toHaveBeenCalledOnce());
  expect(localStorage.getItem(OFFLINE_ARTICLES_KEY)).toBe("[]");
  fireEvent.click(screen.getByRole("button", { name: "Remove all saved articles" }));
  await waitFor(() => expect(localStorage.getItem(OFFLINE_ARTICLES_KEY)).toBeNull());
  expect(localStorage.getItem("other-setting")).toBe("keep");
});
