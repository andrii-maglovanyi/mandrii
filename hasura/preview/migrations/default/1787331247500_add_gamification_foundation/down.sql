DROP INDEX IF EXISTS public.users_public_leaderboard_idx;
DROP INDEX IF EXISTS public.user_point_events_created_at_user_idx;
DROP TABLE IF EXISTS public.user_point_events;

ALTER TABLE public.users
  ADD COLUMN level integer NOT NULL DEFAULT 1;
