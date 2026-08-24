DROP TRIGGER IF EXISTS events_award_points_on_publication ON public.events;
DROP TRIGGER IF EXISTS venues_award_points_on_publication ON public.venues;

DROP FUNCTION IF EXISTS public.award_event_publication_points();
DROP FUNCTION IF EXISTS public.award_venue_publication_points();
DROP FUNCTION IF EXISTS public.award_contribution_points(uuid, text, uuid, integer);

ALTER TABLE public.user_point_events
DROP CONSTRAINT user_point_events_activity_check;

UPDATE public.user_point_events
SET activity = CASE activity
  WHEN 'VENUE_PUBLISHED' THEN 'VENUE_CREATED'
  WHEN 'EVENT_PUBLISHED' THEN 'EVENT_CREATED'
  ELSE activity
END;

ALTER TABLE public.user_point_events
ADD CONSTRAINT user_point_events_activity_check
CHECK (activity IN ('VENUE_CREATED', 'EVENT_CREATED'));
