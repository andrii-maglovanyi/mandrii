import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders an accessible switch with its label", () => {
    render(<Switch label="Email alerts" />);

    expect(screen.getByRole("switch", { name: "Email alerts" })).not.toBeChecked();
  });

  it("reports changes from the native checkbox", async () => {
    const onChange = vi.fn();
    const ControlledSwitch = () => {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          checked={checked}
          label="Email alerts"
          onChange={(event) => {
            onChange(event.target.checked);
            setChecked(event.target.checked);
          }}
        />
      );
    };
    render(<ControlledSwitch />);

    await userEvent.click(screen.getByRole("switch", { name: "Email alerts" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch", { name: "Email alerts" })).toBeChecked();
  });

  it("supports checked, disabled, and descriptive states", () => {
    render(<Switch checked description="Get alerts in your inbox." disabled label="Email alerts" />);

    expect(screen.getByRole("switch", { name: /Email alerts/ })).toBeChecked();
    expect(screen.getByRole("switch", { name: /Email alerts/ })).toBeDisabled();
    expect(screen.getByText("Get alerts in your inbox.")).toBeInTheDocument();
  });
});
