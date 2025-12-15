-- Revert stock column addition

DROP INDEX IF EXISTS idx_products_stock;

ALTER TABLE public.products
DROP COLUMN IF EXISTS stock;
