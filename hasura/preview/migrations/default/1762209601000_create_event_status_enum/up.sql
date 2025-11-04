-- Create event_status enum
CREATE TYPE public.event_status_enum AS ENUM (
  'DRAFT',
  'PENDING',
  'ACTIVE',
  'CANCELLED',
  'POSTPONED',
  'COMPLETED',
  'ARCHIVED'
);

-- Create event_status table for descriptions (optional, for UI)
CREATE TABLE public.event_status (
  value TEXT PRIMARY KEY,
  description TEXT
);

-- Insert event status values
INSERT INTO public.event_status (value, description) VALUES
  ('DRAFT', 'Draft event not yet submitted'),
  ('PENDING', 'Awaiting moderation approval'),
  ('ACTIVE', 'Published and visible to public'),
  ('CANCELLED', 'Event has been cancelled'),
  ('POSTPONED', 'Event has been postponed to new date'),
  ('COMPLETED', 'Event has already occurred'),
  ('ARCHIVED', 'Event is archived and hidden');
