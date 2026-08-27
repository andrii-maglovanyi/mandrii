ALTER TABLE public.content_ratings
  ADD COLUMN review_question_set smallint NOT NULL DEFAULT 1,
  ADD CONSTRAINT content_ratings_review_question_set_check
    CHECK (review_question_set IN (1, 2));
