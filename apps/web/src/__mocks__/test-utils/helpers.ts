/**
 * Test Helper Functions
 *
 * Common helper functions and utilities for tests.
 */

import React from "react";

// ============================================================================
// UI Component Mocks (for vi.mock)
// ============================================================================

/**
 * Mock for CheckoutForm component.
 */
export function createCheckoutFormMock() {
  return () => ({
    CheckoutForm: () => React.createElement("div", { "data-testid": "checkout-form" }, "Checkout Form"),
  });
}

/**
 * Creates minimal UI component mocks (Button only).
 * Use when you only need basic button functionality.
 */
export function createMinimalUIComponentMocks() {
  return async () => {
    const actual = await import("~/components/ui");
    return {
      ...actual,
      Button: ({
        children,
        disabled,
        onClick,
        type,
      }: {
        children: React.ReactNode;
        disabled?: boolean;
        onClick?: () => void;
        type?: "button" | "submit";
      }) => React.createElement("button", { disabled, onClick, type: type ?? "button" }, children),
    };
  };
}

// ============================================================================
// Shop Component Mocks
// ============================================================================

/**
 * Mock for ShippingInfo and related exports.
 */
export function createShippingInfoMock() {
  return () => ({
    EU_SHIPPING_COST_MINOR: 899,
    FREE_SHIPPING_THRESHOLD_MINOR: 7000,
    ROW_SHIPPING_COST_MINOR: 1499,
    ShippingInfo: ({ compact }: { compact?: boolean }) =>
      React.createElement("div", { "data-testid": "shipping-info" }, compact ? "Compact shipping" : "Full shipping"),
    UK_SHIPPING_COST_MINOR: 399,
  });
}

/**
 * Mock for Stripe Elements wrapper.
 */
export function createStripeElementsMock() {
  return () => ({
    Elements: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "stripe-elements" }, children),
  });
}

/**
 * Creates mock implementations for common UI components.
 * Use with vi.mock("~/components/ui", mockUIComponents);
 */
export function createUIComponentMocks() {
  return async () => {
    const actual = await import("~/components/ui");
    return {
      ...actual,
      AnimatedEllipsis: () => React.createElement("span", { "data-testid": "animated-ellipsis" }, "Loading..."),
      Breadcrumbs: ({ items }: { items: Array<{ title: string; url?: string }> }) =>
        React.createElement(
          "nav",
          { "data-testid": "breadcrumbs" },
          items.map((item, i) => React.createElement("span", { key: i }, item.title)),
        ),
      Button: ({
        children,
        disabled,
        onClick,
        type,
      }: {
        children: React.ReactNode;
        disabled?: boolean;
        onClick?: () => void;
        type?: "button" | "submit";
      }) => React.createElement("button", { disabled, onClick, type: type ?? "button" }, children),
      Card: ({ children, className, href }: { children: React.ReactNode; className?: string; href?: string }) =>
        React.createElement("a", { className, "data-testid": "product-card", href }, children),
      EmptyState: ({ body, heading }: { body: string; heading: string; icon?: React.ReactNode }) =>
        React.createElement(
          "div",
          { "data-testid": "empty-state" },
          React.createElement("h2", null, heading),
          React.createElement("p", null, body),
        ),
      FallbackImage: ({ alt, src }: { alt: string; src: string }) => React.createElement("img", { alt, src }),
      ImageCarousel: ({ images }: { autoPlay?: boolean; images: string[]; showDots?: boolean }) =>
        React.createElement(
          "div",
          { "data-testid": "image-carousel" },
          images.map((img, i) => React.createElement("img", { alt: `Product ${i + 1}`, key: i, src: img })),
        ),
      Input: ({
        disabled,
        onChange,
        placeholder,
        value,
      }: {
        disabled?: boolean;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        placeholder?: string;
        value: string;
      }) => React.createElement("input", { disabled, onChange, placeholder, value }),
      Pagination: ({
        count,
        index,
        onPaginate,
      }: {
        count: number;
        index: number;
        loading?: boolean;
        nextText: string;
        onPaginate: (page: number) => void;
        prevText: string;
      }) =>
        React.createElement(
          "div",
          { "data-testid": "pagination" },
          React.createElement("span", null, `Page ${index} of ${count}`),
          React.createElement("button", { disabled: index <= 1, onClick: () => onPaginate(index - 1) }, "Prev"),
          React.createElement("button", { disabled: index >= count, onClick: () => onPaginate(index + 1) }, "Next"),
        ),
      TabPane: ({ children, tab }: { children: React.ReactNode; tab: string }) =>
        React.createElement("div", { "data-testid": `tab-${tab}` }, children),
      Tabs: ({ children }: { children: React.ReactNode; defaultActiveKey: string }) =>
        React.createElement("div", { "data-testid": "tabs" }, children),
    };
  };
}
