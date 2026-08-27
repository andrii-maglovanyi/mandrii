CREATE TABLE public.content_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT content_ratings_one_target_check
    CHECK (((venue_id IS NOT NULL)::integer + (event_id IS NOT NULL)::integer) = 1),
  CONSTRAINT content_ratings_user_venue_key UNIQUE (user_id, venue_id),
  CONSTRAINT content_ratings_user_event_key UNIQUE (user_id, event_id)
);

CREATE INDEX content_ratings_venue_summary_idx
  ON public.content_ratings (venue_id) INCLUDE (rating)
  WHERE venue_id IS NOT NULL;

CREATE INDEX content_ratings_event_summary_idx
  ON public.content_ratings (event_id) INCLUDE (rating)
  WHERE event_id IS NOT NULL;
