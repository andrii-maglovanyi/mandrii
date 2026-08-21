-- Consecutive-message grouping checks the most recent message sent to an owner's Telegram chat.
CREATE INDEX messages_telegram_chat_created_at_idx
  ON public.messages (telegram_chat_id, created_at DESC, id DESC)
  WHERE telegram_chat_id IS NOT NULL;
