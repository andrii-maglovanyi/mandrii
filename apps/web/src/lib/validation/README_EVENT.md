# Event Validation & Types

This directory contains validation schemas and TypeScript types for events on mandrii.com.

## Files

- **`event.ts`** - Zod validation schema for event forms
- **`event.test.ts`** - Unit tests for event validation
- **`../types/event.ts`** - TypeScript type definitions and helper functions

## Event Structure

Events on mandrii.com support flexible location handling:

1. **Venue-based events** - Link to existing venue in the database
2. **Custom location events** - One-off locations with custom name/address
3. **Online events** - Virtual events with no physical location
4. **Hybrid events** - Both venue and online

## Event Enums

### Event Types (`Event_Type_Enum`)

- `GATHERING` - Informal gathering or meetup
- `CELEBRATION` - Celebration or party
- `CONCERT` - Music concert or performance
- `WORKSHOP` - Educational workshop or class
- `EXHIBITION` - Art or cultural exhibition
- `FESTIVAL` - Festival or large-scale event
- `CONFERENCE` - Conference or seminar
- `THEATER` - Theater performance
- `SCREENING` - Film or video screening
- `SPORTS` - Sports event or activity
- `CHARITY` - Charity or fundraising event
- `OTHER` - Other type of event

### Price Types (`Price_Type_Enum`)

- `FREE` - Free event with no cost
- `PAID` - Paid event with fixed ticket price (requires `price_amount`)
- `DONATION` - Donation-based event
- `SUGGESTED_DONATION` - Event with suggested donation amount (requires `price_amount`)

### Event Status (`Event_Status_Enum`)

- `DRAFT` - Draft event not yet submitted
- `PENDING` - Awaiting moderation approval
- `ACTIVE` - Published and visible to public
- `CANCELLED` - Event has been cancelled
- `POSTPONED` - Event has been postponed to new date
- `COMPLETED` - Event has already occurred
- `ARCHIVED` - Event is archived and hidden

## Validation Schema

The `getEventSchema` function returns a Zod schema with the following validations:

### Required Fields

- `title` - Event name (1-200 characters)
- `slug` - URL-friendly identifier (10-150 characters, lowercase with hyphens)
- `start_date` - Event start date/time
- `event_type` - Type of event from enum
- `organizer_name` - Name of the organizer (1-200 characters)
- `price_type` - Pricing type from enum

### Location (at least one required)

- `venue_id` - UUID of existing venue, OR
- `custom_location_name` - Custom location name, OR
- `is_online` - Set to true for online events

### Optional Fields

- `description_en` - English description (max 3000 characters)
- `description_uk` - Ukrainian description (max 3000 characters)
- `end_date` - Event end date/time (must be after start_date)
- `custom_location_address` - Address for custom locations
- `city`, `country` - Location details
- `latitude`, `longitude` - Geographic coordinates (-90 to 90, -180 to 180)
- `image` - Main event image (File object)
- `images` - Additional images (max 6)
- `organizer_contact` - Email or phone number
- `price_amount` - Price in specified currency (required for PAID and SUGGESTED_DONATION)
- `price_currency` - 3-letter currency code (default: EUR)
- `registration_url` - URL for event registration
- `registration_required` - Whether registration is required
- `external_url` - External event website
- `language` - Array of language codes (e.g., ['uk', 'en'])
- `capacity` - Maximum number of attendees
- `age_restriction` - Age restrictions (e.g., "18+", "All ages")
- `accessibility_info` - Accessibility information
- `is_recurring` - Whether event repeats
- `recurrence_rule` - iCalendar recurrence rule
- `facebook`, `instagram` - Social media URLs (validated)
- `event_tags` - Array of event tag UUIDs

### Cross-field Validations

1. End date must be after start date
2. At least one location type must be specified
3. Price amount is required for PAID and SUGGESTED_DONATION price types

## Usage Examples

### Basic Event with Venue

```typescript
import { getEventSchema, Event_Type_Enum, Price_Type_Enum } from "~/lib/validation/event";
import { getI18n } from "~/i18n/getI18n";

const i18n = await getI18n();
const schema = getEventSchema(i18n);

const eventData = {
  title: "Ukrainian Cultural Night",
  slug: "ukrainian-cultural-night-2025",
  start_date: new Date("2025-12-01T19:00:00Z"),
  event_type: Event_Type_Enum.GATHERING,
  venue_id: "550e8400-e29b-41d4-a716-446655440000",
  organizer_name: "Kyiv Community Center",
  price_type: Price_Type_Enum.FREE,
};

const result = schema.safeParse(eventData);
if (result.success) {
  // Valid event data
  console.log(result.data);
} else {
  // Validation errors
  console.error(result.error.errors);
}
```

### Custom Location Event

```typescript
const eventData = {
  title: "Community Picnic",
  slug: "community-picnic-summer-2025",
  start_date: new Date("2025-06-15T14:00:00Z"),
  event_type: Event_Type_Enum.GATHERING,
  custom_location_name: "Central Park",
  custom_location_address: "123 Park Ave, New York",
  city: "New York",
  country: "USA",
  organizer_name: "Community Group",
  price_type: Price_Type_Enum.FREE,
};
```

### Online Event

```typescript
const eventData = {
  title: "Online Ukrainian Language Workshop",
  slug: "online-ukrainian-workshop",
  start_date: new Date("2025-11-20T18:00:00Z"),
  event_type: Event_Type_Enum.WORKSHOP,
  is_online: true,
  organizer_name: "Language Academy",
  price_type: Price_Type_Enum.PAID,
  price_amount: 25.0,
  price_currency: "EUR",
  registration_url: "https://academy.example.com/register",
  registration_required: true,
};
```

## TypeScript Types

The `~/types/event.ts` file provides:

### Core Types

- `Event` - Main event interface matching database schema
- `EventWithVenue` - Event with venue relationship
- `EventWithTags` - Event with tags relationship
- `EventWithOwner` - Event with user/owner information
- `EventWithRelations` - Event with all relationships
- `EventCardData` - Minimal data for event cards/lists
- `EventFormData` - Inferred type from validation schema

### Helper Types

- `EventFilters` - Filter options for event queries
- `EventSortBy`, `EventSortOrder` - Sorting options
- `EventLocationType` - Location type classification

### Helper Functions

- `getEventLocationType(event)` - Determine event's location type
- `isEventUpcoming(event)` - Check if event is in the future
- `isEventOngoing(event)` - Check if event is currently happening
- `isEventPast(event)` - Check if event has ended
- `formatEventPrice(event)` - Format event price for display

### UI Labels

- `eventStatusLabels` - Human-readable status labels
- `eventTypeLabels` - Human-readable event type labels
- `priceTypeLabels` - Human-readable price type labels

## Testing

Run tests with:

```bash
pnpm --filter web test event.test.ts
```

Tests cover:

- Valid event data scenarios (venue, custom, online, hybrid)
- All required field validations
- Cross-field validations (end date > start date, location required, price amount for paid events)
- Coordinate validation (latitude/longitude ranges)
- URL validation (social media, registration, external URLs)
- Enum validation (all event types, price types, status values)
- Type coercion (string dates, numbers, booleans)

## Database Schema

Events are stored in the `public.events` table with the following structure:

- **Core**: id, title, slug, description_en, description_uk
- **Date/Time**: start_date, end_date
- **Type**: event_type (enum)
- **Location**: venue_id, custom_location_name, custom_location_address, geo, city, country, is_online
- **Media**: image, images[]
- **Organizer**: organizer_name, organizer_contact
- **Pricing**: price_type (enum), price_amount, price_currency
- **Registration**: registration_url, registration_required, external_url
- **Metadata**: social_links (JSONB), language[], capacity, age_restriction, accessibility_info
- **Recurring**: is_recurring, recurrence_rule
- **Admin**: status (enum), created_at, updated_at, user_id, owner_id

See Hasura migrations for complete schema definition.
