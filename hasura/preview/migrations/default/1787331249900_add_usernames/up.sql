ALTER TABLE public.users
  ADD COLUMN username text;

ALTER TABLE public.users
  ADD CONSTRAINT users_username_format_check
  CHECK (username IS NULL OR username ~ '^[a-z0-9_]{3,30}$');

CREATE UNIQUE INDEX users_username_lower_unique_idx
  ON public.users (lower(username))
  WHERE username IS NOT NULL;
