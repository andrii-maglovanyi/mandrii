-- Revert color column addition

-- Drop the new unique constraint
ALTER TABLE public.product_variants
DROP CONSTRAINT IF EXISTS product_variants_product_id_gender_age_group_size_color_key;

-- Restore the original unique constraint (without color)
ALTER TABLE public.product_variants
ADD CONSTRAINT product_variants_product_id_gender_age_group_size_key
UNIQUE (product_id, gender, age_group, size);

-- Drop the color index
DROP INDEX IF EXISTS idx_product_variants_color;

-- Drop the color column
ALTER TABLE public.product_variants
DROP COLUMN IF EXISTS color;
