-- Simplify enum tables to just have 'value' column
-- Labels and translations are handled in frontend constants

-- clothing_type: drop label columns
ALTER TABLE public.clothing_type DROP COLUMN IF EXISTS label_en;
ALTER TABLE public.clothing_type DROP COLUMN IF EXISTS label_uk;
ALTER TABLE public.clothing_type DROP COLUMN IF EXISTS sort_order;

-- clothing_gender: drop label columns
ALTER TABLE public.clothing_gender DROP COLUMN IF EXISTS label_en;
ALTER TABLE public.clothing_gender DROP COLUMN IF EXISTS label_uk;
ALTER TABLE public.clothing_gender DROP COLUMN IF EXISTS sort_order;

-- clothing_age_group: drop label columns
ALTER TABLE public.clothing_age_group DROP COLUMN IF EXISTS label_en;
ALTER TABLE public.clothing_age_group DROP COLUMN IF EXISTS label_uk;
ALTER TABLE public.clothing_age_group DROP COLUMN IF EXISTS sort_order;

-- clothing_size: drop label columns and age_group FK (mapping handled in frontend)
ALTER TABLE public.clothing_size DROP COLUMN IF EXISTS label_en;
ALTER TABLE public.clothing_size DROP COLUMN IF EXISTS label_uk;
ALTER TABLE public.clothing_size DROP COLUMN IF EXISTS sort_order;
ALTER TABLE public.clothing_size DROP COLUMN IF EXISTS age_group;

-- order_status: drop label columns
ALTER TABLE public.order_status DROP COLUMN IF EXISTS label_en;
ALTER TABLE public.order_status DROP COLUMN IF EXISTS label_uk;
ALTER TABLE public.order_status DROP COLUMN IF EXISTS sort_order;

-- product_status: already simple (just value + description) - keep description
