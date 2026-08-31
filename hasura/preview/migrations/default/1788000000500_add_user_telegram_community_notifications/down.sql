DROP TABLE IF EXISTS public.community_response_telegram_deliveries;
DROP INDEX IF EXISTS public.telegram_link_tokens_one_active_per_user_idx;

ALTER TABLE public.telegram_link_tokens
  DROP CONSTRAINT IF EXISTS telegram_link_tokens_target_check,
  DROP COLUMN IF EXISTS user_id,
  ADD CONSTRAINT telegram_link_tokens_target_check CHECK ((venue_id IS NULL) <> (event_id IS NULL));

DROP INDEX IF EXISTS public.users_telegram_user_id_key;
DROP INDEX IF EXISTS public.users_telegram_chat_id_key;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS community_telegram_notifications_enabled,
  DROP COLUMN IF EXISTS telegram_user_id,
  DROP COLUMN IF EXISTS telegram_chat_id;
