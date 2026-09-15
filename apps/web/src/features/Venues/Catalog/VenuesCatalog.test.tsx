import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";

import type { APIParams } from "~/types";

import { VenuesCatalog } from "./VenuesCatalog";

const { query } = vi.hoisted(() => ({
  query: vi.fn((_document: unknown, variables: APIParams) => ({
    count: 40,
    data: Array.from({ length: variables.offset ? 24 : 12 }, (_, index) => ({ id: String(index), name: `Venue ${index}` })),
    loading: false,
  })),
}));
vi.mock("~/hooks/useGraphApi", () => ({ useGraphApi: query }));
vi.mock("~/lib/venues/presentation", () => ({ getVenueData: (venue: unknown) => venue }));
vi.mock("~/hooks/useMediaQuery", () => ({ useMediaQuery: () => true }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("city=London&country=UK") }));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => translate }));
const translate = (key: string, values?: Record<string, unknown>) => key.replace(/\{(\w+)\}/g, (_, name) => String(values?.[name] ?? name));
vi.mock("~/components/ui", () => ({
  ActionButton: () => null,
  AnimatedEllipsis: () => null,
  Pagination: ({ index, onPaginate }: { index: number; onPaginate: (page: number) => void }) => <button onClick={() => onPaginate(index + 1)}>More</button>,
  RichText: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("./VenuesCatalogFilter", () => ({ VenuesCatalogFilter: () => null }));
vi.mock("../VenueCard/VenuesListCard", () => ({ VenuesListCard: ({ venue }: { venue: { name: string } }) => <article>{venue.name}</article> }));
vi.mock("../VenueCard/VenuesMasonryCard", () => ({ VenuesMasonryCard: () => null }));
vi.mock("~/features/Discovery/LocationResultsFallback", () => ({ LocationResultsFallback: () => null }));

it("applies URL filters to the first query and counts all loaded mobile venues", async () => {
  const user = userEvent.setup();
  render(<VenuesCatalog />);
  expect(JSON.stringify(query.mock.calls[0][1].where)).toContain('"city":{"_ilike":"%London%"}');
  expect(JSON.stringify(query.mock.calls[0][1].where)).toContain('"country":{"_eq":"UK"}');
  await user.click(screen.getByRole("button", { name: "More" }));
  expect(screen.getAllByRole("article")).toHaveLength(24);
  expect(screen.getByText("Showing **1**-**24** of **40** items")).toBeInTheDocument();
});
