ALTER TABLE public.community_response_telegram_deliveries
  ADD COLUMN telegram_message_id bigint;

CREATE UNIQUE INDEX community_response_telegram_deliveries_message_idx
  ON public.community_response_telegram_deliveries (telegram_chat_id, telegram_message_id)
  WHERE telegram_message_id IS NOT NULL;

CREATE TABLE public.community_response_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL REFERENCES public.community_request_responses(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 1500),
  source text NOT NULL DEFAULT 'WEB' CHECK (source IN ('WEB', 'TELEGRAM')),
  telegram_chat_id bigint,
  telegram_message_id bigint,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT community_response_messages_telegram_source_check CHECK (
    (source = 'WEB' AND telegram_chat_id IS NULL AND telegram_message_id IS NULL)
    OR (source = 'TELEGRAM' AND telegram_chat_id IS NOT NULL AND telegram_message_id IS NOT NULL)
  )
);

CREATE INDEX community_response_messages_thread_idx
  ON public.community_response_messages (response_id, created_at ASC, id ASC);

CREATE UNIQUE INDEX community_response_messages_telegram_identity_idx
  ON public.community_response_messages (telegram_chat_id, telegram_message_id)
  WHERE telegram_chat_id IS NOT NULL AND telegram_message_id IS NOT NULL;
