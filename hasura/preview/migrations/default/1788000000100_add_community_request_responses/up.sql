CREATE TABLE public.community_request_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.community_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 5 AND 800),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT community_request_responses_unique_author UNIQUE (request_id, user_id)
);

CREATE INDEX community_request_responses_feed_idx
  ON public.community_request_responses (request_id, created_at ASC, id ASC);
