ALTER TABLE public.content_updates
  DROP CONSTRAINT content_updates_images_count_check,
  ADD CONSTRAINT content_updates_images_count_check CHECK (cardinality(images) <= 3);
