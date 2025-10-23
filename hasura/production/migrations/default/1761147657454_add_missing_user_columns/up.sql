-- Add missing columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS points integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS thank_you_count integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS venues_created integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS events_created integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS reviews_created integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_activity_at timestamp without time zone;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified_contributor boolean DEFAULT false;
