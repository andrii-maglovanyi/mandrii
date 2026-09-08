-- Create external delivery records at the exact moment an in-app alert is
-- created. This avoids repeatedly scanning alert history and guarantees that
-- a later preference edit cannot skip an alert that was already eligible.
CREATE OR REPLACE FUNCTION public.enqueue_external_content_alert_delivery()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.content_subscription_alert_deliveries (alert_id, recipient_id, channel, next_attempt_at)
  SELECT NEW.id,
         NEW.recipient_id,
         channel.channel,
         CASE user_account.content_alert_delivery_frequency
           WHEN 'DAILY' THEN
             date_trunc('day', NOW()) + INTERVAL '9 hours'
               + CASE WHEN NOW() >= date_trunc('day', NOW()) + INTERVAL '9 hours' THEN INTERVAL '1 day' ELSE INTERVAL '0 days' END
           ELSE NOW()
         END
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

CREATE TRIGGER content_subscription_alerts_enqueue_external_delivery
AFTER INSERT ON public.content_subscription_alerts
FOR EACH ROW EXECUTE FUNCTION public.enqueue_external_content_alert_delivery();
