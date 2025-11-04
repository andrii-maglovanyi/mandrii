-- Create event_tags table
CREATE TABLE public.event_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_event_tags_category ON public.event_tags(category);

-- Insert some common tags
INSERT INTO public.event_tags (name, slug, category) VALUES
  ('Family Friendly', 'family-friendly', 'audience'),
  ('Outdoor', 'outdoor', 'format'),
  ('Indoor', 'indoor', 'format'),
  ('Cultural', 'cultural', 'theme'),
  ('Music', 'music', 'theme'),
  ('Food & Drink', 'food-drink', 'theme'),
  ('Kids', 'kids', 'audience'),
  ('Adults Only', 'adults-only', 'audience'),
  ('Free Admission', 'free-admission', 'format'),
  ('Ukrainian Language', 'ukrainian-language', 'language'),
  ('English Language', 'english-language', 'language'),
  ('Accessible', 'accessible', 'format');

COMMENT ON TABLE public.event_tags IS 'Tags for categorizing and filtering events';
