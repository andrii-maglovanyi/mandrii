-- Create events_event_tags junction table for many-to-many relationship
CREATE TABLE public.events_event_tags (
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.event_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, tag_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster joins
CREATE INDEX idx_events_event_tags_event_id ON public.events_event_tags(event_id);
CREATE INDEX idx_events_event_tags_tag_id ON public.events_event_tags(tag_id);

COMMENT ON TABLE public.events_event_tags IS 'Many-to-many relationship between events and tags';
