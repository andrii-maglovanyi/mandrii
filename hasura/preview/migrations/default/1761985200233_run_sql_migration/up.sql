CREATE TABLE chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_uk TEXT,
  logo TEXT,
  category TEXT REFERENCES venue_category(value),
  country TEXT,
  city TEXT,
  phone_numbers TEXT[],
  emails TEXT[],
  website TEXT,
  social_links JSON NOT NULL DEFAULT '{}',
  user_id UUID NOT NULL,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
