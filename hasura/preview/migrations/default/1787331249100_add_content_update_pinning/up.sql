ALTER TABLE public.content_updates
  ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

DROP INDEX public.content_updates_venue_feed_idx;
DROP INDEX public.content_updates_event_feed_idx;

CREATE INDEX content_updates_venue_feed_idx
  ON public.content_updates (venue_id, is_pinned DESC, created_at DESC, id DESC)
  WHERE venue_id IS NOT NULL;

CREATE INDEX content_updates_event_feed_idx
  ON public.content_updates (event_id, is_pinned DESC, created_at DESC, id DESC)
  WHERE event_id IS NOT NULL;

CREATE UNIQUE INDEX content_updates_one_pinned_venue_idx
  ON public.content_updates (venue_id)
  WHERE venue_id IS NOT NULL AND is_pinned;

CREATE UNIQUE INDEX content_updates_one_pinned_event_idx
  ON public.content_updates (event_id)
  WHERE event_id IS NOT NULL AND is_pinned;
