-- Levels are calculated from the authoritative points balance, rather than
-- persisted separately where they could become inconsistent.
ALTER TABLE public.users DROP COLUMN level;

CREATE TABLE public.user_point_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity text NOT NULL CHECK (activity IN ('VENUE_CREATED', 'EVENT_CREATED')),
  source_id uuid NOT NULL,
  points integer NOT NULL CHECK (points > 0),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (activity, source_id)
);

-- Record the existing creation activity without changing the already-awarded
-- balances in users.points. Imported or manually adjusted points can therefore
-- remain valid even if they do not have a matching historical event.
INSERT INTO public.user_point_events (user_id, activity, source_id, points, created_at)
SELECT user_id, 'VENUE_CREATED', id, 20, created_at
FROM public.venues
WHERE user_id IS NOT NULL
ON CONFLICT (activity, source_id) DO NOTHING;

INSERT INTO public.user_point_events (user_id, activity, source_id, points, created_at)
SELECT user_id, 'EVENT_CREATED', id, 15, created_at
FROM public.events
WHERE user_id IS NOT NULL
ON CONFLICT (activity, source_id) DO NOTHING;

CREATE INDEX user_point_events_user_created_at_idx
  ON public.user_point_events (user_id, created_at DESC);

CREATE INDEX user_point_events_created_at_user_idx
  ON public.user_point_events (created_at DESC, user_id);

CREATE INDEX users_public_leaderboard_idx
  ON public.users (points DESC, joined_at ASC NULLS LAST, id)
  WHERE role <> 'admin' AND status = 'active' AND points > 0;
