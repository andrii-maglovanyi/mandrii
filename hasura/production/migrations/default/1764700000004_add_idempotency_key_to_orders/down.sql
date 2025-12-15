-- Remove idempotency_key column from orders table
DROP INDEX IF EXISTS public.idx_orders_idempotency_key;
ALTER TABLE public.orders DROP COLUMN IF EXISTS idempotency_key;
