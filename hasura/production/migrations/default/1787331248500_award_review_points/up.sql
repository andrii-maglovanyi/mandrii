-- Written reviews are a distinct, moderated contribution. Keep the points
-- balance in sync with their public visibility inside the same transaction.
ALTER TABLE public.user_point_events
DROP CONSTRAINT user_point_events_activity_check;

ALTER TABLE public.user_point_events
ADD CONSTRAINT user_point_events_activity_check
CHECK (activity IN ('VENUE_PUBLISHED', 'EVENT_PUBLISHED', 'REVIEW_PUBLISHED'));

CREATE OR REPLACE FUNCTION public.sync_content_review_points()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  removed_point_event record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.review_body IS NOT NULL AND NEW.review_status = 'PUBLISHED' THEN
      PERFORM public.award_contribution_points(NEW.user_id, 'REVIEW_PUBLISHED', NEW.id, 5);
    END IF;
    RETURN NEW;
  END IF;

  IF OLD.review_body IS NULL OR OLD.review_status <> 'PUBLISHED' THEN
    IF NEW.review_body IS NOT NULL AND NEW.review_status = 'PUBLISHED' THEN
      PERFORM public.award_contribution_points(NEW.user_id, 'REVIEW_PUBLISHED', NEW.id, 5);
    END IF;
  ELSIF NEW.review_body IS NULL OR NEW.review_status <> 'PUBLISHED' THEN
    DELETE FROM public.user_point_events
    WHERE activity = 'REVIEW_PUBLISHED' AND source_id = NEW.id
    RETURNING user_id, points INTO removed_point_event;

    IF FOUND THEN
      UPDATE public.users
      SET points = GREATEST(points - removed_point_event.points, 0)
      WHERE id = removed_point_event.user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER content_ratings_sync_review_points
AFTER INSERT OR UPDATE OF review_body, review_status ON public.content_ratings
FOR EACH ROW
EXECUTE FUNCTION public.sync_content_review_points();
