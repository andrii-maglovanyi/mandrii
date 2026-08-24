ALTER TABLE public.users
ADD COLUMN joined_at timestamptz;

UPDATE public.users AS users
SET joined_at = COALESCE(
  users."emailVerified",
  (
    SELECT MIN(contributions.created_at)
    FROM (
      SELECT venues.created_at FROM public.venues WHERE venues.user_id = users.id
      UNION ALL
      SELECT events.created_at FROM public.events WHERE events.user_id = users.id
    ) AS contributions
  )
)
WHERE users.joined_at IS NULL;

ALTER TABLE public.users
ALTER COLUMN joined_at SET DEFAULT NOW();
