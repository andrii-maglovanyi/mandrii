-- External delivery is intentionally opt-in. In-app alerts remain available to
-- every follower, while email, Telegram and browser push are independently
-- configurable by the account owner.
ALTER TABLE public.users
  ADD COLUMN content_alert_email_notifications_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN content_alert_telegram_notifications_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN content_alert_push_notifications_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN content_alert_delivery_frequency text NOT NULL DEFAULT 'IMMEDIATE'
    CHECK (content_alert_delivery_frequency IN ('IMMEDIATE', 'DAILY')),
  ADD COLUMN content_alert_delivery_preferences_updated_at timestamptz NOT NULL DEFAULT NOW();

CREATE TABLE public.content_subscription_alert_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.content_subscription_alerts(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('EMAIL', 'TELEGRAM', 'WEB_PUSH')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED', 'CANCELLED')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  locked_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (alert_id, channel)
);

CREATE INDEX content_subscription_alert_deliveries_due_idx
  ON public.content_subscription_alert_deliveries (next_attempt_at, created_at)
  WHERE status IN ('PENDING', 'PROCESSING');

CREATE INDEX content_subscription_alert_deliveries_recipient_idx
  ON public.content_subscription_alert_deliveries (recipient_id, status, created_at DESC);

CREATE TRIGGER content_subscription_alert_deliveries_update_timestamp
BEFORE UPDATE ON public.content_subscription_alert_deliveries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
