ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_borough_length_check,
  DROP CONSTRAINT IF EXISTS users_city_length_check,
  DROP CONSTRAINT IF EXISTS users_town_length_check,
  DROP CONSTRAINT IF EXISTS users_country_length_check,
  DROP COLUMN IF EXISTS borough,
  DROP COLUMN IF EXISTS town,
  DROP COLUMN IF EXISTS country;
