-- Add idempotency_key column to orders table for deduplication
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);

COMMENT ON COLUMN public.orders.idempotency_key IS 'Unique key for order deduplication (hash of cart + email)';
