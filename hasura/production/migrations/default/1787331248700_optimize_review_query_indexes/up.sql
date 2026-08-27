-- Cursor pagination already has target-specific indexes. These indexes cover
-- the two aggregation-heavy paths that grow with review activity.
CREATE INDEX content_review_votes_helpful_rating_idx
  ON public.content_review_votes (content_rating_id)
  WHERE vote = 'HELPFUL';

CREATE INDEX content_review_reports_open_rating_idx
  ON public.content_review_reports (content_rating_id)
  INCLUDE (reason)
  WHERE status = 'OPEN';

CREATE INDEX content_ratings_hidden_reviews_idx
  ON public.content_ratings (created_at DESC, id DESC)
  WHERE review_body IS NOT NULL AND review_status = 'HIDDEN';

CREATE INDEX content_ratings_user_published_reviews_idx
  ON public.content_ratings (user_id)
  WHERE review_body IS NOT NULL AND review_status = 'PUBLISHED';
