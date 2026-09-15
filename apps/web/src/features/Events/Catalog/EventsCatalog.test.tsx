import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { EventsCatalog } from "./EventsCatalog";

const { events, mediaQuery } = vi.hoisted(() => ({
  events: Array.from({ length: 25 }, (_, index) => ({
    id: String(index),
    start_date: "2099-01-01T12:00:00Z",
    title_en: `Event ${index}`,
  })),
  mediaQuery: vi.fn(),
}));
const translate = (key: string) => key;
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => translate }));
vi.mock("react-responsive", () => ({ useMediaQuery: (options: unknown) => mediaQuery(options) }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock("~/hooks/useEventDiscovery", () => ({
  useEventDiscovery: ({limit, offset}: {limit: number; offset: number}) => ({ count: events.length, data: events.slice(offset, offset + limit), loading: false }),
}));
vi.mock("~/components/ui", () => ({
  ActionButton: () => null,
  AnimatedEllipsis: () => null,
  RichText: ({ children }: any) => <div>{children}</div>,
  Pagination: ({ index, onPaginate }: any) => <button onClick={() => onPaginate(index + 1)}>More</button>,
}));
vi.mock("./EventsCatalogFilter", () => ({ EventsCatalogFilter: () => null }));
vi.mock("~/features/Discovery/LocationResultsFallback", () => ({ LocationResultsFallback: () => null }));
vi.mock("../EventCard/EventsListCard", () => ({
  EventsListCard: ({ event }: any) => <article>{event.title_en}</article>,
}));
vi.mock("../EventCard/EventsMasonryCard", () => ({
  EventsMasonryCard: ({ event }: any) => <article>{event.title_en}</article>,
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

it("retains earlier events when infinite scroll advances on mobile", async () => {
  mediaQuery.mockReturnValue(true);
  const user = userEvent.setup();
  render(<EventsCatalog />);
  expect(screen.getAllByRole("article")).toHaveLength(12);
  await user.click(screen.getByRole("button", { name: "More" }));
  expect(screen.getAllByRole("article")).toHaveLength(24);
  expect(screen.getByText("Event 0")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "More" }));
  expect(screen.getAllByRole("article")).toHaveLength(25);
});

it("replaces the page when numbered pagination advances on desktop", async () => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  mediaQuery.mockReturnValue(false);
  const user = userEvent.setup();
  render(<EventsCatalog />);
  await user.click(screen.getByRole("button", { name: "More" }));
  expect(screen.getAllByRole("article")).toHaveLength(12);
  expect(screen.queryByText("Event 0")).not.toBeInTheDocument();
  expect(screen.getByText("Event 12")).toBeInTheDocument();
});
