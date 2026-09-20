/* Test anchors simulate client navigation without a router. */
/* eslint-disable @next/next/no-html-link-for-pages */
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import { MobileLayout } from "./MobileLayout";

vi.mock("~/i18n/navigation", () => ({ Link: "a" }));
const route = vi.hoisted(() => ({ pathname: "/en/venues" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
beforeEach(() => { route.pathname = "/en/venues"; });
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (key: string) => key }));
vi.mock("../../Auth/MobileAuth", () => ({ MobileAuth: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock("../../CartButton/CartButton", () => ({ CartButton: () => null }));
vi.mock("../../LanguageToggle/LanguageToggle", () => ({ LanguageToggle: () => null }));
vi.mock("../../LoveButton/LoveButton", () => ({ LoveButton: () => null }));
vi.mock("../../ThemeToggle/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("../Logo", () => ({ Logo: () => null }));

it("keeps closed navigation inert and restores scrolling and focus after Escape", () => {
  const { unmount } = render(<MobileLayout navLinks={<a href="/en/venues">Venues</a>} />);
  const toggle = screen.getByTestId("mobile-menu-toggle");
  // The inert boundary is the element referenced by aria-controls.
  // eslint-disable-next-line testing-library/no-node-access
  const menu = document.getElementById(toggle.getAttribute("aria-controls")!)!;
  expect(menu).toHaveAttribute("inert");
  fireEvent.click(toggle);
  expect(menu).not.toHaveAttribute("inert");
  expect(document.body.style.overflow).toBe("hidden");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
  expect(menu).toHaveAttribute("inert");
  expect(document.body.style.overflow).toBe("");
  fireEvent.click(toggle);
  unmount();
  expect(document.body.style.overflow).toBe("");
});

it("closes on the current page even when client navigation prevents the default click", () => {
  render(<MobileLayout navLinks={<a href="/en/venues" onClick={(event) => event.preventDefault()}>Venues</a>} />);
  const toggle = screen.getByTestId("mobile-menu-toggle");
  fireEvent.click(toggle);
  fireEvent.click(screen.getByRole("link", { name: "Venues" }));
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});

it("does not reopen an old menu when browser history returns to its route", () => {
  const { rerender } = render(<MobileLayout navLinks={<a href="/en/venues">Venues</a>} />);
  const toggle = screen.getByTestId("mobile-menu-toggle");
  fireEvent.click(toggle);
  route.pathname = "/en/events";
  rerender(<MobileLayout navLinks={<a href="/en/venues">Venues</a>} />);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  route.pathname = "/en/venues";
  rerender(<MobileLayout navLinks={<a href="/en/venues">Venues</a>} />);
  expect(toggle).toHaveAttribute("aria-expanded", "false");
});
