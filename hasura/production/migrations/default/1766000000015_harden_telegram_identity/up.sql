ALTER TABLE public.venues
ADD COLUMN telegram_user_id bigint;

-- A pre-existing link has no verifiable Telegram account identity. Disable it
-- rather than allowing an unknown chat participant to impersonate a venue.
UPDATE public.venues
SET telegram_chat_id = NULL
WHERE telegram_chat_id IS NOT NULL AND telegram_user_id IS NULL;

CREATE INDEX venues_telegram_link_identity_idx
  ON public.venues (telegram_chat_id, telegram_user_id)
  WHERE telegram_chat_id IS NOT NULL AND telegram_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.clear_telegram_link_on_venue_owner_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    NEW.telegram_chat_id := NULL;
    NEW.telegram_user_id := NULL;

    UPDATE public.telegram_link_tokens
    SET used_at = NOW()
    WHERE venue_id = OLD.id AND used_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER venues_clear_telegram_link_on_owner_change
BEFORE UPDATE OF owner_id ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.clear_telegram_link_on_venue_owner_change();
