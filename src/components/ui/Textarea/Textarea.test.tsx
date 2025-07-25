import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders with label and placeholder", () => {
    render(<Textarea label="Message" placeholder="Type your message..." />);
    expect(screen.getByLabelText("Message")).toHaveAttribute(
      "placeholder",
      "Type your message...",
    );
  });

  it("calls onChange when user types", async () => {
    const handleChange = vi.fn();
    render(<Textarea label="Comment" onChange={handleChange} />);
    const textarea = screen.getByLabelText("Comment");
    await userEvent.type(textarea, "Hello world");
    expect(handleChange).toHaveBeenCalled();
  });

  it("disables the textarea when disabled=true", () => {
    render(<Textarea disabled label="Disabled textarea" />);
    const textarea = screen.getByLabelText("Disabled textarea");
    expect(textarea).toBeDisabled();
  });

  it("respects the rows prop", () => {
    render(<Textarea label="Resizable" rows={6} />);
    const textarea = screen.getByLabelText("Resizable");
    expect(textarea).toHaveAttribute("rows", "6");
  });

  it("marks the label with an asterisk if required", () => {
    render(<Textarea label="Required field" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows an error message when error prop is provided", () => {
    render(<Textarea error="This field is required" label="Feedback" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
    const textarea = screen.getByLabelText("Feedback");
    expect(textarea).toHaveClass("border-red-500");
  });

  it("shows character count when maxChars is provided", () => {
    render(<Textarea label="Bio" maxChars={100} value="Hello" />);
    expect(screen.getByText("5 / 100")).toBeInTheDocument();
  });

  it("shows red character count when over the limit", () => {
    const overLimitText = "a".repeat(101);
    render(<Textarea label="Bio" maxChars={100} value={overLimitText} />);
    const counter = screen.getByText("101 / 100");
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveClass("text-red-500");
  });

  it("does not show character count if maxChars is not set", () => {
    render(<Textarea label="No counter" value="text" />);
    expect(screen.queryByText(/\/\s*\d+/)).not.toBeInTheDocument();
  });
});
