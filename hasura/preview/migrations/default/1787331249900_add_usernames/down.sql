DROP INDEX IF EXISTS public.users_username_lower_unique_idx;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_username_format_check,
  DROP COLUMN IF EXISTS username;
