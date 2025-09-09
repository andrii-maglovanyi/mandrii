import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./Separator";

describe("Separator", () => {
  it("renders text when provided", () => {
    render(<Separator text="OR" />);
    expect(screen.getByText("OR")).toBeInTheDocument();
  });

  it("applies full variant by default", () => {
    render(<Separator text="Default" />);
    const element = screen.getByTestId("separator");
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(element).toHaveClass("w-full");
  });

  it("applies margin variant", () => {
    render(<Separator text="Margin" variant="margin" />);
    const element = screen.getByTestId("separator");
    expect(screen.getByText("Margin")).toBeInTheDocument();
    expect(element).toHaveClass("w-[80%]");
  });

  it("applies tight variant", () => {
    render(<Separator text="Tight" variant="tight" />);
    const element = screen.getByTestId("separator");
    expect(screen.getByText("Tight")).toBeInTheDocument();
    expect(element).toHaveClass("w-fit");
  });

  it("does not render text span if text is not provided", () => {
    render(<Separator />);
    expect(screen.queryByText(/.+/)).toBeNull();
  });
});
