DROP TRIGGER IF EXISTS content_ratings_sync_review_points ON public.content_ratings;
DROP FUNCTION IF EXISTS public.sync_content_review_points();

WITH removed AS (
  DELETE FROM public.user_point_events
  WHERE activity = 'REVIEW_PUBLISHED'
  RETURNING user_id, points
), totals AS (
  SELECT user_id, SUM(points)::int AS points FROM removed GROUP BY user_id
)
UPDATE public.users
SET points = GREATEST(users.points - totals.points, 0)
FROM totals
WHERE users.id = totals.user_id;

ALTER TABLE public.user_point_events
DROP CONSTRAINT user_point_events_activity_check;

ALTER TABLE public.user_point_events
ADD CONSTRAINT user_point_events_activity_check
CHECK (activity IN ('VENUE_PUBLISHED', 'EVENT_PUBLISHED'));
