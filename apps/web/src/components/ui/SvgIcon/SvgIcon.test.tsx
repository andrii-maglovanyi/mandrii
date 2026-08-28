import { render, screen } from "@testing-library/react";
import { siYoutube } from "simple-icons";
import { describe, expect, it } from "vitest";

import { IconSize, SvgIcon } from "./SvgIcon";

describe("SvgIcon", () => {
  it("renders the matching Simple Icons path", () => {
    render(<SvgIcon data-testid="svg-icon" id="youtube" />);
    const path = screen.getByTestId("svg-icon-presentation");
    expect(path).toHaveAttribute("d", siYoutube.path);
  });

  it("applies default size 'medium'", () => {
    render(<SvgIcon data-testid="svg-icon" id="telegram" />);
    const svg = screen.getByTestId("svg-icon");
    expect(svg).toHaveStyle({
      height: IconSize.medium,
      width: IconSize.medium,
    });
  });

  it("applies size 'large'", () => {
    render(<SvgIcon data-testid="svg-icon" id="instagram" size="large" />);
    const svg = screen.getByTestId("svg-icon");
    expect(svg).toHaveStyle({
      height: IconSize.large,
      width: IconSize.large,
    });
  });

  it("has aria-hidden='true'", () => {
    render(<SvgIcon data-testid="svg-icon" id="buymeacoffee" />);
    const svg = screen.getByTestId("svg-icon");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });
});
