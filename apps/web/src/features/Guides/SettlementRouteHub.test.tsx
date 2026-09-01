import { render, screen } from "@testing-library/react";
import { type ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CountryCode } from "~/lib/constants/COUNTRIES";

import { SettlementRouteHub } from "./SettlementRouteHub";

let countryCode: "" | CountryCode = "gb";
let isReady = true;

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("~/i18n/useI18n", () => ({
  useI18n: () => (key: string, params?: Record<string, unknown>) => {
    if (!params) return key;

    return Object.entries(params).reduce((result, [name, value]) => result.replace(`{${name}}`, String(value)), key);
  },
}));

vi.mock("~/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: ComponentProps<"a">) => (
    <a href={typeof href === "string" ? href : String(href)} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("./useSettlementCountry", () => ({
  useSettlementCountry: () => ({ countryCode, isReady, selectCountry: vi.fn() }),
}));

describe("SettlementRouteHub", () => {
  beforeEach(() => {
    countryCode = "gb";
    isReady = true;
  });

  it("renders an ordered UK route without pretending unfinished guides are available", () => {
    render(<SettlementRouteHub />);

    expect(screen.getByRole("heading", { name: "Your route for United Kingdom" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Settlement steps" })).toBeInTheDocument();
    expect(screen.getByText("Status and documents")).toBeInTheDocument();
    expect(screen.getAllByText("Guide in preparation")).toHaveLength(8);
    expect(screen.queryByRole("link", { name: "Read guide" })).not.toBeInTheDocument();
  });

  it("keeps local help secondary and scoped to the settlement country", () => {
    render(<SettlementRouteHub />);

    expect(screen.getByRole("link", { name: /Ask the community/ })).toHaveAttribute(
      "href",
      "/community?country=United+Kingdom",
    );
    expect(screen.queryByRole("link", { name: /Explore nearby places/ })).not.toBeInTheDocument();
  });

  it("uses an honest in-progress state for a country without a route", () => {
    countryCode = "nl";
    render(<SettlementRouteHub />);

    expect(screen.getByText("A route for Netherlands is on its way")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Settlement steps" })).not.toBeInTheDocument();
  });

  it("waits for the settlement country before deciding which route to show", () => {
    isReady = false;
    render(<SettlementRouteHub />);

    expect(screen.getByRole("status")).toHaveTextContent("Preparing your settlement route...");
    expect(screen.queryByRole("list", { name: "Settlement steps" })).not.toBeInTheDocument();
  });
});
