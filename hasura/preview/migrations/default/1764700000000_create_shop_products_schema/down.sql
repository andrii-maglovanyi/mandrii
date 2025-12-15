-- =====================================================
-- Shop Products Schema Rollback
-- =====================================================
-- Drops all tables created in up.sql
-- in reverse dependency order
-- =====================================================

-- Drop order items first (depends on orders, products, variants)
DROP TABLE IF EXISTS public.order_items CASCADE;

-- Drop orders (depends on order_status, users)
DROP TABLE IF EXISTS public.orders CASCADE;

-- Drop order status enum
DROP TABLE IF EXISTS public.order_status CASCADE;

-- Drop product variants (depends on products, enums)
DROP TABLE IF EXISTS public.product_variants CASCADE;

-- Drop products (depends on enums, venues, users)
DROP TABLE IF EXISTS public.products CASCADE;

-- Drop product status enum
DROP TABLE IF EXISTS public.product_status CASCADE;

-- Drop clothing enums (in dependency order)
DROP TABLE IF EXISTS public.clothing_size CASCADE;
DROP TABLE IF EXISTS public.clothing_age_group CASCADE;
DROP TABLE IF EXISTS public.clothing_gender CASCADE;
DROP TABLE IF EXISTS public.clothing_type CASCADE;
