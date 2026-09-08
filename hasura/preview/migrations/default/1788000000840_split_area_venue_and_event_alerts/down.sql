DROP INDEX IF EXISTS public.content_subscriptions_area_new_venues_geo_idx;

ALTER TABLE public.content_subscriptions
  DROP COLUMN new_venues_enabled;
