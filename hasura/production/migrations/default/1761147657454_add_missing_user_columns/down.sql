-- Remove added columns from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS is_verified_contributor;
ALTER TABLE public.users DROP COLUMN IF EXISTS last_activity_at;
ALTER TABLE public.users DROP COLUMN IF EXISTS reviews_created;
ALTER TABLE public.users DROP COLUMN IF EXISTS events_created;
ALTER TABLE public.users DROP COLUMN IF EXISTS venues_created;
ALTER TABLE public.users DROP COLUMN IF EXISTS thank_you_count;
ALTER TABLE public.users DROP COLUMN IF EXISTS level;
ALTER TABLE public.users DROP COLUMN IF EXISTS points;
