ALTER TABLE public.content_updates
  DROP CONSTRAINT content_updates_images_count_check,
  DROP COLUMN images;
