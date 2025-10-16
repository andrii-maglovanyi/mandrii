import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnimatedEllipsis } from "./AnimatedEllipsis";

describe("AnimatedEllipsis", () => {
  it("renders with default props", () => {
    render(<AnimatedEllipsis />);

    const ellipsis = screen.getAllByText("•");

    expect(ellipsis).toHaveLength(3);
  });

  it("renders with custom element", () => {
    render(<AnimatedEllipsis el="★" />);

    const stars = screen.getAllByText("★");

    expect(stars).toHaveLength(3);
    for (const star of stars) {
      expect(star).toBeInTheDocument();
    }
  });

  it("applies correct size classes", () => {
    render(<AnimatedEllipsis data-testid="ellipsis" size="lg" />);

    const ellipsis = screen.getByTestId("ellipsis");

    expect(ellipsis).toHaveClass("text-6xl");
  });

  it("applies medium size class", () => {
    render(<AnimatedEllipsis data-testid="ellipsis" size="md" />);

    const ellipsis = screen.getByTestId("ellipsis");

    expect(ellipsis).toHaveClass("text-4xl");
  });

  it("applies no additional text size for small", () => {
    render(<AnimatedEllipsis data-testid="ellipsis" size="sm" />);

    const ellipsis = screen.getByTestId("ellipsis");

    expect(ellipsis).not.toHaveClass("text-9xl");
    expect(ellipsis).not.toHaveClass("text-4xl");
  });

  it("renders three animated spans with bounce animation", () => {
    render(<AnimatedEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId("ellipsis");
    const animatedSpans = within(ellipsis).getAllByText("\u2022");

    expect(animatedSpans).toHaveLength(3);
  });

  it("applies correct animation delays", () => {
    render(<AnimatedEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId("ellipsis");
    const animatedSpans = within(ellipsis).getAllByText("\u2022");

    expect(animatedSpans[0]).toHaveClass("[animation-delay:-0.3s]");
    expect(animatedSpans[1]).toHaveClass("[animation-delay:-0.15s]");
    expect(animatedSpans[2]).not.toHaveClass("[animation-delay:-0.3s]");
    expect(animatedSpans[2]).not.toHaveClass("[animation-delay:-0.15s]");
  });

  it("renders inline when not centered", () => {
    render(<AnimatedEllipsis centered={false} data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId("ellipsis");

    expect(ellipsis.tagName).toBe("SPAN");
    expect(ellipsis).not.toHaveClass("flex");
    expect(ellipsis).not.toHaveClass("items-center");
    expect(ellipsis).not.toHaveClass("justify-center");
  });

  it("renders with centering wrapper when centered", () => {
    render(<AnimatedEllipsis centered={true} data-testid="ellipsis" />);

    const wrapper = screen.getByTestId("ellipsis");

    expect(wrapper).toHaveClass("inline-flex");
    expect(wrapper).toHaveClass("items-center");
    expect(wrapper).toHaveClass("justify-center");
    expect(wrapper).toHaveClass("w-full");
    expect(wrapper).toHaveClass("h-full");
    expect(wrapper).toHaveClass("min-h-screen");
  });

  it("contains ellipsis inside centering wrapper when centered", () => {
    render(<AnimatedEllipsis centered={true} data-testid="ellipsis" />);

    const wrapper = screen.getByTestId("ellipsis");
    const ellipsisElements = screen.getAllByText("•");

    expect(wrapper).toBeInTheDocument();
    expect(ellipsisElements).toHaveLength(3);
    for (const el of ellipsisElements) {
      expect(wrapper).toContainElement(el);
    }
  });

  it("supports custom data-testid", () => {
    render(<AnimatedEllipsis data-testid="my-ellipsis" />);

    expect(screen.getByTestId("my-ellipsis")).toBeInTheDocument();
  });

  it("works with different characters and centering", () => {
    render(<AnimatedEllipsis centered={true} data-testid="ellipsis" el="." size="lg" />);

    const wrapper = screen.getByTestId("ellipsis");
    const dots = screen.getAllByText(".");

    expect(dots).toHaveLength(3);
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass("text-6xl");
  });

  it("has accessible structure", () => {
    render(<AnimatedEllipsis data-testid="ellipsis" />);

    const ellipsis = screen.getByTestId("ellipsis");

    expect(ellipsis).toBeInTheDocument();
    expect(ellipsis).toHaveAttribute("data-testid", "ellipsis");
  });

  it("renders correct element type based on centered prop", () => {
    const { rerender } = render(<AnimatedEllipsis centered={false} data-testid="ellipsis" />);

    let element = screen.getByTestId("ellipsis");
    expect(element.tagName).toBe("SPAN");

    rerender(<AnimatedEllipsis centered={true} data-testid="ellipsis" />);

    element = screen.getByTestId("ellipsis");
    expect(element.tagName).toBe("DIV");
  });
});
