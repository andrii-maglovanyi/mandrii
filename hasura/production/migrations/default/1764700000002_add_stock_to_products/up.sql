-- Add stock column to products table for products without variants
-- This allows simple products (like accessories) to have stock tracking

ALTER TABLE public.products
ADD COLUMN stock integer CHECK (stock IS NULL OR stock >= 0);

COMMENT ON COLUMN public.products.stock IS 'Stock count for products without variants. NULL means stock is managed at variant level.';

-- Add index for stock queries
CREATE INDEX idx_products_stock ON public.products USING btree (stock) WHERE stock IS NOT NULL AND stock > 0;
