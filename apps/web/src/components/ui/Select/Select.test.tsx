import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "./Select";

const options = [
  { label: "Amsterdam Beauty Studio", value: "amsterdam" },
  { label: "London Community Hall", value: "london" },
];

describe("Select", () => {
  it("filters searchable options and selects a result", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select
        aria-label="Venue"
        onChange={onChange}
        options={options}
        searchable
        searchPlaceholder="Search venues..."
      />,
    );

    await user.click(screen.getByRole("button", { name: "Venue" }));
    const search = screen.getByRole("searchbox", { name: "Venue" });
    await user.type(search, "london");

    expect(screen.queryByRole("option", { name: "Amsterdam Beauty Studio" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "London Community Hall" }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.objectContaining({ value: "london" }) }),
    );
  });

  it("shows an explicit empty search state", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Venue" options={options} searchable searchEmptyLabel="No venues found" />);

    await user.click(screen.getByRole("button", { name: "Venue" }));
    await user.type(screen.getByRole("searchbox", { name: "Venue" }), "Kyiv");

    expect(screen.getByText("No venues found")).toBeInTheDocument();
  });

  it("shows a loading state without disabling the selector", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Venue" loading options={[]} searchable searchEmptyLabel="Loading venues..." />);

    const select = screen.getByRole("button", { name: "Venue" });
    expect(select).not.toBeDisabled();

    await user.click(select);
    expect(screen.getByRole("status")).toHaveTextContent("Loading venues...");
  });
  it("dismisses a searchable menu with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Venue" options={options} searchable />);
    const trigger = screen.getByRole("button", { name: "Venue" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("opens with an arrow key and selects only once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select aria-label="Venue" onChange={onChange} options={options} />);
    const trigger = screen.getByRole("button", { name: "Venue" });
    await user.tab();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.objectContaining({ value: "london" }) }),
    );
    expect(trigger).toHaveFocus();
  });

  it("navigates updated search results and wraps at the current last option", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Venue" options={options} searchable />);
    await user.click(screen.getByRole("button", { name: "Venue" }));
    await user.type(screen.getByRole("searchbox"), "london");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(screen.getByRole("option", { name: "London Community Hall" })).toHaveFocus();
  });

  it("keeps server search results even when the matched field is not the label", async () => {
    const user = userEvent.setup();
    render(<Select aria-label="Venue" onSearchChange={vi.fn()} options={options} searchable />);
    await user.click(screen.getByRole("button", { name: "Venue" }));
    await user.type(screen.getByRole("searchbox"), "community event");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("dismisses a portalled menu when focus leaves it", async () => {
    const user = userEvent.setup();
    render(
      <dialog open>
        <Select aria-label="Venue" options={options} searchable />
        <button>Next field</button>
      </dialog>,
    );
    await user.click(screen.getByRole("button", { name: "Venue" }));
    await user.click(screen.getByRole("button", { name: "Next field" }));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
  it("associates validation errors with the field", () => {
    render(<Select label="Venue" options={options} error="Choose a venue" showErrorMessage />);
    const field = screen.getByRole("button", { name: "Venue" });
    expect(field).toHaveAccessibleDescription("Choose a venue");
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

});
