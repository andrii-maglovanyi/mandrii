-- Restore venue_id and created_by columns to products table

ALTER TABLE public.products
ADD COLUMN venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
ADD COLUMN created_by uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Restore the index
CREATE INDEX idx_products_venue_id ON public.products USING btree (venue_id);
