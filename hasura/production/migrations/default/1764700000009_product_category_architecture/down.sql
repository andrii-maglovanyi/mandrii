-- =====================================================
-- Rollback: Product Category Architecture Migration
-- =====================================================

-- -----------------------------------------------------
-- 1. RESTORE CLOTHING_TYPE COLUMN ON PRODUCTS
-- -----------------------------------------------------

-- Re-add clothing_type column
ALTER TABLE public.products 
    ADD COLUMN clothing_type text REFERENCES public.clothing_type(value);

-- Restore data from clothing_product_details
UPDATE public.products p
SET clothing_type = cpd.clothing_type
FROM public.clothing_product_details cpd
WHERE p.id = cpd.product_id;

-- Restore index
CREATE INDEX idx_products_clothing_type ON public.products USING btree (clothing_type);

-- -----------------------------------------------------
-- 2. DROP CATEGORY FOREIGN KEY CONSTRAINT
-- -----------------------------------------------------

ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_fkey;

-- -----------------------------------------------------
-- 3. DROP CLOTHING_PRODUCT_DETAILS TABLE
-- -----------------------------------------------------

DROP TABLE IF EXISTS public.clothing_product_details;

-- -----------------------------------------------------
-- 4. DROP PRODUCT_CATEGORY ENUM TABLE
-- -----------------------------------------------------

DROP TABLE IF EXISTS public.product_category;
