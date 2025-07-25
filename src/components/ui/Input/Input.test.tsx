import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("renders with label and placeholder", () => {
    render(<Input label="Email" placeholder="your@email.com" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "placeholder",
      "your@email.com",
    );
  });

  it("calls onChange when user types", async () => {
    const handleChange = vi.fn();
    render(<Input label="Username" onChange={handleChange} />);
    const input = screen.getByLabelText("Username");
    await userEvent.type(input, "testuser");
    expect(handleChange).toHaveBeenCalled();
  });

  it("disables the input when disabled=true", () => {
    render(<Input disabled label="Disabled" />);
    const input = screen.getByLabelText("Disabled");
    expect(input).toBeDisabled();
  });

  it("shows an asterisk if required", () => {
    render(<Input label="First name" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays an error message and adds red border", () => {
    render(<Input error="Invalid email" label="Email" />);
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    const input = screen.getByLabelText("Email");
    expect(input).toHaveClass("border-red-500");
  });

  it("sets the input type correctly", () => {
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
  });
});
