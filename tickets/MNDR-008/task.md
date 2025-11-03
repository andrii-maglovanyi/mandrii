# MNDR-008: Add Events Database Schema & Hasura Setup# [TICKET-ID]: [Ticket Title]



**Status**: 🟡 In Progress  **Linear Ticket**: [Link to Linear ticket]  

**Created**: November 3, 2025  **Branch**: `[TICKET-ID]_description`  

**Branch**: `MNDR-008_add-events-database-schema`**Started**: [Date]  

**Status**: In Progress

---

---

## Ticket Summary

## Ticket Description

Implement the complete database schema and Hasura configuration for the Events feature. This includes creating all necessary tables, enums, relationships, and permissions to support event management on mandrii.com.

[Copy the ticket description from Linear]

### Background

## Acceptance Criteria

The Events feature will allow users to create and discover Ukrainian community events. Events can be:

- **Venue-based**: Events at existing venues in the directory- [ ] [Criterion 1]

- **Custom location**: One-off events at specific addresses- [ ] [Criterion 2]

- **Online**: Virtual events with no physical location- [ ] [Criterion 3]



Events will support:---

- Multilingual content (English/Ukrainian)

- Rich metadata (type, pricing, capacity, accessibility)## Implementation Plan

- Flexible tagging for discovery

- Recurring event patterns### 1. Analysis & Research

- User ownership and moderation workflow

- [ ] Read and understand relevant code

---- [ ] Identify files that need to be modified

- [ ] Research any unknown technologies/patterns

## Implementation Tasks- [ ] Review related documentation



### Phase 1: Database Schema Creation### 2. Implementation Tasks



- [ ] **Create `event_type` enum table**- [ ] [Specific task 1]

  - [ ] Define enum values (GATHERING, CELEBRATION, CONCERT, etc.)- [ ] [Specific task 2]

  - [ ] Add descriptions for each type- [ ] [Specific task 3]

  - [ ] Create Hasura migration files (up/down)

### 3. Testing

- [ ] **Create `event_status` enum table**

  - [ ] Define status values (DRAFT, PENDING, ACTIVE, CANCELLED, etc.)- [ ] Write/update unit tests

  - [ ] Add descriptions- [ ] Write/update E2E tests (if applicable)

  - [ ] Create Hasura migration files- [ ] Manual testing

- [ ] Test edge cases

- [ ] **Create `price_type` enum table**

  - [ ] Define pricing types (FREE, PAID, DONATION, SUGGESTED_DONATION)### 4. Code Quality

  - [ ] Add descriptions

  - [ ] Create Hasura migration files- [ ] TypeScript compilation passes

- [ ] ESLint/Stylelint passes

- [ ] **Create `events` main table**- [ ] Prettier formatting applied

  - [ ] Core fields: id, title, slug, descriptions (en/uk)- [ ] Code review self-check

  - [ ] Date fields: start_date, end_date

  - [ ] Location fields: venue_id, custom_location_name, custom_location_address, geo, city, country, is_online### 5. Documentation

  - [ ] Media fields: image, images array

  - [ ] Organizer fields: organizer_name, organizer_contact- [ ] Update relevant documentation

  - [ ] Pricing fields: price_type, price_amount, price_currency- [ ] Add code comments where needed

  - [ ] Registration fields: registration_url, registration_required, external_url- [ ] Update TASK.md if needed

  - [ ] Metadata: social_links (jsonb), language array, capacity, age_restriction, accessibility_info

  - [ ] Recurring: is_recurring, recurrence_rule---

  - [ ] Admin fields: status, created_at, updated_at, user_id, owner_id

  - [ ] Foreign keys: venue_id → venues, user_id → users, owner_id → users## Files to Modify

  - [ ] Create Hasura migration files

- `path/to/file1.ts` - [Description of changes]

- [ ] **Create `event_tags` table**- `path/to/file2.tsx` - [Description of changes]

  - [ ] Fields: id, name, slug, category

  - [ ] Unique constraints on name and slug---

  - [ ] Create Hasura migration files

## Technical Approach

- [ ] **Create `events_event_tags` junction table**

  - [ ] Fields: event_id, tag_id[Describe your approach to solving this ticket]

  - [ ] Composite primary key

  - [ ] Foreign keys to events and event_tags---

  - [ ] Create Hasura migration files

## Discovered During Work

- [ ] **Add `events_created` counter to `users` table**

  - [ ] Add integer column with default 0[Add any new tasks or issues discovered while working on this ticket]

  - [ ] Create migration to alter users table

---

### Phase 2: Hasura Relationships Configuration

## Completion Checklist

- [ ] **Configure `events` table relationships**

  - [ ] Object relationship: `venue` (events → venues via venue_id)- [ ] All implementation tasks complete

  - [ ] Object relationship: `user` (events → users via user_id)- [ ] All tests passing

  - [ ] Object relationship: `owner` (events → users via owner_id)- [ ] Code formatted and linted

  - [ ] Object relationship: `event_type` (events → event_type via event_type)- [ ] Documentation updated

  - [ ] Object relationship: `event_status` (events → event_status via status)- [ ] Knowledge preserved (move key learnings to `docs/ticket-learnings.md`)

  - [ ] Object relationship: `price_type` (events → price_type via price_type)- [ ] Architectural decisions documented (move to main `DECISIONS.md` if applicable)

  - [ ] Array relationship: `event_tags` (events → events_event_tags → event_tags)- [ ] Main `TASK.md` updated

- [ ] Ready to create pull request

- [ ] **Configure `users` table relationships**
  - [ ] Array relationship: `events` (users → events via user_id)
  - [ ] Array relationship: `owned_events` (users → events via owner_id)

- [ ] **Configure `venues` table relationships**
  - [ ] Array relationship: `events` (venues → events via venue_id)

- [ ] **Configure `event_tags` table relationships**
  - [ ] Array relationship: `events` (event_tags → events_event_tags → events)

### Phase 3: Hasura Permissions

- [ ] **Configure `events` table permissions**
  - [ ] **Public role (SELECT)**:
    - Filter: `status: { _eq: ACTIVE }`
    - Columns: All except user_id, owner_id
    - Allow aggregations: true
  - [ ] **User role (SELECT)**:
    - Filter: `_or: [{ status: { _eq: ACTIVE }}, { user_id: { _eq: X-Hasura-User-Id }}]`
    - Columns: All
    - Allow aggregations: true
  - [ ] **User role (INSERT)**:
    - Check: `{}`
    - Columns: All except id, created_at, updated_at, status
    - Set: `user_id: X-Hasura-User-Id, status: PENDING`
  - [ ] **User role (UPDATE)**:
    - Filter: `user_id: { _eq: X-Hasura-User-Id }`
    - Columns: All except id, created_at, updated_at, status, user_id

- [ ] **Configure enum tables permissions**
  - [ ] Public role: SELECT all rows, all columns
  - [ ] User role: SELECT all rows, all columns

- [ ] **Configure `event_tags` permissions**
  - [ ] Public role: SELECT all rows, all columns
  - [ ] User role: SELECT all rows, all columns

- [ ] **Configure `events_event_tags` permissions**
  - [ ] Public role: SELECT with event filter
  - [ ] User role: INSERT/DELETE for owned events

### Phase 4: Metadata Configuration

- [ ] **Update Hasura metadata files**
  - [ ] Add all tables to `tables.yaml`
  - [ ] Create individual table YAML files for each new table
  - [ ] Configure computed fields (if needed)
  - [ ] Configure event handlers (if needed)

- [ ] **Apply metadata to both environments**
  - [ ] Preview environment: `hasura/preview/metadata/`
  - [ ] Production environment: `hasura/production/metadata/`

### Phase 5: Testing & Validation

- [ ] **Test enum tables**
  - [ ] Verify all enum values are inserted
  - [ ] Test public access to enum tables
  - [ ] Verify descriptions are present

- [ ] **Test events table**
  - [ ] Test INSERT as authenticated user
  - [ ] Verify status defaults to PENDING
  - [ ] Verify user_id is auto-set
  - [ ] Test all field types (text, jsonb, arrays, geography)
  - [ ] Test foreign key constraints

- [ ] **Test relationships**
  - [ ] Query event with venue details
  - [ ] Query event with creator details
  - [ ] Query event with tags
  - [ ] Query user's created events
  - [ ] Query venue's events

- [ ] **Test permissions**
  - [ ] Verify public can only see ACTIVE events
  - [ ] Verify users can see their own DRAFT/PENDING events
  - [ ] Verify users can insert events
  - [ ] Verify users can only update their own events
  - [ ] Verify users cannot change status directly

- [ ] **Test edge cases**
  - [ ] Event with venue_id (venue-based)
  - [ ] Event with custom location (no venue)
  - [ ] Online event (is_online = true)
  - [ ] Event with no images
  - [ ] Event with tags
  - [ ] Free event vs paid event
  - [ ] Recurring event with RRULE

---

## Database Schema Reference

### Events Table Structure

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_uk TEXT,
  
  -- Date/Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  
  -- Event Type
  event_type event_type_enum NOT NULL,
  
  -- Location (flexible - one of three options)
  venue_id UUID REFERENCES venues(id),
  custom_location_name TEXT,
  custom_location_address TEXT,
  geo GEOGRAPHY(POINT, 4326),
  city TEXT,
  country TEXT,
  is_online BOOLEAN DEFAULT false,
  
  -- Media
  image TEXT,
  images TEXT[],
  
  -- Organizer
  organizer_name TEXT NOT NULL,
  organizer_contact TEXT,
  
  -- Pricing
  price_type price_type_enum NOT NULL,
  price_amount NUMERIC(10,2),
  price_currency TEXT DEFAULT 'EUR',
  
  -- Registration
  registration_url TEXT,
  registration_required BOOLEAN DEFAULT false,
  external_url TEXT,
  
  -- Social & Metadata
  social_links JSONB DEFAULT '{}',
  language TEXT[],
  capacity INTEGER,
  age_restriction TEXT,
  accessibility_info TEXT,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  
  -- Admin
  status event_status_enum NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) NOT NULL,
  owner_id UUID REFERENCES users(id)
);

CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_venue_id ON events(venue_id);
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_geo ON events USING GIST(geo);
```

### Enum Values

**event_type_enum**: GATHERING, CELEBRATION, CONCERT, WORKSHOP, EXHIBITION, FESTIVAL, CONFERENCE, THEATER, SCREENING, SPORTS, CHARITY, OTHER

**event_status_enum**: DRAFT, PENDING, ACTIVE, CANCELLED, POSTPONED, COMPLETED, ARCHIVED

**price_type_enum**: FREE, PAID, DONATION, SUGGESTED_DONATION

---

## Files Modified/Created

### Hasura Migration Files (Preview)
- `hasura/preview/migrations/default/[timestamp]_create_event_type_enum/up.sql`
- `hasura/preview/migrations/default/[timestamp]_create_event_type_enum/down.sql`
- `hasura/preview/migrations/default/[timestamp]_create_event_status_enum/up.sql`
- `hasura/preview/migrations/default/[timestamp]_create_event_status_enum/down.sql`
- `hasura/preview/migrations/default/[timestamp]_create_price_type_enum/up.sql`
- `hasura/preview/migrations/default/[timestamp]_create_price_type_enum/down.sql`
- `hasura/preview/migrations/default/[timestamp]_create_events_table/up.sql`
- `hasura/preview/migrations/default/[timestamp]_create_events_table/down.sql`
- `hasura/preview/migrations/default/[timestamp]_create_event_tags_table/up.sql`
- `hasura/preview/migrations/default/[timestamp]_create_event_tags_table/down.sql`
- `hasura/preview/migrations/default/[timestamp]_create_events_event_tags_junction/up.sql`
- `hasura/preview/migrations/default/[timestamp]_create_events_event_tags_junction/down.sql`
- `hasura/preview/migrations/default/[timestamp]_alter_users_add_events_created/up.sql`
- `hasura/preview/migrations/default/[timestamp]_alter_users_add_events_created/down.sql`

### Hasura Migration Files (Production)
- Mirror all preview migrations in `hasura/production/migrations/default/`

### Hasura Metadata Files (Preview)
- `hasura/preview/metadata/databases/default/tables/public_events.yaml`
- `hasura/preview/metadata/databases/default/tables/public_event_type.yaml`
- `hasura/preview/metadata/databases/default/tables/public_event_status.yaml`
- `hasura/preview/metadata/databases/default/tables/public_price_type.yaml`
- `hasura/preview/metadata/databases/default/tables/public_event_tags.yaml`
- `hasura/preview/metadata/databases/default/tables/public_events_event_tags.yaml`
- `hasura/preview/metadata/databases/default/tables/tables.yaml` (updated)
- `hasura/preview/metadata/databases/default/tables/public_users.yaml` (updated)
- `hasura/preview/metadata/databases/default/tables/public_venues.yaml` (updated)

### Hasura Metadata Files (Production)
- Mirror all preview metadata in `hasura/production/metadata/`

---

## Success Criteria

- [ ] All database tables created successfully in Hasura
- [ ] All enum tables populated with initial values
- [ ] All relationships configured and tested
- [ ] All permissions configured correctly (public and user roles)
- [ ] Can create an event via GraphQL API as authenticated user
- [ ] Event defaults to PENDING status
- [ ] Public users can only query ACTIVE events
- [ ] Users can query their own events regardless of status
- [ ] All three event location types work (venue, custom, online)
- [ ] GraphQL schema regenerated with new event types
- [ ] Metadata applied to both preview and production environments

---

## Notes

- This ticket focuses ONLY on database schema and Hasura configuration
- No frontend components or validation schemas in this ticket
- Migration files should be reversible (proper down.sql)
- Test all permissions thoroughly before moving to next ticket
- Document any issues or learnings in `tickets/MNDR-008/notes.md`
- Use Hasura Console to generate migrations when possible
- Follow existing migration patterns from venue setup

---

## Next Tickets

After completing this ticket:
- **MNDR-009**: Event validation schemas & TypeScript types
- **MNDR-010**: Event creation form & API routes
- **MNDR-011**: Public events listing & filtering
- **MNDR-012**: Event details page
- **MNDR-013**: User events management
- **MNDR-014**: Admin event moderation
