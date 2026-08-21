-- Expired and superseded links are no longer usable, so they should not prevent
-- the one outstanding link allowed for a venue.
UPDATE public.telegram_link_tokens
SET used_at = NOW()
WHERE used_at IS NULL
  AND expires_at <= NOW();

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

CREATE UNIQUE INDEX telegram_link_tokens_one_active_per_venue_idx
  ON public.telegram_link_tokens (venue_id)
  WHERE used_at IS NULL;
