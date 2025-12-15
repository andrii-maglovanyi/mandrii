-- =====================================================
-- Rollback: Rename Clothing Size Values
-- =====================================================

-- Step 1: Temporarily disable the foreign key constraint
ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_size_fkey;

-- Step 2: Update the values in product_variants back to original
-- Adult sizes
UPDATE public.product_variants SET size = '2xl' WHERE size = 'xxl';
UPDATE public.product_variants SET size = '3xl' WHERE size = 'xxxl';
-- Kids sizes
UPDATE public.product_variants SET size = '3-4y' WHERE size = 'y3_4';
UPDATE public.product_variants SET size = '5-6y' WHERE size = 'y5_6';
UPDATE public.product_variants SET size = '7-8y' WHERE size = 'y7_8';
UPDATE public.product_variants SET size = '9-10y' WHERE size = 'y9_10';
UPDATE public.product_variants SET size = '11-12y' WHERE size = 'y11_12';
UPDATE public.product_variants SET size = '13-14y' WHERE size = 'y13_14';

-- Step 3: Restore the original values in clothing_size
DELETE FROM public.clothing_size WHERE value IN ('xxl', 'xxxl', 'y3_4', 'y5_6', 'y7_8', 'y9_10', 'y11_12', 'y13_14');

INSERT INTO public.clothing_size (value) VALUES
    ('2xl'),
    ('3xl'),
    ('3-4y'),
    ('5-6y'),
    ('7-8y'),
    ('9-10y'),
    ('11-12y'),
    ('13-14y');

-- Step 4: Re-add the foreign key constraint
ALTER TABLE public.product_variants 
    ADD CONSTRAINT product_variants_size_fkey 
    FOREIGN KEY (size) REFERENCES public.clothing_size(value);
