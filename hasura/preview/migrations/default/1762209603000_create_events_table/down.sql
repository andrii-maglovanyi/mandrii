-- Drop trigger
DROP TRIGGER IF EXISTS set_public_events_updated_at ON public.events;

-- Drop events table (will cascade delete related records)
DROP TABLE IF EXISTS public.events;
