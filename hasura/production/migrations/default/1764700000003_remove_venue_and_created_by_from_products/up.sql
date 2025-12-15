-- Remove venue_id and created_by from products table
-- These are not needed for a simple single-seller shop

-- Drop the venue_id index first
DROP INDEX IF EXISTS idx_products_venue_id;

-- Drop the columns
ALTER TABLE public.products
DROP COLUMN IF EXISTS venue_id,
DROP COLUMN IF EXISTS created_by;
