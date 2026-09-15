import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";

import { RichText } from "./RichText";

it.each(["p", "span"] as const)("keeps %s wrappers free of nested paragraph blocks", (as) => {
  const view = renderToString(<RichText as={as}>A **bold** [link](https://example.test)</RichText>);
  expect(view.match(/<p(?:\s|>)/g)?.length ?? 0).toBe(as === "p" ? 1 : 0);
  expect(view).toContain("<strong>bold</strong>");
  expect(view).toContain('href="https://example.test"');
});
it("keeps unsafe markup and URLs inert in inline content", () => {
  const view = renderToString(<RichText as="p">{'<script>alert(1)</script> [bad](javascript:alert)'}</RichText>);
  expect(view).not.toContain("<script>");
  expect(view).not.toContain('href="javascript:');
});
