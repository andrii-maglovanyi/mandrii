# Test Events GraphQL Queries

## Test 1: Query all event types (should work for public)

```graphql
query GetEventTypes {
  event_type {
    value
    description
  }
}
```

## Test 2: Query active events (public should only see ACTIVE)

```graphql
query GetActiveEvents {
  events(where: { status: { _eq: ACTIVE } }, limit: 5) {
    id
    title
    slug
    start_date
    end_date
    event_type
    status
    eventType {
      value
      description
    }
    priceType {
      value
      description
    }
    venue {
      name
      city
    }
  }
}
```

## Test 3: Insert an event (requires authentication)

```graphql
mutation CreateEvent {
  insert_events_one(
    object: {
      title: "Ukrainian Culture Night"
      slug: "ukrainian-culture-night-2025"
      description_en: "An evening celebrating Ukrainian culture with music, food, and art."
      description_uk: "Вечір на честь української культури з музикою, їжею та мистецтвом."
      start_date: "2025-12-15T19:00:00Z"
      end_date: "2025-12-15T23:00:00Z"
      event_type: CELEBRATION
      price_type: FREE
      is_online: false
      organizer_name: "Ukrainian Cultural Center"
      organizer_contact: "info@ucc.org"
    }
  ) {
    id
    title
    status
    created_at
  }
}
```

## Test 4: Query user's own events

```graphql
query GetMyEvents {
  events(where: { user_id: { _eq: "USER_ID_HERE" } }) {
    id
    title
    status
    created_at
  }
}
```

## Test 5: Add tags to an event

```graphql
mutation AddEventTags {
  insert_events_event_tags(
    objects: [{ event_id: "EVENT_ID_HERE", tag_id: "TAG_ID_HERE" }]
  ) {
    affected_rows
    returning {
      event {
        title
      }
      event_tag {
        name
      }
    }
  }
}
```

## Test 6: Query events with tags

```graphql
query GetEventsWithTags {
  events(limit: 10) {
    id
    title
    start_date
    events_event_tags {
      event_tag {
        name
        slug
        category
      }
    }
  }
}
```

## Test 7: Query event_tags

```graphql
query GetAllTags {
  event_tags {
    id
    name
    slug
    category
  }
}
```

## Test 8: Query venue's events

```graphql
query GetVenueEvents($venueId: uuid!) {
  venues_by_pk(id: $venueId) {
    name
    events {
      id
      title
      start_date
      status
    }
  }
}
```
