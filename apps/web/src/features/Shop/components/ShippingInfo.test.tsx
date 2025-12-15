import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ShippingInfo } from "./ShippingInfo";

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
