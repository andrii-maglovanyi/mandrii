CREATE TABLE public.content_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  area_place_id text,
  area_label text,
  area_country text,
  area_geo public.geography(Point, 4326),
  area_radius_meters integer,
  updates_enabled boolean NOT NULL DEFAULT true,
  new_events_enabled boolean NOT NULL DEFAULT true,
  event_changes_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_subscriptions_one_target_check
    CHECK (((venue_id IS NOT NULL)::integer + (event_id IS NOT NULL)::integer + (area_place_id IS NOT NULL)::integer) = 1),
  CONSTRAINT content_subscriptions_area_details_check
    CHECK (
      (area_place_id IS NULL AND area_label IS NULL AND area_country IS NULL AND area_geo IS NULL AND area_radius_meters IS NULL)
      OR (
        area_place_id IS NOT NULL
        AND area_label IS NOT NULL
        AND area_country IS NOT NULL
        AND area_geo IS NOT NULL
        AND area_radius_meters BETWEEN 1000 AND 100000
      )
    )
);

CREATE UNIQUE INDEX content_subscriptions_user_venue_key
  ON public.content_subscriptions (user_id, venue_id)
  WHERE venue_id IS NOT NULL;

CREATE UNIQUE INDEX content_subscriptions_user_event_key
  ON public.content_subscriptions (user_id, event_id)
  WHERE event_id IS NOT NULL;

CREATE UNIQUE INDEX content_subscriptions_user_area_key
  ON public.content_subscriptions (user_id, area_place_id)
  WHERE area_place_id IS NOT NULL;

CREATE INDEX content_subscriptions_user_created_idx
  ON public.content_subscriptions (user_id, created_at DESC);

CREATE INDEX content_subscriptions_venue_idx
  ON public.content_subscriptions (venue_id)
  WHERE venue_id IS NOT NULL AND updates_enabled;

CREATE INDEX content_subscriptions_event_idx
  ON public.content_subscriptions (event_id)
  WHERE event_id IS NOT NULL AND (updates_enabled OR event_changes_enabled);

CREATE INDEX content_subscriptions_area_geo_idx
  ON public.content_subscriptions USING gist (area_geo)
  WHERE area_geo IS NOT NULL;

CREATE TRIGGER content_subscriptions_update_timestamp
BEFORE UPDATE ON public.content_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.content_subscriptions IS
  'User follows for a venue, event, or selected local area. Owner updates remain in content_updates.';
