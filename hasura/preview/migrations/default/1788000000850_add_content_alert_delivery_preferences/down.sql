DROP TRIGGER IF EXISTS content_subscription_alert_deliveries_update_timestamp
  ON public.content_subscription_alert_deliveries;

DROP INDEX IF EXISTS public.content_subscription_alert_deliveries_recipient_idx;
DROP INDEX IF EXISTS public.content_subscription_alert_deliveries_due_idx;
DROP TABLE IF EXISTS public.content_subscription_alert_deliveries;

ALTER TABLE public.users
  DROP COLUMN IF EXISTS content_alert_delivery_preferences_updated_at,
  DROP COLUMN IF EXISTS content_alert_delivery_frequency,
  DROP COLUMN IF EXISTS content_alert_push_notifications_enabled,
  DROP COLUMN IF EXISTS content_alert_telegram_notifications_enabled,
  DROP COLUMN IF EXISTS content_alert_email_notifications_enabled;
