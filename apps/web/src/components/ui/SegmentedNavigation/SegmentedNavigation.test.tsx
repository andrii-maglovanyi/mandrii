import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

import { SegmentedNavigation } from "./SegmentedNavigation";

describe("SegmentedNavigation", () => {
  it("uses navigation semantics and identifies the current page", () => {
    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <SegmentedNavigation
          ariaLabel="Leaderboard period"
          items={[
            { current: true, href: "/leaderboard", label: "All time" },
            { href: "/leaderboard?period=month", label: "This month" },
          ]}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("navigation", { name: "Leaderboard period" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All time" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "This month" })).not.toHaveAttribute("aria-current");
  });
});
