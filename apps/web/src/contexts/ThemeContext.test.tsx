import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";

import { ThemeProvider } from "./ThemeContext";

vi.mock("~/lib/mixpanel", () => ({ sendToMixpanel: vi.fn() }));
it("renders page content on the server before client theme initialization", () => {
  expect(
    renderToString(
      <ThemeProvider initialIsDark>
        <main>Visible content</main>
      </ThemeProvider>,
    ),
  ).toContain("Visible content");
});
