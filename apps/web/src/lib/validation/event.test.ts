import { describe, expect, it } from "vitest";

import { Event_Type_Enum, getEventSchema, Price_Type_Enum } from "./event";

// Mock i18n function
const mockI18n = (key: string, params?: Record<string, unknown>): string => {
  let result = key;
  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(`{${param}}`, String(value));
    });
  }
  return result;
};

describe("getEventSchema", () => {
  const schema = getEventSchema(mockI18n as never);

  describe("valid event data", () => {
    it("accepts minimal valid event with venue", () => {
      const validEvent = {
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Kyiv Community Center",
        price_currency: "EUR",
        price_type: Price_Type_Enum.Free,
        slug: "ukrainian-cultural-night-2025",
        start_date: new Date("2025-12-01T19:00:00Z"),
        title: "Ukrainian Cultural Night",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts valid event with custom location", () => {
      const validEvent = {
        city: "New York",
        country: "USA",
        custom_location_address: "123 Park Ave, New York",
        custom_location_name: "Central Park",
        event_type: Event_Type_Enum.Celebration,
        organizer_name: "Community Organizers",
        price_type: Price_Type_Enum.Free,
        slug: "community-gathering-nov-2025",
        start_date: "2025-11-15T18:00:00Z",
        title: "Community Gathering",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts valid online event", () => {
      const validEvent = {
        event_type: Event_Type_Enum.Workshop,
        is_online: true,
        organizer_name: "Online Educators",
        price_amount: 25.0,
        price_currency: "USD",
        price_type: Price_Type_Enum.Paid,
        slug: "online-workshop-2025",
        start_date: new Date("2025-11-20T14:00:00Z"),
        title: "Online Workshop",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts event with end date", () => {
      const validEvent = {
        custom_location_name: "Festival Grounds",
        end_date: new Date("2025-12-07T22:00:00Z"),
        event_type: Event_Type_Enum.Festival,
        organizer_name: "Festival Organizers",
        price_amount: 50.0,
        price_type: Price_Type_Enum.Paid,
        slug: "weekend-festival-2025",
        start_date: new Date("2025-12-05T10:00:00Z"),
        title: "Weekend Festival",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts event with all optional fields", () => {
      const validEvent = {
        accessibility_info: "Wheelchair accessible",
        age_restriction: "18+",
        capacity: 500,
        city: "Kyiv",
        country: "Ukraine",
        description_en: "An amazing event with all details",
        description_uk: "Чудова подія з усіма деталями",
        end_date: new Date("2025-12-10T23:00:00Z"),
        event_type: Event_Type_Enum.Concert,
        external_url: "https://event.example.com",
        facebook: "https://facebook.com/event",
        instagram: "https://instagram.com/event",
        language: ["uk", "en"],
        latitude: 50.4501,
        longitude: 30.5234,
        organizer_contact: "info@concerthall.ua",
        organizer_name: "Concert Hall",
        price_amount: 30.0,
        price_currency: "EUR",
        price_type: Price_Type_Enum.Paid,
        registration_required: true,
        registration_url: "https://tickets.example.com",
        slug: "comprehensive-event-2025",
        start_date: new Date("2025-12-10T19:00:00Z"),
        title: "Comprehensive Event",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("rejects event without title", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "test-event",
        start_date: new Date(),
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid slug format", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "Invalid Slug With Spaces",
        start_date: new Date(),
        title: "Test Event",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with end date before start date", () => {
      const invalidEvent = {
        end_date: new Date("2025-12-09T19:00:00Z"), // Before start
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "invalid-date-event",
        start_date: new Date("2025-12-10T19:00:00Z"),
        title: "Invalid Date Event",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event without any location", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "no-location-event",
        start_date: new Date(),
        title: "No Location Event",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects paid event without price amount", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Concert,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Paid,
        slug: "paid-event-no-price",
        start_date: new Date(),
        title: "Paid Event No Price",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        // Missing price_amount
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects suggested donation event without price amount", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Charity,
        organizer_name: "Test",
        price_type: Price_Type_Enum.SuggestedDonation,
        slug: "donation-event",
        start_date: new Date(),
        title: "Donation Event",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        // Missing price_amount
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid latitude", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        latitude: 100, // Invalid latitude
        longitude: 30,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "invalid-coordinates",
        start_date: new Date(),
        title: "Invalid Coordinates",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid longitude", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        latitude: 50,
        longitude: 200, // Invalid longitude
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "invalid-coordinates-2",
        start_date: new Date(),
        title: "Invalid Coordinates",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid Facebook URL", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        facebook: "https://twitter.com/not-facebook",
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "invalid-social",
        start_date: new Date(),
        title: "Invalid Social",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid Instagram URL", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        instagram: "https://facebook.com/not-instagram",
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "invalid-social-2",
        start_date: new Date(),
        title: "Invalid Social",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid registration URL", () => {
      const invalidEvent = {
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        registration_url: "not-a-valid-url",
        slug: "invalid-url",
        start_date: new Date(),
        title: "Invalid URL",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("enum validation", () => {
    it("accepts all valid event types", () => {
      Object.values(Event_Type_Enum).forEach((eventType) => {
        const validEvent = {
          event_type: eventType,
          organizer_name: "Test",
          price_type: Price_Type_Enum.Free,
          slug: "test-event",
          start_date: new Date(),
          title: "Test Event",
          venue_id: "550e8400-e29b-41d4-a716-446655440000",
        };

        const result = schema.safeParse(validEvent);
        expect(result.success).toBe(true);
      });
    });

    it("accepts all valid price types", () => {
      Object.values(Price_Type_Enum).forEach((priceType) => {
        const validEvent = {
          event_type: Event_Type_Enum.Gathering,
          organizer_name: "Test",
          price_type: priceType,
          slug: "test-event",
          start_date: new Date(),
          title: "Test Event",
          venue_id: "550e8400-e29b-41d4-a716-446655440000",
          // Add price_amount for PAID and SUGGESTED_DONATION
          ...(priceType === Price_Type_Enum.Paid || priceType === Price_Type_Enum.SuggestedDonation
            ? { price_amount: 10.0 }
            : {}),
        };

        const result = schema.safeParse(validEvent);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("type coercion", () => {
    it("coerces string dates to Date objects", () => {
      const validEvent = {
        event_type: Event_Type_Enum.Gathering,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "test-event",
        start_date: "2025-12-01T19:00:00Z",
        title: "Test Event",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("coerces string numbers to numbers for coordinates", () => {
      const validEvent = {
        event_type: Event_Type_Enum.Gathering,
        latitude: "50.4501",
        longitude: "30.5234",
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "test-event",
        start_date: new Date(),
        title: "Test Event",
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("coerces boolean strings for is_online", () => {
      const validEvent = {
        event_type: Event_Type_Enum.Gathering,
        is_online: "true" as unknown as boolean,
        organizer_name: "Test",
        price_type: Price_Type_Enum.Free,
        slug: "test-event",
        start_date: new Date(),
        title: "Test Event",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });
});
