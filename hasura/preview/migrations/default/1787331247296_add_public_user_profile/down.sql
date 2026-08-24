DROP INDEX IF EXISTS public.events_public_profile_activity_idx;
DROP INDEX IF EXISTS public.venues_public_profile_activity_idx;

ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_bio_length_check;

ALTER TABLE public.users
DROP COLUMN IF EXISTS bio;
