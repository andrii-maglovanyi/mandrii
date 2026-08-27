ALTER TABLE public.events
  ADD COLUMN telegram_chat_id bigint,
  ADD COLUMN telegram_user_id bigint,
  ADD COLUMN telegram_review_notifications_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX events_telegram_chat_id_key ON public.events (telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;

ALTER TABLE public.telegram_link_tokens
  ALTER COLUMN venue_id DROP NOT NULL,
  ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  ADD CONSTRAINT telegram_link_tokens_target_check CHECK ((venue_id IS NULL) <> (event_id IS NULL));

DROP INDEX IF EXISTS public.telegram_link_tokens_one_active_per_venue_idx;
CREATE UNIQUE INDEX telegram_link_tokens_one_active_per_venue_idx ON public.telegram_link_tokens (venue_id) WHERE used_at IS NULL AND venue_id IS NOT NULL;
CREATE UNIQUE INDEX telegram_link_tokens_one_active_per_event_idx ON public.telegram_link_tokens (event_id) WHERE used_at IS NULL AND event_id IS NOT NULL;
