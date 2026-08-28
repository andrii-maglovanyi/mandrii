ALTER TABLE public.venues
  ADD COLUMN telegram_qr_notifications_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE public.events
  ADD COLUMN telegram_qr_notifications_enabled boolean NOT NULL DEFAULT false;
