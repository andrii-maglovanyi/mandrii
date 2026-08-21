-- Cursor pagination and chronological message loading.
CREATE INDEX messages_conversation_created_at_id_idx
  ON public.messages (conversation_id, created_at DESC, id DESC);

-- Unread counts only inspect messages from the other participant.
CREATE INDEX messages_conversation_sender_created_at_idx
  ON public.messages (conversation_id, sender_type, created_at DESC);

-- Owner unread lookups start from venues owned by the current user.
CREATE INDEX venues_owner_id_idx
  ON public.venues (owner_id)
  WHERE owner_id IS NOT NULL;
