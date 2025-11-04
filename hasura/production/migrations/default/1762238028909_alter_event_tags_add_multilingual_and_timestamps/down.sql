-- Rollback: remove multilingual fields and updated_at
DROP TRIGGER IF EXISTS set_public_event_tags_updated_at ON public.event_tags;

-- Re-add single name column
ALTER TABLE public.event_tags
  ADD COLUMN name TEXT;

-- Copy name_en back to name
UPDATE public.event_tags SET name = name_en;

-- Drop the multilingual columns and updated_at
ALTER TABLE public.event_tags
  DROP COLUMN name_en,
  DROP COLUMN name_uk,
  DROP COLUMN updated_at,
  ALTER COLUMN name SET NOT NULL;
