DROP INDEX public.users_username_lower_unique_idx;

CREATE UNIQUE INDEX users_username_unique_idx
  ON public.users (username)
  WHERE username IS NOT NULL;
