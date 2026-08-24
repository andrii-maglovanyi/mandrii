-- Points represent approved community impact. Keep the existing point history
-- intact, but use publication terminology for all future activity. The values
-- match CONTRIBUTION_POINTS in apps/web/src/lib/gamification/community.ts.
ALTER TABLE public.user_point_events
DROP CONSTRAINT user_point_events_activity_check;

UPDATE public.user_point_events
SET activity = CASE activity
  WHEN 'VENUE_CREATED' THEN 'VENUE_PUBLISHED'
  WHEN 'EVENT_CREATED' THEN 'EVENT_PUBLISHED'
  ELSE activity
END;

ALTER TABLE public.user_point_events
ADD CONSTRAINT user_point_events_activity_check
CHECK (activity IN ('VENUE_PUBLISHED', 'EVENT_PUBLISHED'));

CREATE OR REPLACE FUNCTION public.award_contribution_points(
  contribution_user_id uuid,
  contribution_activity text,
  contribution_source_id uuid,
  contribution_points integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  WITH point_event AS (
    INSERT INTO public.user_point_events (user_id, activity, source_id, points)
    VALUES (contribution_user_id, contribution_activity, contribution_source_id, contribution_points)
    ON CONFLICT (activity, source_id) DO NOTHING
    RETURNING user_id, points
  )
  UPDATE public.users AS users
  SET points = users.points + point_event.points
  FROM point_event
  WHERE users.id = point_event.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_venue_publication_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_contribution_points(NEW.user_id, 'VENUE_PUBLISHED', NEW.id, 20);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.award_contribution_points(NEW.user_id, 'VENUE_PUBLISHED', NEW.id, 20);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.award_event_publication_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_contribution_points(NEW.user_id, 'EVENT_PUBLISHED', NEW.id, 15);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.award_contribution_points(NEW.user_id, 'EVENT_PUBLISHED', NEW.id, 15);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER venues_award_points_on_publication
AFTER INSERT OR UPDATE OF status ON public.venues
FOR EACH ROW
WHEN (NEW.status = 'ACTIVE')
EXECUTE FUNCTION public.award_venue_publication_points();

CREATE TRIGGER events_award_points_on_publication
AFTER INSERT OR UPDATE OF status ON public.events
FOR EACH ROW
WHEN (NEW.status = 'ACTIVE')
EXECUTE FUNCTION public.award_event_publication_points();
