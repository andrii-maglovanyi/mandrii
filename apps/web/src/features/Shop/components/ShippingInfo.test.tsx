import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ShippingInfo } from "./ShippingInfo";

vi.mock("~/i18n/useI18n", () => ({
  useI18n:
    () =>
    (key: string, params: Record<string, unknown> = {}) =>
      key.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? name)),
}));

describe("ShippingInfo", () => {
  it("renders shipping information correctly", () => {
    render(<ShippingInfo />);

    expect(screen.getByText("UK: £3.99")).toBeInTheDocument();
    expect(screen.getByText(/Free shipping on orders over/)).toBeInTheDocument();
    expect(screen.getByText("EU: £8.99 flat rate")).toBeInTheDocument();
    expect(screen.getByText("Tracked post, 5-7 working days.")).toBeInTheDocument();
    expect(screen.getByText("Rest of World: £14.99 flat rate")).toBeInTheDocument();
    expect(screen.getByText("7-14 working days depending on destination.")).toBeInTheDocument();
  });
});
