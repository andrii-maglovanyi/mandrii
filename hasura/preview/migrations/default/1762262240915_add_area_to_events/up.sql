-- Add area column to events table for searchable location keywords
ALTER TABLE public.events ADD COLUMN area TEXT;

COMMENT ON COLUMN public.events.area IS 'Searchable location details (auto-populated from geocoding, similar to venues.area)';
