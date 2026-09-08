-- An area represents one geographic interest. Keep venue and event discovery
-- independent so people can choose either or both without duplicate areas.
ALTER TABLE public.content_subscriptions
  ADD COLUMN new_venues_enabled boolean NOT NULL DEFAULT true;

CREATE INDEX content_subscriptions_area_new_venues_geo_idx
  ON public.content_subscriptions USING gist (area_geo)
  WHERE area_geo IS NOT NULL AND new_venues_enabled;
