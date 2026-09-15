import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Pagination } from "./Pagination";

const viewport = vi.hoisted(() => ({ width: 768 }));
vi.mock("react-responsive", () => ({
  useMediaQuery: ({ query }: { query: string }) => viewport.width <= Number(query.match(/max-width: (\d+)px/)?.[1]),
}));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (key: string) => key }));
vi.mock("./InfiniteScroll", () => ({ InfiniteScroll: () => <div>Infinite scrolling</div> }));
vi.mock("./NumberedPagination", () => ({ NumberedPagination: () => <div>Numbered pages</div> }));

it.each([767, 768, 900])("selects pagination matching the CSS breakpoint at %ipx", (width) => {
  viewport.width = width;
  render(<Pagination count={3} index={1} onPaginate={vi.fn()} />);
  expect(screen.getByText(width < 768 ? "Infinite scrolling" : "Numbered pages")).toBeInTheDocument();
  expect(screen.queryByText(width < 768 ? "Numbered pages" : "Infinite scrolling")).not.toBeInTheDocument();
});
