import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

const { events, venues } = vi.hoisted(() => ({ events: vi.fn(), venues: vi.fn() }));
vi.mock("../Events/Map/EventsMap", () => ({
  EventsMap: () => {
    events();
    return <div>Event map</div>;
  },
}));
vi.mock("../Venues/Map/VenuesMap", () => ({
  VenuesMap: () => {
    venues();
    return <div>Venue map</div>;
  },
}));
vi.mock("~/components/ui", () => ({ AnimatedEllipsis: () => <div>Loading</div> }));
vi.mock("~/i18n/useI18n", () => ({ useI18n: () => (value: string) => value }));
import { MapView } from "./MapView";
beforeEach(() => {
  vi.clearAllMocks();
  window.history.replaceState({}, "", "/en/map");
});
it("does not mount or query venues before opening an event deep link", () => {
  window.history.replaceState({}, "", "/en/map#events");
  render(<MapView />);
  expect(screen.getByText("Event map")).toBeInTheDocument();
  expect(venues).not.toHaveBeenCalled();
});
it("follows hash navigation and handles malformed hashes without crashing", () => {
  render(<MapView />);
  expect(screen.getByText("Venue map")).toBeInTheDocument();
  act(() => {
    window.history.replaceState({}, "", "/en/map#events");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  expect(screen.getByText("Event map")).toBeInTheDocument();
  act(() => {
    window.history.replaceState({}, "", "/en/map#%zz");
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  });
  expect(screen.getByText("Venue map")).toBeInTheDocument();
});

it("names icon-only map switches and exposes the selected view", () => {
  render(<MapView />);
  const venuesButton = screen.getByRole("button", { name: "Venues" });
  const eventsButton = screen.getByRole("button", { name: "Events" });
  expect(venuesButton).toHaveAttribute("aria-pressed", "true");
  expect(eventsButton).toHaveAttribute("aria-pressed", "false");
  fireEvent.click(eventsButton);
  expect(venuesButton).toHaveAttribute("aria-pressed", "false");
  expect(eventsButton).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText("Event map")).toBeInTheDocument();
});
