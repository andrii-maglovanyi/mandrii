DROP TRIGGER IF EXISTS venues_enqueue_subscription_alert ON public.venues;
DROP TRIGGER IF EXISTS events_enqueue_subscription_alert ON public.events;
DROP TRIGGER IF EXISTS content_updates_enqueue_subscription_alert ON public.content_updates;

DROP FUNCTION IF EXISTS public.enqueue_venue_subscription_alert_job();
DROP FUNCTION IF EXISTS public.enqueue_event_subscription_alert_jobs();
DROP FUNCTION IF EXISTS public.enqueue_content_update_subscription_alert_job();

DROP INDEX IF EXISTS public.content_subscriptions_area_new_events_geo_idx;
DROP INDEX IF EXISTS public.content_subscriptions_area_updates_geo_idx;
DROP INDEX IF EXISTS public.content_subscriptions_event_changes_idx;
DROP INDEX IF EXISTS public.content_subscriptions_venue_new_events_idx;
DROP INDEX IF EXISTS public.content_subscription_alerts_recipient_job_key;
ALTER TABLE public.content_subscription_alerts DROP COLUMN IF EXISTS alert_job_id;
DROP TABLE IF EXISTS public.content_subscription_alert_jobs;

ALTER TABLE public.content_subscription_alerts
  DROP CONSTRAINT content_subscription_alerts_check,
  ADD CONSTRAINT content_subscription_alerts_check
    CHECK (
      (kind = 'CONTENT_UPDATE' AND content_update_id IS NOT NULL)
      OR (kind = 'EVENT_PUBLISHED' AND event_id IS NOT NULL)
      OR (kind = 'VENUE_PUBLISHED' AND venue_id IS NOT NULL)
    );

ALTER TABLE public.content_subscription_alerts
  DROP CONSTRAINT content_subscription_alerts_kind_check,
  ADD CONSTRAINT content_subscription_alerts_kind_check
    CHECK (kind IN ('CONTENT_UPDATE', 'EVENT_PUBLISHED', 'VENUE_PUBLISHED'));
