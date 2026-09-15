import { ApolloClient, ApolloLink, ApolloProvider, InMemoryCache, Observable } from "@apollo/client";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { expect, it, vi } from "vitest";

import { useEventDiscovery } from "./useEventDiscovery";

it("loads schedules once and requests full content only for each visible page", async () => {
  const schedules = Array.from({ length: 30 }, (_, index) => ({
    __typename: "events", id: String(index), start_date: `2099-01-${String(index + 1).padStart(2, "0")}T12:00:00Z`,
    end_date: null, is_recurring: false, recurrence_rule: null,
  }));
  const request = vi.fn();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink((operation) => new Observable((observer) => {
      request(operation.operationName, operation.variables);
      const ids: string[] = operation.variables.where?._and?.[1]?.id?._in ?? [];
      observer.next({ data: { events: operation.operationName === "GetPublicEventSchedules" ? schedules : schedules.filter(({ id }) => ids.includes(id)).map((schedule) => ({
        ...schedule,
        description_en: null, description_uk: null, type: "GATHERING", price_type: "FREE", price_amount: null,
        price_currency: "GBP", is_online: false, external_url: null, custom_location_address: null,
        custom_location_name: null, area: null, city: "London", country: "United Kingdom", geo: null,
        images: [], registration_url: null, registration_required: false, capacity: null, age_restriction: null,
        language: [], accessibility_info: null, social_links: null, status: "ACTIVE", created_at: "2026-01-01T12:00:00Z",
        organizer_name: null, organizer_phone_number: null, organizer_email: null, owner_id: null,
        venue_id: null, user_id: null, venue: null,
        title_en: schedule.id, title_uk: schedule.id, slug: schedule.id,
      })) } });
      observer.complete();
    })),
  });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const where = { city: { _eq: "London" } };
  const { result, rerender } = renderHook(({ offset }) => useEventDiscovery({ where, limit: 12, offset }), {
    initialProps: { offset: 0 }, wrapper,
  });
  await waitFor(() => expect(result.current.data).toHaveLength(12));
  expect(result.current.count).toBe(30);
  expect(request.mock.calls.filter(([name]) => name === "GetPublicEventSchedules")).toHaveLength(1);
  expect(request.mock.calls.find(([name]) => name === "GetPublicEvents")?.[1].limit).toBe(12);
  act(() => rerender({ offset: 12 }));
  await waitFor(() => expect(result.current.data[0]?.id).toBe("12"));
  expect(result.current.data).toHaveLength(12);
  expect(request.mock.calls.filter(([name]) => name === "GetPublicEventSchedules")).toHaveLength(1);
  expect(request.mock.calls.filter(([name]) => name === "GetPublicEvents")).toHaveLength(2);
  client.stop();
});

it("does not issue a query until location or other required input is ready", () => {
  const request = vi.fn();
  const client = new ApolloClient({ cache: new InMemoryCache(), link: new ApolloLink(request) });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  const { result } = renderHook(() => useEventDiscovery({ limit: 3, skip: true }), { wrapper });
  expect(request).not.toHaveBeenCalled();
  expect(result.current.data).toEqual([]);
  client.stop();
});
