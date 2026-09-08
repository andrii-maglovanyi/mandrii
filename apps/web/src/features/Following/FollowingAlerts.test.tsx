import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import { FollowingAlerts } from "./FollowingAlerts";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("~/hooks/useNotifications", () => ({
  useNotifications: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
}));

vi.mock("~/i18n/useI18n", () => ({
  useI18n: () => (key: string) => key,
}));

vi.mock("~/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("./FollowAreaButton", () => ({
  FollowAreaButton: () => <button type="button">Follow new area</button>,
}));

describe("FollowingAlerts", () => {
  it("links delivery preferences to their account Settings home", () => {
    render(<FollowingAlerts initialAlerts={[]} initialSubscriptions={[]} />);

    expect(screen.getByRole("link", { name: "Manage notification delivery" })).toHaveAttribute(
      "href",
      "/user-profile/settings#content-alert-delivery",
    );
  });
});
