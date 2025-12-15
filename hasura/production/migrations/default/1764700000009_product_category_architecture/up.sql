-- =====================================================
-- Product Category Architecture Migration
-- =====================================================
-- This migration implements category-based product architecture:
-- 1. Creates product_category enum table
-- 2. Creates clothing_product_details table (one-to-one with products)
-- 3. Migrates existing clothing_type data to details table
-- 4. Updates products table to use category enum
-- =====================================================

-- -----------------------------------------------------
-- 1. CREATE PRODUCT_CATEGORY ENUM TABLE
-- -----------------------------------------------------

CREATE TABLE public.product_category (
    value text NOT NULL PRIMARY KEY
);

COMMENT ON TABLE public.product_category IS 'Enum table for product categories';

INSERT INTO public.product_category (value) VALUES
    ('clothing'),
    ('accessories'),
    ('gifts');

-- -----------------------------------------------------
-- 2. CREATE CLOTHING_PRODUCT_DETAILS TABLE
-- -----------------------------------------------------

CREATE TABLE public.clothing_product_details (
    product_id uuid NOT NULL PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
    clothing_type text NOT NULL REFERENCES public.clothing_type(value),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clothing_product_details IS 'Category-specific details for clothing products';
COMMENT ON COLUMN public.clothing_product_details.product_id IS 'One-to-one relationship with products table';
COMMENT ON COLUMN public.clothing_product_details.clothing_type IS 'Type of clothing (tshirt, hoodie, etc.)';

-- Index for clothing_type lookups
CREATE INDEX idx_clothing_product_details_clothing_type 
    ON public.clothing_product_details USING btree (clothing_type);

-- Trigger for updated_at
CREATE TRIGGER set_public_clothing_product_details_updated_at
    BEFORE UPDATE ON public.clothing_product_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------
-- 3. MIGRATE EXISTING DATA
-- -----------------------------------------------------

-- Move clothing_type data to the new details table
INSERT INTO public.clothing_product_details (product_id, clothing_type)
SELECT id, clothing_type
FROM public.products
WHERE clothing_type IS NOT NULL;

-- -----------------------------------------------------
-- 4. UPDATE PRODUCTS TABLE
-- -----------------------------------------------------

-- Drop the old clothing_type column (data is now in clothing_product_details)
DROP INDEX IF EXISTS idx_products_clothing_type;
ALTER TABLE public.products DROP COLUMN clothing_type;

-- Add foreign key constraint to product_category enum
ALTER TABLE public.products 
    ADD CONSTRAINT products_category_fkey 
    FOREIGN KEY (category) REFERENCES public.product_category(value);

-- Add index for category (if not exists)
-- Note: idx_products_category already exists from initial migration
