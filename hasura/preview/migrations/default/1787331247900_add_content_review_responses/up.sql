CREATE TABLE public.content_review_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_rating_id uuid NOT NULL UNIQUE REFERENCES public.content_ratings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1500),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TRIGGER content_review_responses_update_timestamp
BEFORE UPDATE ON public.content_review_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
