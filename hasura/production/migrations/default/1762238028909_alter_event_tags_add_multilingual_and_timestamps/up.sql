-- Add multilingual name fields and updated_at timestamp
ALTER TABLE public.event_tags
  ADD COLUMN name_en TEXT,
  ADD COLUMN name_uk TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Copy existing name to name_en
UPDATE public.event_tags SET name_en = name;

-- Add Ukrainian translations for existing tags
UPDATE public.event_tags SET name_uk = 'Сімейний' WHERE slug = 'family-friendly';
UPDATE public.event_tags SET name_uk = 'На відкритому повітрі' WHERE slug = 'outdoor';
UPDATE public.event_tags SET name_uk = 'В приміщенні' WHERE slug = 'indoor';
UPDATE public.event_tags SET name_uk = 'Культурний' WHERE slug = 'cultural';
UPDATE public.event_tags SET name_uk = 'Музика' WHERE slug = 'music';
UPDATE public.event_tags SET name_uk = 'Їжа та напої' WHERE slug = 'food-drink';
UPDATE public.event_tags SET name_uk = 'Для дітей' WHERE slug = 'kids';
UPDATE public.event_tags SET name_uk = 'Тільки для дорослих' WHERE slug = 'adults-only';
UPDATE public.event_tags SET name_uk = 'Безкоштовний вхід' WHERE slug = 'free-admission';
UPDATE public.event_tags SET name_uk = 'Українською мовою' WHERE slug = 'ukrainian-language';
UPDATE public.event_tags SET name_uk = 'Англійською мовою' WHERE slug = 'english-language';
UPDATE public.event_tags SET name_uk = 'Доступний' WHERE slug = 'accessible';

-- Drop old name column and make new ones NOT NULL
ALTER TABLE public.event_tags
  DROP COLUMN name,
  ALTER COLUMN name_en SET NOT NULL,
  ALTER COLUMN name_uk SET NOT NULL;

-- Add trigger to update updated_at on changes
CREATE TRIGGER set_public_event_tags_updated_at
  BEFORE UPDATE ON public.event_tags
  FOR EACH ROW
  EXECUTE FUNCTION public.set_current_timestamp_updated_at();
