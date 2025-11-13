# Venue Metadata Architecture

## Overview

Venue-specific information (like opening hours, amenities, accommodation details, etc.) is stored in a flexible `metadata` JSONB column in the `venues` table. This approach allows different venue categories to have completely different metadata structures without requiring separate tables or columns.

## Database Schema

### Table: `venues`

Added column:

```sql
metadata JSONB DEFAULT '{}' NOT NULL
```

With GIN index for efficient querying:

```sql
CREATE INDEX idx_venue_metadata ON public.venues USING gin (metadata);
```

## Metadata Structure

### Common Fields (All Venues)

```typescript
{
  opening_hours: {
    monday: {
      closed: false,
      hours: [
        { open: "09:00", close: "18:00" },
        { open: "19:00", close: "22:00" }  // Multiple time slots per day
      ]
    },
    tuesday: { closed: false, hours: [...] },
    // ... other days
  }
}
```

### Category-Specific Fields

#### ACCOMMODATION

```typescript
{
  opening_hours: {...},
  bedrooms: 3,
  bathrooms: 2,
  max_guests: 6,
  amenities: ["wifi", "kitchen", "washing_machine", "parking"],
  check_in_time: "14:00",
  check_out_time: "11:00",
  minimum_stay_nights: 2
}
```

#### RESTAURANT / CAFE

```typescript
{
  opening_hours: {...},
  cuisine_types: ["ukrainian", "european"],
  seating_capacity: 50,
  price_range: "moderate",
  features: [
    "takeaway",
    "outdoor_seating",
    "vegetarian_options",
    "vegan_options"
  ]
}
```

#### SHOP / GROCERY_STORE

```typescript
{
  opening_hours: {...},
  product_categories: ["groceries", "home_goods"],
  payment_methods: ["cash", "card", "contactless"],
  online_store_url: "https://example.com"
}
```

#### SCHOOL

```typescript
{
  opening_hours: {...},
  age_groups: ["children", "teenagers"],
  languages_taught: ["ukrainian", "english"],
  subjects: ["Mathematics", "Ukrainian Language"],
  class_size_max: 15,
  online_classes_available: true
}
```

#### CULTURAL_CENTRE / LIBRARY

```typescript
{
  opening_hours: {...},
  facilities: ["reading_room", "event_space", "workshop_room"],
  activities: ["language_classes", "cultural_events", "workshops"],
  membership_required: false,
  membership_fee: 0
}
```

#### CHURCH

```typescript
{
  opening_hours: {...},
  denomination: "Ukrainian Orthodox",
  service_times: [
    { day: "Sunday", time: "10:00", language: "ukrainian" }
  ],
  languages: ["ukrainian", "english"],
  activities: ["sunday_school", "choir", "community_events"]
}
```

#### DENTAL_CLINIC / BEAUTY_SALON

```typescript
{
  opening_hours: {...},
  services: ["haircut", "coloring", "manicure"],
  languages_spoken: ["ukrainian", "english"],
  appointment_required: true,
  walk_ins_accepted: false
}
```

## TypeScript Types

All metadata types are defined in `/apps/web/src/types/venue-metadata.ts`:

- `CommonVenueMetadata` - Base type with opening_hours
- `AccommodationMetadata` - Extends common with accommodation-specific fields
- `RestaurantMetadata` - Restaurant/cafe specific
- `ShopMetadata` - Shop specific
- `SchoolMetadata` - Educational institution specific
- `CulturalMetadata` - Cultural centre/library specific
- `ChurchMetadata` - Church specific
- `ClinicMetadata` - Medical/dental clinic specific
- `BeautyMetadata` - Beauty salon specific

Union type: `VenueMetadata` combines all types.

## UI Components

### VenueSchedule Component

Location: `/apps/web/src/features/UserDirectory/Venues/Venue/VenueSchedule.tsx`

**Visibility**: Conditionally shown for categories with operating hours:

- CAFE
- RESTAURANT
- SHOP
- GROCERY_STORE
- LIBRARY
- SCHOOL
- BEAUTY_SALON
- DENTAL_CLINIC
- CULTURAL_CENTRE

Features:

- Accordion per day of week
- Multiple time slots per day (e.g., lunch and dinner hours)
- Mark days as closed
- Visual time slot management with add/remove buttons

Usage in VenueForm:

```tsx
{
  hasOperatingHours && (
    <TabPane tab={i18n("Opening Hours")}>
      <VenueSchedule setValues={setValues} values={values} />
    </TabPane>
  );
}
```

### VenueAccommodationDetails Component

Location: `/apps/web/src/features/UserDirectory/Venues/Venue/VenueAccommodationDetails.tsx`

**Visibility**: Only shown for ACCOMMODATION category

Features:

- **Capacity Section**:
  - Bedrooms (number input)
  - Bathrooms (number input, supports 0.5 increments)
  - Max Guests (number input)
- **Check-in/Check-out Section**:

  - Check-in Time (time picker)
  - Check-out Time (time picker)
  - Minimum Stay in nights (number input)

- **Amenities Section** (multi-select checkboxes):
  - WiFi
  - Kitchen
  - Washing Machine
  - Dryer
  - Air Conditioning
  - Heating
  - Parking
  - TV
  - Workspace
  - Pool
  - Gym
  - Pet Friendly
  - Wheelchair Accessible

Usage in VenueForm:

```tsx
{
  isAccommodation && (
    <TabPane tab={i18n("Accommodation Details")}>
      <VenueAccommodationDetails setValues={setValues} values={values} />
    </TabPane>
  );
}
```

### Future Category-Specific Components

To add metadata forms for other categories:

1. Create component (e.g., `VenueRestaurantDetails.tsx`)
2. Add conditional check in `VenueForm.tsx`:
   ```tsx
   const isRestaurant = values.category === Venue_Category_Enum.Restaurant;
   ```
3. Add conditional TabPane:
   ```tsx
   {
     isRestaurant && (
       <TabPane tab={i18n("Restaurant Details")}>
         <VenueRestaurantDetails setValues={setValues} values={values} />
       </TabPane>
     );
   }
   ```
4. Use TypeScript types from `venue-metadata.ts`

## GraphQL Integration

Metadata is included in venue queries/mutations:

```graphql
query GetVenue($slug: String!) {
  venues(where: { slug: { _eq: $slug } }) {
    id
    name
    metadata # JSONB field
    # ... other fields
  }
}
```

## Benefits of This Approach

1. **Flexibility** - Easy to add new metadata fields without migrations
2. **Category-Specific** - Each venue type has exactly the fields it needs
3. **No Joins** - All venue data in one query
4. **Type-Safe** - TypeScript types ensure correct structure in code
5. **Indexable** - GIN index allows efficient JSON queries if needed
6. **Backward Compatible** - Empty metadata (`{}`) for venues without extra info

## Future Enhancements

1. Add category-specific metadata forms for each venue type
2. Display metadata on venue detail pages
3. Add metadata filtering in venue search (e.g., "amenities includes 'wifi'")
4. Implement metadata validation schemas per category
5. Add metadata migration utilities for bulk updates

## Migration Files

- Preview: `/hasura/preview/migrations/default/1731340800000_alter_table_public_venues_add_column_metadata/`
- Production: `/hasura/production/migrations/default/1731340800000_alter_table_public_venues_add_column_metadata/`

Both include up.sql and down.sql for safe migrations.
