import { fireEvent, render, screen } from "@testing-library/react";
import { type AnchorHTMLAttributes, type MouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("~/i18n/navigation", () => ({
  Link: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props} />,
}));

import { Card } from "./Card";

describe("Card", () => {
  it("uses an accessible, locale-aware link overlay and preserves link analytics", () => {
    const onLinkClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
    render(
      <Card href="/venues/example" linkLabel="Example venue" onLinkClick={onLinkClick}>
        <p>Example venue</p>
      </Card>,
    );

    const link = screen.getByRole("link", { name: "Example venue" });
    expect(link).toHaveAttribute("href", "/venues/example");

    fireEvent.click(link);
    expect(onLinkClick).toHaveBeenCalledOnce();
  });
});
