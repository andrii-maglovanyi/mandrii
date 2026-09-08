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
