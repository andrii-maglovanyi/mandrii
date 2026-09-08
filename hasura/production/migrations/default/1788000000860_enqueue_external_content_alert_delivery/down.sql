DROP TRIGGER IF EXISTS content_subscription_alerts_enqueue_external_delivery
  ON public.content_subscription_alerts;

DROP FUNCTION IF EXISTS public.enqueue_external_content_alert_delivery();
