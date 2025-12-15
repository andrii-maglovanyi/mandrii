import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartButton } from "./CartButton";

// Mock next/navigation with all required exports
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  permanentRedirect: vi.fn(),
  redirect: vi.fn(),
  usePathname: () => "/",
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock cart context
const mockUseCart = vi.fn();
vi.mock("~/contexts/CartContext", () => ({
  useCart: () => mockUseCart(),
}));

describe("CartButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCart.mockReturnValue({ items: [] });
  });

  it("renders cart button with correct aria-label", () => {
    render(<CartButton />);
    const button = screen.getByRole("button", { name: "Shopping bag" });
    expect(button).toBeInTheDocument();
  });

  it("renders with data-testid", () => {
    render(<CartButton />);
    expect(screen.getByTestId("cart-button")).toBeInTheDocument();
  });

  it("does not show badge when cart is empty", () => {
    mockUseCart.mockReturnValue({ items: [] });
    render(<CartButton />);
    expect(screen.queryByTestId("cart-count")).not.toBeInTheDocument();
  });

  it("shows badge with item count when cart has items", () => {
    mockUseCart.mockReturnValue({
      items: [{ id: "1", quantity: 3 }],
    });
    render(<CartButton />);
    const badge = screen.getByTestId("cart-count");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("3");
  });

  it("shows sum of quantities for multiple items", () => {
    mockUseCart.mockReturnValue({
      items: [
        { id: "1", quantity: 2 },
        { id: "2", quantity: 5 },
        { id: "3", quantity: 1 },
      ],
    });
    render(<CartButton />);
    const badge = screen.getByTestId("cart-count");
    expect(badge).toHaveTextContent("8");
  });

  it("shows 99+ when count exceeds 99", () => {
    mockUseCart.mockReturnValue({
      items: [{ id: "1", quantity: 150 }],
    });
    render(<CartButton />);
    const badge = screen.getByTestId("cart-count");
    expect(badge).toHaveTextContent("99+");
  });

  it("shows 99+ when total across items exceeds 99", () => {
    mockUseCart.mockReturnValue({
      items: [
        { id: "1", quantity: 50 },
        { id: "2", quantity: 60 },
      ],
    });
    render(<CartButton />);
    const badge = screen.getByTestId("cart-count");
    expect(badge).toHaveTextContent("99+");
  });

  it("shows exact count at 99", () => {
    mockUseCart.mockReturnValue({
      items: [{ id: "1", quantity: 99 }],
    });
    render(<CartButton />);
    const badge = screen.getByTestId("cart-count");
    expect(badge).toHaveTextContent("99");
  });

  it("navigates to /shop/cart on click", async () => {
    const user = userEvent.setup();
    render(<CartButton />);
    const button = screen.getByRole("button", { name: "Shopping bag" });
    await user.click(button);
    expect(mockPush).toHaveBeenCalledWith("/shop/cart");
  });

  it("calls onClick callback after navigation", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<CartButton onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Shopping bag" });
    await user.click(button);
    expect(mockPush).toHaveBeenCalledWith("/shop/cart");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick if not provided", async () => {
    const user = userEvent.setup();
    render(<CartButton />);
    const button = screen.getByRole("button", { name: "Shopping bag" });
    await user.click(button);
    expect(mockPush).toHaveBeenCalled();
    // No error thrown, navigation still works
  });

  it("updates badge when cart changes", () => {
    const { rerender } = render(<CartButton />);
    expect(screen.queryByTestId("cart-count")).not.toBeInTheDocument();

    // Simulate cart update
    mockUseCart.mockReturnValue({
      items: [{ id: "1", quantity: 5 }],
    });
    rerender(<CartButton />);

    const badge = screen.getByTestId("cart-count");
    expect(badge).toHaveTextContent("5");
  });
});
