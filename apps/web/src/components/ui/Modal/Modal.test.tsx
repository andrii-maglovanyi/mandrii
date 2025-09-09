import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal";

describe("Modal", () => {
  beforeAll(() => {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
      };
    }

    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function () {
        this.open = false;
      };
    }
  });

  it("renders modal with title and content when open", () => {
    render(
      <Modal isOpen title="Test Modal">
        <p>Modal content here</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content here")).toBeInTheDocument();
  });

  it("does not render modal when isOpen is false", () => {
    render(
      <Modal title="Hidden Modal">
        <p>Should not be visible</p>
      </Modal>,
    );

    // Not rendered in DOM at all
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onClose when clicking the close button", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Close Test">
        <p>Closing test</p>
      </Modal>,
    );

    const closeButton = screen.getByTestId("close-modal");
    await userEvent.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Escape Modal">
        <p>Escape test</p>
      </Modal>,
    );

    await userEvent.keyboard("{Escape}");

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it("calls onClose when clicking on backdrop", async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose} title="Backdrop Modal">
        <p>Backdrop test</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    await userEvent.click(dialog); // simulate backdrop click

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
