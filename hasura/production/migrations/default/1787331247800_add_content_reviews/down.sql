DROP TRIGGER IF EXISTS content_ratings_update_timestamp ON public.content_ratings;

DROP INDEX IF EXISTS public.content_ratings_event_reviews_idx;
DROP INDEX IF EXISTS public.content_ratings_venue_reviews_idx;

ALTER TABLE public.content_ratings
  DROP CONSTRAINT IF EXISTS content_ratings_review_status_check,
  DROP CONSTRAINT IF EXISTS content_ratings_review_aspects_check,
  DROP CONSTRAINT IF EXISTS content_ratings_review_body_length_check,
  DROP COLUMN IF EXISTS review_status,
  DROP COLUMN IF EXISTS aspect_ratings,
  DROP COLUMN IF EXISTS review_body;
