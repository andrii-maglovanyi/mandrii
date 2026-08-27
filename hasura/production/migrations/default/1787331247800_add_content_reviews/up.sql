ALTER TABLE public.content_ratings
  ADD COLUMN review_body text,
  ADD COLUMN aspect_ratings jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN review_status text NOT NULL DEFAULT 'PUBLISHED',
  ADD CONSTRAINT content_ratings_review_body_length_check
    CHECK (review_body IS NULL OR char_length(btrim(review_body)) BETWEEN 10 AND 1500),
  ADD CONSTRAINT content_ratings_review_aspects_check
    CHECK ((review_body IS NOT NULL) OR aspect_ratings = '{}'::jsonb),
  ADD CONSTRAINT content_ratings_review_status_check
    CHECK (review_status IN ('PUBLISHED', 'HIDDEN'));

CREATE INDEX content_ratings_venue_reviews_idx
  ON public.content_ratings (venue_id, created_at DESC, id DESC)
  WHERE review_body IS NOT NULL AND review_status = 'PUBLISHED';

CREATE INDEX content_ratings_event_reviews_idx
  ON public.content_ratings (event_id, created_at DESC, id DESC)
  WHERE review_body IS NOT NULL AND review_status = 'PUBLISHED';

CREATE TRIGGER content_ratings_update_timestamp
  BEFORE UPDATE ON public.content_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
