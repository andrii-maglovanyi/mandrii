import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ColorVariant } from "~/types";

import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders with default variant (error)", () => {
    render(<Alert>Something went wrong</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });

  it("renders with each variant", () => {
    const variants: ColorVariant[] = ["error", "info", "success", "warning"];

    for (const variant of variants) {
      render(<Alert variant={variant}>This is a {variant}</Alert>);
      expect(screen.getByText(`This is a ${variant}`)).toBeInTheDocument();
    }
  });

  it("dismisses the alert when dismiss button is clicked", async () => {
    render(<Alert>Dismiss me</Alert>);
    const button = screen.getByRole("button", { name: /dismiss alert/i });
    await userEvent.click(button);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onDismiss callback when alert is dismissed", async () => {
    const onDismiss = vi.fn();
    render(<Alert onDismiss={onDismiss}>With callback</Alert>);
    const button = screen.getByRole("button", { name: /dismiss alert/i });
    await userEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not render after being dismissed", async () => {
    render(<Alert>To disappear</Alert>);
    const button = screen.getByRole("button", { name: /dismiss alert/i });
    await userEvent.click(button);
    expect(screen.queryByText("To disappear")).not.toBeInTheDocument();
  });
});
