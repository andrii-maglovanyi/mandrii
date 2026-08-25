import { render, screen } from "@testing-library/react";
import { Check } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its label with the selected semantic variant", () => {
    render(<Badge variant="success">Active</Badge>);

    expect(screen.getByText("Active")).toHaveClass("bg-green-600/75");
  });

  it("renders an accessible icon-only badge", () => {
    render(<Badge aria-label="Active" icon={<Check />} iconOnly variant="success" />);

    expect(screen.getByLabelText("Active")).toHaveClass("h-7", "w-7");
  });
});
