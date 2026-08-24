ALTER TABLE public.users
  ADD COLUMN venues_created integer NOT NULL DEFAULT 0,
  ADD COLUMN events_created integer NOT NULL DEFAULT 0,
  ADD COLUMN reviews_created integer NOT NULL DEFAULT 0,
  ADD COLUMN thank_you_count integer NOT NULL DEFAULT 0;
