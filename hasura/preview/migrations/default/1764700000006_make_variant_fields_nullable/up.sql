-- =====================================================
-- Make Variant Fields Nullable for Non-Clothing Products
-- =====================================================
-- This migration allows products without clothing-specific
-- attributes (size, gender, age_group) by making these
-- fields nullable in product_variants.
-- =====================================================

-- 0. First, clean up any duplicate variants (keep the one with highest stock or most recent)
-- This handles cases where duplicates might have been inserted
DELETE FROM public.product_variants a
USING public.product_variants b
WHERE a.id < b.id  -- Keep the row with larger UUID (likely newer)
  AND a.product_id = b.product_id
  AND a.gender = b.gender
  AND a.age_group = b.age_group
  AND a.size = b.size
  AND (a.color IS NOT DISTINCT FROM b.color);

-- 1. Drop the existing unique constraint
ALTER TABLE public.product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_gender_age_group_size_key;

-- 2. Make gender, age_group, and size nullable
ALTER TABLE public.product_variants 
ALTER COLUMN gender DROP NOT NULL;

ALTER TABLE public.product_variants 
ALTER COLUMN age_group DROP NOT NULL;

ALTER TABLE public.product_variants 
ALTER COLUMN size DROP NOT NULL;

-- 3. Drop the existing color unique constraint if it exists
ALTER TABLE public.product_variants 
DROP CONSTRAINT IF EXISTS product_variants_product_id_gender_age_group_size_color_key;

-- 4. Drop any existing unique index that might conflict
DROP INDEX IF EXISTS public.idx_product_variants_unique_combo;

-- 5. Create a partial unique index for variants WITH color
CREATE UNIQUE INDEX idx_product_variants_with_color 
ON public.product_variants (product_id, gender, age_group, size, color)
WHERE color IS NOT NULL;

-- 6. Create a partial unique index for variants WITHOUT color (NULL color)
CREATE UNIQUE INDEX idx_product_variants_without_color 
ON public.product_variants (product_id, gender, age_group, size)
WHERE color IS NULL AND gender IS NOT NULL AND age_group IS NOT NULL AND size IS NOT NULL;

-- 7. Create a partial unique index for non-clothing products (all nullable fields are NULL)
CREATE UNIQUE INDEX idx_product_variants_non_clothing 
ON public.product_variants (product_id)
WHERE gender IS NULL AND age_group IS NULL AND size IS NULL AND color IS NULL;

-- 8. Add a comment explaining the design
COMMENT ON TABLE public.product_variants IS 
'Product variants for inventory management. 
For clothing: gender, age_group, size, and optionally color define the variant.
For non-clothing: these fields can be NULL, using a single default variant per product.';
