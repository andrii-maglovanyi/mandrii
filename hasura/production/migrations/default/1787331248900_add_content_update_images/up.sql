ALTER TABLE public.content_updates
  ADD COLUMN images text[] NOT NULL DEFAULT '{}',
  ADD CONSTRAINT content_updates_images_count_check CHECK (cardinality(images) <= 5);
