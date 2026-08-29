ALTER TABLE public.venues
  ADD COLUMN telegram_message_notifications_enabled boolean NOT NULL DEFAULT false;
