import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Checkbox } from "../Checkbox/Checkbox";
import { Dropdown } from "./Dropdown";

describe("Dropdown", () => {
  it("keeps interactive content available while open and closes on Escape", async () => {
    render(
      <Dropdown aria-label="Manage alerts" label="Manage alerts">
        <Checkbox label="Venue updates" />
      </Dropdown>,
    );

    const trigger = screen.getByRole("button", { name: "Manage alerts" });
    await userEvent.click(trigger);

    expect(screen.getByRole("dialog", { name: "Manage alerts" })).toBeVisible();
    expect(screen.getByRole("checkbox", { name: "Venue updates" })).toBeVisible();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Manage alerts" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes when the user clicks outside", async () => {
    render(
      <>
        <Dropdown aria-label="Manage alerts" label="Manage alerts">
          Alert controls
        </Dropdown>
        <button type="button">Elsewhere</button>
      </>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Manage alerts" }));
    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(screen.queryByRole("dialog", { name: "Manage alerts" })).not.toBeInTheDocument();
  });
});
