import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("escapes markup-like user content before rendering it in a script", () => {
    const { container } = render(<JsonLd data={{ name: "<script>alert('xss')</script>" }} />);

    expect(container.querySelector("script")?.textContent).toContain("\\u003cscript>");
  });
});
