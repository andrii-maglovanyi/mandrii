ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS telegram_chat_id bigint;

ALTER TABLE public.venues
ALTER COLUMN telegram_chat_id TYPE bigint
USING telegram_chat_id::bigint;

CREATE UNIQUE INDEX IF NOT EXISTS venues_telegram_chat_id_key
ON public.venues (telegram_chat_id)
WHERE telegram_chat_id IS NOT NULL;
