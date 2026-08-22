ALTER TABLE public.messages
  ADD COLUMN deleted_at timestamptz,
  ADD COLUMN deleted_by_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Keeps unread-message checks fast while retaining the existing full-history
-- index for the chronological chat view (which also shows deleted placeholders).
CREATE INDEX messages_active_conversation_sender_created_at_idx
  ON public.messages (conversation_id, sender_type, created_at DESC)
  WHERE deleted_at IS NULL;
