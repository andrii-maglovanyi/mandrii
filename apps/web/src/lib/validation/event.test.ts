import { describe, expect, it, vi } from "vitest";

import { Event_Status_Enum, Event_Type_Enum, getEventSchema, Price_Type_Enum } from "./event";

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
        title: "Ukrainian Cultural Night",
        slug: "ukrainian-cultural-night-2025",
        start_date: new Date("2025-12-01T19:00:00Z"),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Kyiv Community Center",
        price_type: Price_Type_Enum.FREE,
        price_currency: "EUR",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts valid event with custom location", () => {
      const validEvent = {
        title: "Community Gathering",
        slug: "community-gathering-nov-2025",
        start_date: "2025-11-15T18:00:00Z",
        event_type: Event_Type_Enum.CELEBRATION,
        custom_location_name: "Central Park",
        custom_location_address: "123 Park Ave, New York",
        city: "New York",
        country: "USA",
        organizer_name: "Community Organizers",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts valid online event", () => {
      const validEvent = {
        title: "Online Workshop",
        slug: "online-workshop-2025",
        start_date: new Date("2025-11-20T14:00:00Z"),
        event_type: Event_Type_Enum.WORKSHOP,
        is_online: true,
        organizer_name: "Online Educators",
        price_type: Price_Type_Enum.PAID,
        price_amount: 25.0,
        price_currency: "USD",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts event with end date", () => {
      const validEvent = {
        title: "Weekend Festival",
        slug: "weekend-festival-2025",
        start_date: new Date("2025-12-05T10:00:00Z"),
        end_date: new Date("2025-12-07T22:00:00Z"),
        event_type: Event_Type_Enum.FESTIVAL,
        custom_location_name: "Festival Grounds",
        organizer_name: "Festival Organizers",
        price_type: Price_Type_Enum.PAID,
        price_amount: 50.0,
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("accepts event with all optional fields", () => {
      const validEvent = {
        title: "Comprehensive Event",
        slug: "comprehensive-event-2025",
        description_en: "An amazing event with all details",
        description_uk: "Чудова подія з усіма деталями",
        start_date: new Date("2025-12-10T19:00:00Z"),
        end_date: new Date("2025-12-10T23:00:00Z"),
        event_type: Event_Type_Enum.CONCERT,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        city: "Kyiv",
        country: "Ukraine",
        latitude: 50.4501,
        longitude: 30.5234,
        organizer_name: "Concert Hall",
        organizer_contact: "info@concerthall.ua",
        price_type: Price_Type_Enum.PAID,
        price_amount: 30.0,
        price_currency: "EUR",
        registration_url: "https://tickets.example.com",
        registration_required: true,
        external_url: "https://event.example.com",
        language: ["uk", "en"],
        capacity: 500,
        age_restriction: "18+",
        accessibility_info: "Wheelchair accessible",
        facebook: "https://facebook.com/event",
        instagram: "https://instagram.com/event",
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });

  describe("validation errors", () => {
    it("rejects event without title", () => {
      const invalidEvent = {
        slug: "test-event",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid slug format", () => {
      const invalidEvent = {
        title: "Test Event",
        slug: "Invalid Slug With Spaces",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with end date before start date", () => {
      const invalidEvent = {
        title: "Invalid Date Event",
        slug: "invalid-date-event",
        start_date: new Date("2025-12-10T19:00:00Z"),
        end_date: new Date("2025-12-09T19:00:00Z"), // Before start
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event without any location", () => {
      const invalidEvent = {
        title: "No Location Event",
        slug: "no-location-event",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects paid event without price amount", () => {
      const invalidEvent = {
        title: "Paid Event No Price",
        slug: "paid-event-no-price",
        start_date: new Date(),
        event_type: Event_Type_Enum.CONCERT,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.PAID,
        // Missing price_amount
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects suggested donation event without price amount", () => {
      const invalidEvent = {
        title: "Donation Event",
        slug: "donation-event",
        start_date: new Date(),
        event_type: Event_Type_Enum.CHARITY,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.SUGGESTED_DONATION,
        // Missing price_amount
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid latitude", () => {
      const invalidEvent = {
        title: "Invalid Coordinates",
        slug: "invalid-coordinates",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        latitude: 100, // Invalid latitude
        longitude: 30,
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid longitude", () => {
      const invalidEvent = {
        title: "Invalid Coordinates",
        slug: "invalid-coordinates-2",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        latitude: 50,
        longitude: 200, // Invalid longitude
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid Facebook URL", () => {
      const invalidEvent = {
        title: "Invalid Social",
        slug: "invalid-social",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
        facebook: "https://twitter.com/not-facebook",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid Instagram URL", () => {
      const invalidEvent = {
        title: "Invalid Social",
        slug: "invalid-social-2",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
        instagram: "https://facebook.com/not-instagram",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });

    it("rejects event with invalid registration URL", () => {
      const invalidEvent = {
        title: "Invalid URL",
        slug: "invalid-url",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
        registration_url: "not-a-valid-url",
      };

      const result = schema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe("enum validation", () => {
    it("accepts all valid event types", () => {
      Object.values(Event_Type_Enum).forEach((eventType) => {
        const validEvent = {
          title: "Test Event",
          slug: "test-event",
          start_date: new Date(),
          event_type: eventType,
          venue_id: "550e8400-e29b-41d4-a716-446655440000",
          organizer_name: "Test",
          price_type: Price_Type_Enum.FREE,
        };

        const result = schema.safeParse(validEvent);
        expect(result.success).toBe(true);
      });
    });

    it("accepts all valid price types", () => {
      Object.values(Price_Type_Enum).forEach((priceType) => {
        const validEvent = {
          title: "Test Event",
          slug: "test-event",
          start_date: new Date(),
          event_type: Event_Type_Enum.GATHERING,
          venue_id: "550e8400-e29b-41d4-a716-446655440000",
          organizer_name: "Test",
          price_type: priceType,
          // Add price_amount for PAID and SUGGESTED_DONATION
          ...(priceType === Price_Type_Enum.PAID || priceType === Price_Type_Enum.SUGGESTED_DONATION
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
        title: "Test Event",
        slug: "test-event",
        start_date: "2025-12-01T19:00:00Z",
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("coerces string numbers to numbers for coordinates", () => {
      const validEvent = {
        title: "Test Event",
        slug: "test-event",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        venue_id: "550e8400-e29b-41d4-a716-446655440000",
        latitude: "50.4501",
        longitude: "30.5234",
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it("coerces boolean strings for is_online", () => {
      const validEvent = {
        title: "Test Event",
        slug: "test-event",
        start_date: new Date(),
        event_type: Event_Type_Enum.GATHERING,
        is_online: "true" as unknown as boolean,
        organizer_name: "Test",
        price_type: Price_Type_Enum.FREE,
      };

      const result = schema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });
  });
});
