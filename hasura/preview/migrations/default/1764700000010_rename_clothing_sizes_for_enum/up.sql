-- =====================================================
-- Rename Clothing Size Values for GraphQL Enum Compatibility
-- =====================================================
-- GraphQL enum identifiers must match [_A-Za-z][_0-9A-Za-z]*
-- This migration renames values with hyphens to use underscores
-- and prefixes numeric-starting values.
-- =====================================================

-- Step 1: Temporarily disable the foreign key constraint
ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_size_fkey;

-- Step 2: Update the values in product_variants first
-- Adult sizes starting with numbers
UPDATE public.product_variants SET size = 'xxl' WHERE size = '2xl';
UPDATE public.product_variants SET size = 'xxxl' WHERE size = '3xl';
-- Kids sizes with hyphens
UPDATE public.product_variants SET size = 'y3_4' WHERE size = '3-4y';
UPDATE public.product_variants SET size = 'y5_6' WHERE size = '5-6y';
UPDATE public.product_variants SET size = 'y7_8' WHERE size = '7-8y';
UPDATE public.product_variants SET size = 'y9_10' WHERE size = '9-10y';
UPDATE public.product_variants SET size = 'y11_12' WHERE size = '11-12y';
UPDATE public.product_variants SET size = 'y13_14' WHERE size = '13-14y';

-- Step 3: Update the primary key values in clothing_size
-- We need to delete and re-insert because we're changing the primary key
DELETE FROM public.clothing_size WHERE value IN ('2xl', '3xl', '3-4y', '5-6y', '7-8y', '9-10y', '11-12y', '13-14y');

INSERT INTO public.clothing_size (value) VALUES
    ('xxl'),
    ('xxxl'),
    ('y3_4'),
    ('y5_6'),
    ('y7_8'),
    ('y9_10'),
    ('y11_12'),
    ('y13_14');

-- Step 4: Re-add the foreign key constraint
ALTER TABLE public.product_variants 
    ADD CONSTRAINT product_variants_size_fkey 
    FOREIGN KEY (size) REFERENCES public.clothing_size(value);
