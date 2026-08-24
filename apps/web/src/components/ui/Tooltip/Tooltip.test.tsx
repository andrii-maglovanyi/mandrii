import { render, screen, within } from "@testing-library/react";
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

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
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

    expect(tooltip).toHaveClass("opacity-100");
    expect(tooltip).toHaveTextContent("Tooltip text");
  });

  it("has correct aria-describedby link", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip label="Tooltip text">
        <button>Hover me</button>
      </Tooltip>,
    );

    const target = screen.getByRole("button", { name: "Hover me" });
    await user.tab();

    const tooltip = screen.getByRole("tooltip");
    const id = target.getAttribute("aria-describedby");

    expect(tooltip.id).toBe(id);
  });

  it("portals a tooltip into its dialog so it remains above the native backdrop", async () => {
    const user = userEvent.setup();
    render(
      <dialog open>
        <Tooltip label="Close modal" position="left">
          <button>Close</button>
        </Tooltip>
      </dialog>,
    );

    await user.hover(screen.getByRole("button", { name: "Close" }));

    expect(within(screen.getByRole("dialog")).getByRole("tooltip", { name: "Close modal" })).toBeInTheDocument();
  });
});
