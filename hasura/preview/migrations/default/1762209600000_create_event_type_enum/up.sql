-- Create event_type enum
CREATE TYPE public.event_type_enum AS ENUM (
  'GATHERING',
  'CELEBRATION',
  'CONCERT',
  'WORKSHOP',
  'EXHIBITION',
  'FESTIVAL',
  'CONFERENCE',
  'THEATER',
  'SCREENING',
  'SPORTS',
  'CHARITY',
  'OTHER'
);

-- Create event_type table for descriptions (optional, for UI)
CREATE TABLE public.event_type (
  value TEXT PRIMARY KEY,
  description TEXT
);

-- Insert event type values
INSERT INTO public.event_type (value, description) VALUES
  ('GATHERING', 'Informal gathering or meetup'),
  ('CELEBRATION', 'Celebration or party'),
  ('CONCERT', 'Music concert or performance'),
  ('WORKSHOP', 'Educational workshop or class'),
  ('EXHIBITION', 'Art or cultural exhibition'),
  ('FESTIVAL', 'Festival or large-scale event'),
  ('CONFERENCE', 'Conference or seminar'),
  ('THEATER', 'Theater performance'),
  ('SCREENING', 'Film or video screening'),
  ('SPORTS', 'Sports event or activity'),
  ('CHARITY', 'Charity or fundraising event'),
  ('OTHER', 'Other type of event');
