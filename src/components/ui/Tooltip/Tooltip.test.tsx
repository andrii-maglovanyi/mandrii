import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("renders child and does not show tooltip initially", () => {
    render(
      <Tooltip label="Tooltip text">
        <span>Hover me</span>
      </Tooltip>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Tooltip text");
    expect(tooltip).toHaveClass("opacity-0");
  });

  it("shows tooltip on hover", async () => {
    render(
      <Tooltip label="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText("Hover me");
    await userEvent.hover(trigger);

    const tooltip = screen.getByRole("tooltip");

    // becomes visible (Tailwind uses opacity transitions)
    expect(tooltip).toHaveClass("group-hover:opacity-100");
    expect(tooltip).toHaveTextContent("Tooltip text");
  });

  it("has correct aria-describedby link", () => {
    render(
      <Tooltip label="Tooltip text">
        <span>Hover me</span>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip");
    const target = screen.getByTestId(/target-*/);
    const id = target.getAttribute("aria-describedby");

    expect(tooltip.id).toBe(id);
  });
});
