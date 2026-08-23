ALTER TABLE public.messages
  ADD COLUMN edited_at timestamptz,
  ADD COLUMN edited_by_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX messages_conversation_edited_idx
  ON public.messages (conversation_id, edited_at)
  WHERE edited_at IS NOT NULL;
