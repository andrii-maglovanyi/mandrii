-- Some databases received the messaging columns without the complete
-- original Telegram migration. Make the linking and webhook invariants explicit.
CREATE TABLE IF NOT EXISTS public.telegram_link_tokens (
  token text PRIMARY KEY,
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz
);

CREATE INDEX IF NOT EXISTS telegram_link_tokens_active_idx
  ON public.telegram_link_tokens (venue_id, expires_at)
  WHERE used_at IS NULL;

WITH ranked_tokens AS (
  SELECT
    token,
    ROW_NUMBER() OVER (PARTITION BY venue_id ORDER BY expires_at DESC, token DESC) AS row_number
  FROM public.telegram_link_tokens
  WHERE used_at IS NULL
)
UPDATE public.telegram_link_tokens AS tokens
SET used_at = NOW()
FROM ranked_tokens
WHERE tokens.token = ranked_tokens.token
  AND ranked_tokens.row_number > 1;

CREATE UNIQUE INDEX IF NOT EXISTS telegram_link_tokens_one_active_per_venue_idx
  ON public.telegram_link_tokens (venue_id)
  WHERE used_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS messages_telegram_update_idx
  ON public.messages (telegram_chat_id, telegram_message_id)
  WHERE telegram_chat_id IS NOT NULL AND telegram_message_id IS NOT NULL;
