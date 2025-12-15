-- Add color column to product_variants
-- Color is optional - if null, the product doesn't have color variants

ALTER TABLE public.product_variants
ADD COLUMN color text;

-- Add index for color filtering
CREATE INDEX idx_product_variants_color ON public.product_variants USING btree (color) WHERE color IS NOT NULL;

-- Update unique constraint to include color (drop old, add new)
ALTER TABLE public.product_variants
DROP CONSTRAINT product_variants_product_id_gender_age_group_size_key;

ALTER TABLE public.product_variants
ADD CONSTRAINT product_variants_product_id_gender_age_group_size_color_key
UNIQUE (product_id, gender, age_group, size, color);

COMMENT ON COLUMN public.product_variants.color IS 'Optional color variant (e.g., black, white, blue). NULL means no color option.';
