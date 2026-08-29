ALTER TABLE public.users
  ADD COLUMN borough text,
  ADD COLUMN town text,
  ADD COLUMN country text;

ALTER TABLE public.users
  ADD CONSTRAINT users_borough_length_check CHECK (borough IS NULL OR char_length(borough) <= 120),
  ADD CONSTRAINT users_city_length_check CHECK (city IS NULL OR char_length(city) <= 120),
  ADD CONSTRAINT users_town_length_check CHECK (town IS NULL OR char_length(town) <= 120),
  ADD CONSTRAINT users_country_length_check CHECK (country IS NULL OR char_length(country) <= 120);
