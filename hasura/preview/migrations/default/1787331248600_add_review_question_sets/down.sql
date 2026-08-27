ALTER TABLE public.content_ratings
  DROP CONSTRAINT IF EXISTS content_ratings_review_question_set_check,
  DROP COLUMN IF EXISTS review_question_set;
