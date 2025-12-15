-- Restore label columns to enum tables

-- clothing_type
ALTER TABLE public.clothing_type ADD COLUMN label_en text;
ALTER TABLE public.clothing_type ADD COLUMN label_uk text;
ALTER TABLE public.clothing_type ADD COLUMN sort_order integer DEFAULT 0;
UPDATE public.clothing_type SET label_en = value, label_uk = value, sort_order = 0;
ALTER TABLE public.clothing_type ALTER COLUMN label_en SET NOT NULL;
ALTER TABLE public.clothing_type ALTER COLUMN label_uk SET NOT NULL;
ALTER TABLE public.clothing_type ALTER COLUMN sort_order SET NOT NULL;

-- clothing_gender
ALTER TABLE public.clothing_gender ADD COLUMN label_en text;
ALTER TABLE public.clothing_gender ADD COLUMN label_uk text;
ALTER TABLE public.clothing_gender ADD COLUMN sort_order integer DEFAULT 0;
UPDATE public.clothing_gender SET label_en = value, label_uk = value, sort_order = 0;
ALTER TABLE public.clothing_gender ALTER COLUMN label_en SET NOT NULL;
ALTER TABLE public.clothing_gender ALTER COLUMN label_uk SET NOT NULL;
ALTER TABLE public.clothing_gender ALTER COLUMN sort_order SET NOT NULL;

-- clothing_age_group
ALTER TABLE public.clothing_age_group ADD COLUMN label_en text;
ALTER TABLE public.clothing_age_group ADD COLUMN label_uk text;
ALTER TABLE public.clothing_age_group ADD COLUMN sort_order integer DEFAULT 0;
UPDATE public.clothing_age_group SET label_en = value, label_uk = value, sort_order = 0;
ALTER TABLE public.clothing_age_group ALTER COLUMN label_en SET NOT NULL;
ALTER TABLE public.clothing_age_group ALTER COLUMN label_uk SET NOT NULL;
ALTER TABLE public.clothing_age_group ALTER COLUMN sort_order SET NOT NULL;

-- clothing_size
ALTER TABLE public.clothing_size ADD COLUMN label_en text;
ALTER TABLE public.clothing_size ADD COLUMN label_uk text;
ALTER TABLE public.clothing_size ADD COLUMN sort_order integer DEFAULT 0;
UPDATE public.clothing_size SET label_en = value, label_uk = value, sort_order = 0;
ALTER TABLE public.clothing_size ALTER COLUMN label_en SET NOT NULL;
ALTER TABLE public.clothing_size ALTER COLUMN label_uk SET NOT NULL;
ALTER TABLE public.clothing_size ALTER COLUMN sort_order SET NOT NULL;

-- order_status
ALTER TABLE public.order_status ADD COLUMN label_en text;
ALTER TABLE public.order_status ADD COLUMN label_uk text;
ALTER TABLE public.order_status ADD COLUMN sort_order integer DEFAULT 0;
UPDATE public.order_status SET label_en = value, label_uk = value, sort_order = 0;
ALTER TABLE public.order_status ALTER COLUMN label_en SET NOT NULL;
ALTER TABLE public.order_status ALTER COLUMN label_uk SET NOT NULL;
ALTER TABLE public.order_status ALTER COLUMN sort_order SET NOT NULL;
