CREATE TABLE public.community_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('REQUEST', 'OFFER')),
  category text NOT NULL CHECK (category IN (
    'PRACTICAL_SUPPORT',
    'FAMILY_AND_CHILDREN',
    'LANGUAGE_AND_TRANSLATION',
    'WORK_AND_SKILLS',
    'HOUSING_AND_ITEMS',
    'COMMUNITY_AND_VOLUNTEERING'
  )),
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 5 AND 120),
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 20 AND 1500),
  country text NOT NULL CHECK (char_length(btrim(country)) BETWEEN 2 AND 100),
  city text CHECK (city IS NULL OR char_length(btrim(city)) BETWEEN 2 AND 100),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  expires_at timestamptz NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  CONSTRAINT community_requests_expiry_after_creation CHECK (expires_at > created_at)
);

CREATE INDEX community_requests_discovery_idx
  ON public.community_requests (country, city, created_at DESC, id DESC)
  WHERE status = 'OPEN';

CREATE INDEX community_requests_author_idx
  ON public.community_requests (user_id, created_at DESC, id DESC);

CREATE TRIGGER community_requests_update_timestamp
BEFORE UPDATE ON public.community_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
