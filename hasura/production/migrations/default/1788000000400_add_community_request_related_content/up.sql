ALTER TABLE public.community_requests
  ADD COLUMN venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
  ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE SET NULL,
  ADD CONSTRAINT community_requests_one_related_content CHECK (num_nonnulls(venue_id, event_id) <= 1);

CREATE INDEX community_requests_venue_idx
  ON public.community_requests (venue_id, created_at DESC, id DESC)
  WHERE status = 'OPEN' AND venue_id IS NOT NULL;

CREATE INDEX community_requests_event_idx
  ON public.community_requests (event_id, created_at DESC, id DESC)
  WHERE status = 'OPEN' AND event_id IS NOT NULL;
