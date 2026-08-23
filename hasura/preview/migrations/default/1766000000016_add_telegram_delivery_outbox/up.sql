CREATE TABLE public.telegram_message_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL UNIQUE REFERENCES public.messages(id) ON DELETE CASCADE,
  telegram_chat_id bigint NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'CANCELLED')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  locked_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX telegram_message_deliveries_due_idx
  ON public.telegram_message_deliveries (next_attempt_at, created_at)
  WHERE status IN ('PENDING', 'PROCESSING');

CREATE OR REPLACE FUNCTION public.enqueue_telegram_message_delivery()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  linked_chat_id bigint;
BEGIN
  IF NEW.sender_type <> 'USER' THEN
    RETURN NEW;
  END IF;

  SELECT v.telegram_chat_id
  INTO linked_chat_id
  FROM public.conversations c
  JOIN public.venues v ON v.id = c.venue_id
  WHERE c.id = NEW.conversation_id
    AND v.telegram_user_id IS NOT NULL;

  IF linked_chat_id IS NOT NULL THEN
    INSERT INTO public.telegram_message_deliveries (message_id, telegram_chat_id)
    VALUES (NEW.id, linked_chat_id)
    ON CONFLICT (message_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_enqueue_telegram_delivery
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.enqueue_telegram_message_delivery();

INSERT INTO public.telegram_message_deliveries (message_id, telegram_chat_id)
SELECT m.id, m.telegram_chat_id
FROM public.messages m
JOIN public.conversations c ON c.id = m.conversation_id
JOIN public.venues v ON v.id = c.venue_id
WHERE m.sender_type = 'USER'
  AND m.deleted_at IS NULL
  AND m.telegram_delivered_at IS NULL
  AND m.telegram_chat_id IS NOT NULL
  AND v.telegram_chat_id = m.telegram_chat_id
  AND v.telegram_user_id IS NOT NULL
ON CONFLICT (message_id) DO NOTHING;
