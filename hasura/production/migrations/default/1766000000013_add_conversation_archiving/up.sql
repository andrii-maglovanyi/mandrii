ALTER TABLE public.conversations
  ADD COLUMN owner_archived_at timestamptz,
  ADD COLUMN user_archived_at timestamptz;

CREATE INDEX conversations_venue_owner_archived_idx
  ON public.conversations (venue_id, owner_archived_at)
  WHERE owner_archived_at IS NOT NULL;

CREATE INDEX conversations_venue_user_archived_idx
  ON public.conversations (venue_id, user_id, user_archived_at)
  WHERE user_archived_at IS NOT NULL;
