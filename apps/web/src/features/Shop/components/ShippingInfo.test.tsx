import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  EU_SHIPPING_COST_MINOR,
  FREE_SHIPPING_THRESHOLD_MINOR,
  ROW_SHIPPING_COST_MINOR,
  ShippingInfo,
  UK_SHIPPING_COST_MINOR,
} from "./ShippingInfo";

// Mock i18n hook
vi.mock("~/i18n/useI18n", () => ({
  useI18n: () => (key: string) => key,
}));

describe("ShippingInfo", () => {
  describe("constants", () => {
    it("exports correct UK shipping cost", () => {
      expect(UK_SHIPPING_COST_MINOR).toBe(399); // £3.99
    });

    it("exports correct EU shipping cost", () => {
      expect(EU_SHIPPING_COST_MINOR).toBe(899); // £8.99
    });

    it("exports correct rest-of-world shipping cost", () => {
      expect(ROW_SHIPPING_COST_MINOR).toBe(1499); // £14.99
    });

    it("exports correct UK free shipping threshold", () => {
      expect(FREE_SHIPPING_THRESHOLD_MINOR).toBe(7000); // £70.00
    });
  });

  describe("compact mode", () => {
    it("renders compact version when compact prop is true", () => {
      render(<ShippingInfo compact />);

      expect(screen.getByText(/UK: £3.99 flat rate \(free over £70.00\)/)).toBeInTheDocument();
      expect(screen.getByText("EU: £8.99 flat rate")).toBeInTheDocument();
      expect(screen.getByText("Rest of World: £14.99 flat rate")).toBeInTheDocument();
    });

    it("does not render icons in compact mode", () => {
      render(<ShippingInfo compact />);

      // Icons should not be present in compact mode
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });
  });

  describe("full mode", () => {
    it("renders full version by default", () => {
      render(<ShippingInfo />);

      expect(screen.getByText("UK: £3.99")).toBeInTheDocument();
      expect(screen.getByText(/Free shipping on orders over/)).toBeInTheDocument();
      expect(screen.getByText("EU: £8.99 flat rate")).toBeInTheDocument();
      expect(screen.getByText("Tracked post, 5-7 working days.")).toBeInTheDocument();
      expect(screen.getByText("Rest of World: £14.99 flat rate")).toBeInTheDocument();
      expect(screen.getByText("7-14 working days depending on destination.")).toBeInTheDocument();
    });

    it("renders full version when compact is false", () => {
      render(<ShippingInfo compact={false} />);

      expect(screen.getByText("EU: £8.99 flat rate")).toBeInTheDocument();
    });
  });
});
