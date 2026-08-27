DROP INDEX IF EXISTS public.telegram_link_tokens_one_active_per_event_idx;
DROP INDEX IF EXISTS public.events_telegram_chat_id_key;
ALTER TABLE public.telegram_link_tokens DROP CONSTRAINT IF EXISTS telegram_link_tokens_target_check;
ALTER TABLE public.telegram_link_tokens DROP COLUMN IF EXISTS event_id;
ALTER TABLE public.telegram_link_tokens ALTER COLUMN venue_id SET NOT NULL;
ALTER TABLE public.events DROP COLUMN IF EXISTS telegram_review_notifications_enabled, DROP COLUMN IF EXISTS telegram_user_id, DROP COLUMN IF EXISTS telegram_chat_id;
