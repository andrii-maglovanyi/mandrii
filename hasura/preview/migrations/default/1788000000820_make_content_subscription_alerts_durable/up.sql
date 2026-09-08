ALTER TABLE public.content_subscription_alerts
  DROP CONSTRAINT content_subscription_alerts_kind_check,
  ADD CONSTRAINT content_subscription_alerts_kind_check
    CHECK (kind IN ('CONTENT_UPDATE', 'EVENT_PUBLISHED', 'EVENT_CHANGED', 'VENUE_PUBLISHED'));

ALTER TABLE public.content_subscription_alerts
  DROP CONSTRAINT content_subscription_alerts_check,
  ADD CONSTRAINT content_subscription_alerts_check
    CHECK (
      (kind = 'CONTENT_UPDATE' AND content_update_id IS NOT NULL)
      OR (kind IN ('EVENT_PUBLISHED', 'EVENT_CHANGED') AND event_id IS NOT NULL)
      OR (kind = 'VENUE_PUBLISHED' AND venue_id IS NOT NULL)
    );

CREATE TABLE public.content_subscription_alert_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('CONTENT_UPDATE', 'EVENT_PUBLISHED', 'EVENT_CHANGED', 'VENUE_PUBLISHED')),
  content_update_id uuid REFERENCES public.content_updates(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  source_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'FAILED')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  locked_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  CHECK (
    (kind = 'CONTENT_UPDATE' AND content_update_id IS NOT NULL)
    OR (kind IN ('EVENT_PUBLISHED', 'EVENT_CHANGED') AND event_id IS NOT NULL)
    OR (kind = 'VENUE_PUBLISHED' AND venue_id IS NOT NULL)
  )
);

ALTER TABLE public.content_subscription_alerts
  ADD COLUMN alert_job_id uuid REFERENCES public.content_subscription_alert_jobs(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX content_subscription_alerts_recipient_job_key
  ON public.content_subscription_alerts (recipient_id, alert_job_id)
  WHERE alert_job_id IS NOT NULL;

CREATE UNIQUE INDEX content_subscription_alert_jobs_update_key
  ON public.content_subscription_alert_jobs (content_update_id)
  WHERE kind = 'CONTENT_UPDATE';

CREATE UNIQUE INDEX content_subscription_alert_jobs_event_published_key
  ON public.content_subscription_alert_jobs (event_id)
  WHERE kind = 'EVENT_PUBLISHED';

CREATE UNIQUE INDEX content_subscription_alert_jobs_event_changed_key
  ON public.content_subscription_alert_jobs (event_id, source_at)
  WHERE kind = 'EVENT_CHANGED';

CREATE UNIQUE INDEX content_subscription_alert_jobs_venue_published_key
  ON public.content_subscription_alert_jobs (venue_id)
  WHERE kind = 'VENUE_PUBLISHED';

CREATE INDEX content_subscription_alert_jobs_due_idx
  ON public.content_subscription_alert_jobs (next_attempt_at, created_at)
  WHERE status IN ('PENDING', 'PROCESSING');

CREATE INDEX content_subscriptions_venue_new_events_idx
  ON public.content_subscriptions (venue_id)
  WHERE venue_id IS NOT NULL AND new_events_enabled;

CREATE INDEX content_subscriptions_event_changes_idx
  ON public.content_subscriptions (event_id)
  WHERE event_id IS NOT NULL AND event_changes_enabled;

CREATE INDEX content_subscriptions_area_updates_geo_idx
  ON public.content_subscriptions USING gist (area_geo)
  WHERE area_geo IS NOT NULL AND updates_enabled;

CREATE INDEX content_subscriptions_area_new_events_geo_idx
  ON public.content_subscriptions USING gist (area_geo)
  WHERE area_geo IS NOT NULL AND new_events_enabled;

CREATE OR REPLACE FUNCTION public.enqueue_content_update_subscription_alert_job()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.content_subscription_alert_jobs (kind, content_update_id, source_at)
  VALUES ('CONTENT_UPDATE', NEW.id, NEW.created_at)
  ON CONFLICT (content_update_id) WHERE kind = 'CONTENT_UPDATE' DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_event_subscription_alert_jobs()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'ACTIVE' AND OLD.status IS DISTINCT FROM 'ACTIVE' THEN
    INSERT INTO public.content_subscription_alert_jobs (kind, event_id, source_at)
    VALUES ('EVENT_PUBLISHED', NEW.id, NEW.updated_at)
    ON CONFLICT (event_id) WHERE kind = 'EVENT_PUBLISHED' DO NOTHING;
  ELSIF OLD.status = 'ACTIVE' AND (
    NEW.status IN ('ACTIVE', 'CANCELLED', 'ARCHIVED')
    AND (
      NEW.status IS DISTINCT FROM OLD.status
      OR NEW.title_en IS DISTINCT FROM OLD.title_en
      OR NEW.title_uk IS DISTINCT FROM OLD.title_uk
      OR NEW.description_en IS DISTINCT FROM OLD.description_en
      OR NEW.description_uk IS DISTINCT FROM OLD.description_uk
      OR NEW.start_date IS DISTINCT FROM OLD.start_date
      OR NEW.end_date IS DISTINCT FROM OLD.end_date
      OR NEW.is_online IS DISTINCT FROM OLD.is_online
      OR NEW.external_url IS DISTINCT FROM OLD.external_url
      OR NEW.custom_location_address IS DISTINCT FROM OLD.custom_location_address
      OR NEW.custom_location_name IS DISTINCT FROM OLD.custom_location_name
      OR NEW.city IS DISTINCT FROM OLD.city
      OR NEW.country IS DISTINCT FROM OLD.country
      OR NEW.area IS DISTINCT FROM OLD.area
      OR NEW.geo IS DISTINCT FROM OLD.geo
      OR NEW.images IS DISTINCT FROM OLD.images
      OR NEW.registration_url IS DISTINCT FROM OLD.registration_url
      OR NEW.registration_required IS DISTINCT FROM OLD.registration_required
      OR NEW.capacity IS DISTINCT FROM OLD.capacity
      OR NEW.age_restriction IS DISTINCT FROM OLD.age_restriction
      OR NEW.language IS DISTINCT FROM OLD.language
      OR NEW.accessibility_info IS DISTINCT FROM OLD.accessibility_info
      OR NEW.price_type IS DISTINCT FROM OLD.price_type
      OR NEW.price_amount IS DISTINCT FROM OLD.price_amount
      OR NEW.price_currency IS DISTINCT FROM OLD.price_currency
      OR NEW.is_recurring IS DISTINCT FROM OLD.is_recurring
      OR NEW.recurrence_rule IS DISTINCT FROM OLD.recurrence_rule
    )
  ) THEN
    INSERT INTO public.content_subscription_alert_jobs (kind, event_id, source_at)
    VALUES ('EVENT_CHANGED', NEW.id, NEW.updated_at)
    ON CONFLICT (event_id, source_at) WHERE kind = 'EVENT_CHANGED' DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enqueue_venue_subscription_alert_job()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'ACTIVE' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'ACTIVE') THEN
    INSERT INTO public.content_subscription_alert_jobs (kind, venue_id, source_at)
    VALUES ('VENUE_PUBLISHED', NEW.id, NEW.updated_at)
    ON CONFLICT (venue_id) WHERE kind = 'VENUE_PUBLISHED' DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER content_updates_enqueue_subscription_alert
AFTER INSERT ON public.content_updates
FOR EACH ROW EXECUTE FUNCTION public.enqueue_content_update_subscription_alert_job();

CREATE TRIGGER events_enqueue_subscription_alert
AFTER UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.enqueue_event_subscription_alert_jobs();

CREATE TRIGGER venues_enqueue_subscription_alert
AFTER INSERT OR UPDATE ON public.venues
FOR EACH ROW EXECUTE FUNCTION public.enqueue_venue_subscription_alert_job();
