CREATE TABLE public.content_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1500),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT content_updates_one_target_check
    CHECK (((venue_id IS NOT NULL)::integer + (event_id IS NOT NULL)::integer) = 1)
);

CREATE INDEX content_updates_venue_feed_idx
  ON public.content_updates (venue_id, created_at DESC, id DESC)
  WHERE venue_id IS NOT NULL;

CREATE INDEX content_updates_event_feed_idx
  ON public.content_updates (event_id, created_at DESC, id DESC)
  WHERE event_id IS NOT NULL;

CREATE TRIGGER content_updates_update_timestamp
BEFORE UPDATE ON public.content_updates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
