ALTER TABLE public.venues
  ADD COLUMN telegram_review_notifications_enabled boolean NOT NULL DEFAULT false;
