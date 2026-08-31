ALTER TABLE public.users
  ADD COLUMN telegram_chat_id bigint,
  ADD COLUMN telegram_user_id bigint,
  ADD COLUMN community_telegram_notifications_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX users_telegram_chat_id_key
  ON public.users (telegram_chat_id)
  WHERE telegram_chat_id IS NOT NULL;

CREATE UNIQUE INDEX users_telegram_user_id_key
  ON public.users (telegram_user_id)
  WHERE telegram_user_id IS NOT NULL;

ALTER TABLE public.telegram_link_tokens
  ADD COLUMN user_id uuid REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.telegram_link_tokens
  DROP CONSTRAINT IF EXISTS telegram_link_tokens_target_check,
  ADD CONSTRAINT telegram_link_tokens_target_check
    CHECK (num_nonnulls(venue_id, event_id, user_id) = 1);

CREATE UNIQUE INDEX telegram_link_tokens_one_active_per_user_idx
  ON public.telegram_link_tokens (user_id)
  WHERE used_at IS NULL AND user_id IS NOT NULL;

CREATE TABLE public.community_response_telegram_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id uuid NOT NULL UNIQUE REFERENCES public.community_request_responses(id) ON DELETE CASCADE,
  telegram_chat_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'CANCELLED')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  locked_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX community_response_telegram_deliveries_due_idx
  ON public.community_response_telegram_deliveries (next_attempt_at, created_at)
  WHERE status IN ('PENDING', 'PROCESSING');
