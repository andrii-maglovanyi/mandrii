DROP INDEX IF EXISTS public.content_subscription_alerts_venue_published_recipient_key;

ALTER TABLE public.content_subscription_alerts
  DROP CONSTRAINT content_subscription_alerts_check,
  ADD CONSTRAINT content_subscription_alerts_check
    CHECK (
      (kind = 'CONTENT_UPDATE' AND content_update_id IS NOT NULL)
      OR (kind = 'EVENT_PUBLISHED' AND event_id IS NOT NULL)
    );

ALTER TABLE public.content_subscription_alerts
  DROP CONSTRAINT content_subscription_alerts_kind_check,
  ADD CONSTRAINT content_subscription_alerts_kind_check
    CHECK (kind IN ('CONTENT_UPDATE', 'EVENT_PUBLISHED'));
