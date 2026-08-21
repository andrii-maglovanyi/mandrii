CREATE TABLE public.telegram_link_tokens (
  token text PRIMARY KEY,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE INDEX telegram_link_tokens_active_idx
  ON public.telegram_link_tokens (venue_id, expires_at)
  WHERE used_at IS NULL;

ALTER TABLE public.messages ADD COLUMN telegram_chat_id bigint;

CREATE UNIQUE INDEX messages_telegram_update_idx
  ON public.messages (telegram_chat_id, telegram_message_id)
  WHERE telegram_chat_id IS NOT NULL AND telegram_message_id IS NOT NULL;

CREATE UNIQUE INDEX conversations_venue_user_idx
  ON public.conversations (venue_id, user_id);
