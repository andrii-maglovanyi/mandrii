-- Keep the displayed daily-digest time independent from the PostgreSQL
-- session timezone. Both the trigger and preference changes use this one
-- function so the scheduling rule cannot drift between application and DB.
CREATE OR REPLACE FUNCTION public.content_alert_delivery_next_attempt_at(delivery_frequency text)
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$
  SELECT CASE delivery_frequency
    WHEN 'DAILY' THEN (
      date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '9 hours'
        + CASE
            WHEN NOW() AT TIME ZONE 'UTC' >= date_trunc('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '9 hours'
              THEN INTERVAL '1 day'
            ELSE INTERVAL '0 days'
          END
    ) AT TIME ZONE 'UTC'
    ELSE NOW()
  END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_external_content_alert_delivery()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.content_subscription_alert_deliveries (alert_id, recipient_id, channel, next_attempt_at)
  SELECT NEW.id,
         NEW.recipient_id,
         channel.channel,
         public.content_alert_delivery_next_attempt_at(user_account.content_alert_delivery_frequency)
  FROM public.users user_account
  CROSS JOIN LATERAL (
    VALUES
      ('EMAIL'::text, user_account.content_alert_email_notifications_enabled),
      ('TELEGRAM'::text, user_account.content_alert_telegram_notifications_enabled
        AND user_account.telegram_chat_id IS NOT NULL AND user_account.telegram_user_id IS NOT NULL),
      ('WEB_PUSH'::text, user_account.content_alert_push_notifications_enabled)
  ) AS channel(channel, enabled)
  WHERE user_account.id = NEW.recipient_id AND channel.enabled
  ON CONFLICT (alert_id, channel) DO NOTHING;
  RETURN NEW;
END;
$$;
