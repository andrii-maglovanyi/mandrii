import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ActionButton } from "./ActionButton";

const MockIcon = () => <svg data-testid="mock-icon" />;

vi.mock("../Tooltip/Tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("ActionButton", () => {
  it("renders with default props", () => {
    render(<ActionButton aria-label="default button" icon={<MockIcon />} />);
    const button = screen.getByRole("button", { name: "default button" });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("applies correct size class", () => {
    render(
      <ActionButton aria-label="small button" icon={<MockIcon />} size="sm" />,
    );
    const button = screen.getByRole("button", { name: "small button" });
    expect(button).toHaveClass("w-8", "h-8");
  });

  it("applies correct variant and type classes", () => {
    render(
      <ActionButton
        aria-label="ghost primary"
        color="primary"
        icon={<MockIcon />}
        variant="ghost"
      />,
    );
    const button = screen.getByRole("button", { name: "ghost primary" });
    expect(button).toHaveClass("bg-transparent", "text-primary");
  });

  it("triggers onClick handler", async () => {
    const onClick = vi.fn();
    render(
      <ActionButton
        aria-label="click me"
        icon={<MockIcon />}
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button", { name: "click me" });

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onClick if disabled", async () => {
    const onClick = vi.fn();
    render(
      <ActionButton
        aria-label="disabled"
        disabled
        icon={<MockIcon />}
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button", { name: "disabled" });

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it("supports custom className", () => {
    render(
      <ActionButton
        aria-label="with extra class"
        className="md:hidden"
        icon={<MockIcon />}
      />,
    );
    const button = screen.getByRole("button", { name: "with extra class" });
    expect(button).toHaveClass("md:hidden");
  });
});
