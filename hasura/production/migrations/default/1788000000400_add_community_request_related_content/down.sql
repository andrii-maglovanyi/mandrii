DROP INDEX IF EXISTS public.community_requests_event_idx;
DROP INDEX IF EXISTS public.community_requests_venue_idx;

ALTER TABLE public.community_requests
  DROP CONSTRAINT IF EXISTS community_requests_one_related_content,
  DROP COLUMN IF EXISTS event_id,
  DROP COLUMN IF EXISTS venue_id;
