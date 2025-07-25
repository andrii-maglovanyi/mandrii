import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: "Click me" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
  });

  it("applies correct size class", () => {
    render(<Button size="sm">Small</Button>);

    const button = screen.getByRole("button", { name: "Small" });

    expect(button.className).toMatch(/h-8/);
  });

  it("applies correct variant and color classes", () => {
    render(
      <Button color="primary" variant="outlined">
        Styled
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Styled" });

    expect(button.className).toMatch(/border-primary/);
    expect(button.className).toMatch(/text-primary/);
  });

  it("applies provided `type` attribute", () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByRole("button", { name: "Submit" });

    expect(button).toHaveAttribute("type", "submit");
  });

  it("calls onClick handler", async () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click</Button>);

    const button = screen.getByRole("button", { name: "Click" });
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Disabled" });
    await userEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it("supports custom className", () => {
    render(<Button className="mndr-custom-class">Styled</Button>);

    const button = screen.getByRole("button", { name: "Styled" });

    expect(button).toHaveClass("mndr-custom-class");
  });

  it("respects custom data-testid", () => {
    render(<Button data-testid="my-button">Custom ID</Button>);

    expect(screen.getByTestId("my-button")).toBeInTheDocument();
  });
});
