CREATE TABLE public.content_review_votes (
  content_rating_id uuid NOT NULL REFERENCES public.content_ratings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote text NOT NULL CHECK (vote IN ('HELPFUL', 'NOT_HELPFUL')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (content_rating_id, user_id)
);
