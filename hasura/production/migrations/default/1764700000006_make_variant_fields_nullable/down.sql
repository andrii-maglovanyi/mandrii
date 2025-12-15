-- Rollback: Restore NOT NULL constraints on variant fields

-- 1. Drop the new unique indexes
DROP INDEX IF EXISTS public.idx_product_variants_with_color;
DROP INDEX IF EXISTS public.idx_product_variants_without_color;
DROP INDEX IF EXISTS public.idx_product_variants_non_clothing;

-- 2. Delete any variants with NULL values (they wouldn't be valid after rollback)
DELETE FROM public.product_variants 
WHERE gender IS NULL OR age_group IS NULL OR size IS NULL;

-- 3. Restore NOT NULL constraints
ALTER TABLE public.product_variants 
ALTER COLUMN gender SET NOT NULL;

ALTER TABLE public.product_variants 
ALTER COLUMN age_group SET NOT NULL;

ALTER TABLE public.product_variants 
ALTER COLUMN size SET NOT NULL;

-- 4. Restore the original unique constraint
ALTER TABLE public.product_variants 
ADD CONSTRAINT product_variants_product_id_gender_age_group_size_key 
UNIQUE (product_id, gender, age_group, size);

-- 5. Remove the comment
COMMENT ON TABLE public.product_variants IS NULL;
