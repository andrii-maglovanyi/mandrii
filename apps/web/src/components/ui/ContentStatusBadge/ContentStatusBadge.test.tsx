import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Event_Status_Enum, Venue_Status_Enum } from "~/types";

import { ContentStatusBadge } from "./ContentStatusBadge";

vi.mock("~/i18n/useI18n", () => ({
  useI18n: () => (key: string) => key,
}));

vi.mock("../Tooltip/Tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

describe("ContentStatusBadge", () => {
  it("uses the same label and semantic appearance for shared venue and event statuses", () => {
    const { rerender } = render(<ContentStatusBadge status={Venue_Status_Enum.Active} />);

    expect(screen.getByText("Active")).toHaveClass("bg-green-600/75");

    rerender(<ContentStatusBadge status={Event_Status_Enum.Active} />);

    expect(screen.getByText("Active")).toHaveClass("bg-green-600/75");
  });

  it("provides an accessible compact icon-only presentation", () => {
    render(<ContentStatusBadge appearance="icon" status={Event_Status_Enum.Completed} />);

    expect(screen.getByLabelText("Completed")).toHaveClass("h-7", "w-7");
  });
});
