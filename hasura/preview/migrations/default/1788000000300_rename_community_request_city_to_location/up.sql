ALTER TABLE public.community_requests
  RENAME COLUMN city TO location;

ALTER TABLE public.community_requests
  DROP CONSTRAINT community_requests_city_check,
  ADD CONSTRAINT community_requests_location_check
    CHECK (location IS NULL OR char_length(btrim(location)) BETWEEN 2 AND 200);
