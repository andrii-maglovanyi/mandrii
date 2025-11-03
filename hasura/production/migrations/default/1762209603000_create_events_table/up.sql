-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core Info
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_uk TEXT,
  
  -- Date/Time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  
  -- Event Type (foreign key to event_type table)
  event_type TEXT NOT NULL REFERENCES public.event_type(value),
  
  -- Location (flexible - one of three options)
  venue_id UUID REFERENCES public.venues(id),
  custom_location_name TEXT,
  custom_location_address TEXT,
  geo GEOGRAPHY(POINT, 4326),
  city TEXT,
  country TEXT,
  is_online BOOLEAN DEFAULT false,
  
  -- Media
  image TEXT,
  images TEXT[],
  
  -- Organizer
  organizer_name TEXT NOT NULL,
  organizer_contact TEXT,
  
  -- Pricing (foreign key to price_type table)
  price_type TEXT NOT NULL REFERENCES public.price_type(value),
  price_amount NUMERIC(10,2),
  price_currency TEXT DEFAULT 'EUR',
  
  -- Registration
  registration_url TEXT,
  registration_required BOOLEAN DEFAULT false,
  external_url TEXT,
  
  -- Social & Metadata
  social_links JSONB DEFAULT '{}',
  language TEXT[],
  capacity INTEGER,
  age_restriction TEXT,
  accessibility_info TEXT,
  
  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  
  -- Admin (foreign key to event_status table)
  status TEXT NOT NULL DEFAULT 'PENDING' REFERENCES public.event_status(value),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  owner_id UUID REFERENCES public.users(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_venue_id ON public.events(venue_id);
CREATE INDEX idx_events_user_id ON public.events(user_id);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_geo ON public.events USING GIST(geo);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_price_type ON public.events(price_type);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER set_public_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();

COMMENT ON TABLE public.events IS 'Events at Ukrainian venues or custom locations';
