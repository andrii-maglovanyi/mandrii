DROP INDEX public.content_updates_one_pinned_event_idx;
DROP INDEX public.content_updates_one_pinned_venue_idx;
DROP INDEX public.content_updates_event_feed_idx;
DROP INDEX public.content_updates_venue_feed_idx;

ALTER TABLE public.content_updates
  DROP COLUMN is_pinned;

CREATE INDEX content_updates_venue_feed_idx
  ON public.content_updates (venue_id, created_at DESC, id DESC)
  WHERE venue_id IS NOT NULL;

CREATE INDEX content_updates_event_feed_idx
  ON public.content_updates (event_id, created_at DESC, id DESC)
  WHERE event_id IS NOT NULL;
