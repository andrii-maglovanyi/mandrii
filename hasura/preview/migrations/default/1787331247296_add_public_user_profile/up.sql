ALTER TABLE public.users
ADD COLUMN bio text;

ALTER TABLE public.users
ADD CONSTRAINT users_bio_length_check CHECK (char_length(bio) <= 500);

CREATE INDEX venues_public_profile_activity_idx
  ON public.venues (user_id, created_at DESC)
  WHERE status = 'ACTIVE';

CREATE INDEX events_public_profile_activity_idx
  ON public.events (user_id, created_at DESC)
  WHERE status = 'ACTIVE';
