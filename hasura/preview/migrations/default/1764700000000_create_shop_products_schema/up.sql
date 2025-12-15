-- =====================================================
-- Shop Products Schema Migration
-- =====================================================
-- This migration creates the complete schema for the
-- e-commerce shop with products, variants, and cart.
-- =====================================================

-- -----------------------------------------------------
-- 1. ENUM TABLES (for Hasura enum support)
-- -----------------------------------------------------

-- Clothing type enum
CREATE TABLE public.clothing_type (
    value text NOT NULL PRIMARY KEY,
    label_en text NOT NULL,
    label_uk text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.clothing_type (value, label_en, label_uk, sort_order) VALUES
    ('tshirt', 'T-Shirt', 'Футболка', 1),
    ('sweatshirt', 'Sweatshirt', 'Світшот', 2),
    ('jumper', 'Jumper', 'Джемпер', 3),
    ('hoodie', 'Hoodie', 'Худі', 4);

-- Clothing gender enum
CREATE TABLE public.clothing_gender (
    value text NOT NULL PRIMARY KEY,
    label_en text NOT NULL,
    label_uk text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.clothing_gender (value, label_en, label_uk, sort_order) VALUES
    ('men', 'Men', 'Чоловічий', 1),
    ('women', 'Women', 'Жіночий', 2),
    ('unisex', 'Unisex', 'Унісекс', 3);

-- Clothing age group enum
CREATE TABLE public.clothing_age_group (
    value text NOT NULL PRIMARY KEY,
    label_en text NOT NULL,
    label_uk text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.clothing_age_group (value, label_en, label_uk, sort_order) VALUES
    ('adult', 'Adult', 'Дорослий', 1),
    ('kids', 'Kids', 'Дитячий', 2);

-- Clothing size enum (combined adult and kids sizes)
CREATE TABLE public.clothing_size (
    value text NOT NULL PRIMARY KEY,
    label_en text NOT NULL,
    label_uk text NOT NULL,
    age_group text NOT NULL REFERENCES public.clothing_age_group(value),
    sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.clothing_size (value, label_en, label_uk, age_group, sort_order) VALUES
    -- Adult sizes
    ('xs', 'XS', 'XS', 'adult', 1),
    ('s', 'S', 'S', 'adult', 2),
    ('m', 'M', 'M', 'adult', 3),
    ('l', 'L', 'L', 'adult', 4),
    ('xl', 'XL', 'XL', 'adult', 5),
    ('2xl', '2XL', '2XL', 'adult', 6),
    ('3xl', '3XL', '3XL', 'adult', 7),
    -- Kids sizes
    ('3-4y', '3-4 years', '3-4 роки', 'kids', 10),
    ('5-6y', '5-6 years', '5-6 років', 'kids', 11),
    ('7-8y', '7-8 years', '7-8 років', 'kids', 12),
    ('9-10y', '9-10 years', '9-10 років', 'kids', 13),
    ('11-12y', '11-12 years', '11-12 років', 'kids', 14),
    ('13-14y', '13-14 years', '13-14 років', 'kids', 15);

-- Product status enum
CREATE TABLE public.product_status (
    value text NOT NULL PRIMARY KEY,
    description text
);

INSERT INTO public.product_status (value, description) VALUES
    ('DRAFT', 'Product is being prepared, not visible to customers'),
    ('ACTIVE', 'Product is visible and available for purchase'),
    ('OUT_OF_STOCK', 'Product is visible but cannot be purchased'),
    ('ARCHIVED', 'Product is no longer available');

-- -----------------------------------------------------
-- 2. PRODUCTS TABLE
-- -----------------------------------------------------

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    
    -- Basic info
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description_en text,
    description_uk text,
    
    -- Categorization
    category text NOT NULL DEFAULT 'clothing',
    clothing_type text REFERENCES public.clothing_type(value),
    
    -- Pricing (stored in minor units, e.g., cents/pence)
    price_minor integer NOT NULL CHECK (price_minor >= 0),
    currency text NOT NULL DEFAULT 'GBP',
    
    -- Display
    images text[],
    badge text, -- e.g., "New", "Bestseller", "Limited"
    
    -- Status
    status text NOT NULL DEFAULT 'DRAFT' REFERENCES public.product_status(value),
    
    -- Associations (optional - product can belong to a venue)
    venue_id uuid REFERENCES public.venues(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Indexes for products
CREATE INDEX idx_products_slug ON public.products USING btree (slug);
CREATE INDEX idx_products_category ON public.products USING btree (category);
CREATE INDEX idx_products_clothing_type ON public.products USING btree (clothing_type);
CREATE INDEX idx_products_status ON public.products USING btree (status);
CREATE INDEX idx_products_venue_id ON public.products USING btree (venue_id);

-- Trigger for updated_at
CREATE TRIGGER set_public_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------
-- 3. PRODUCT VARIANTS TABLE (for size/gender/age combos)
-- -----------------------------------------------------

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    
    -- Variant attributes
    gender text NOT NULL REFERENCES public.clothing_gender(value),
    age_group text NOT NULL REFERENCES public.clothing_age_group(value),
    size text NOT NULL REFERENCES public.clothing_size(value),
    
    -- Stock management
    stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku text, -- Stock Keeping Unit (optional barcode/internal reference)
    
    -- Optional price override (if null, use product base price)
    price_override_minor integer CHECK (price_override_minor >= 0),
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    -- Ensure unique variant per product
    UNIQUE (product_id, gender, age_group, size)
);

-- Indexes for product_variants
CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);
CREATE INDEX idx_product_variants_gender ON public.product_variants USING btree (gender);
CREATE INDEX idx_product_variants_age_group ON public.product_variants USING btree (age_group);
CREATE INDEX idx_product_variants_size ON public.product_variants USING btree (size);
CREATE INDEX idx_product_variants_stock ON public.product_variants USING btree (stock) WHERE stock > 0;

-- Trigger for updated_at
CREATE TRIGGER set_public_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------
-- 4. ORDERS TABLE
-- -----------------------------------------------------

-- Order status enum
CREATE TABLE public.order_status (
    value text NOT NULL PRIMARY KEY,
    label_en text NOT NULL,
    label_uk text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO public.order_status (value, label_en, label_uk, sort_order) VALUES
    ('pending', 'Pending', 'Очікує', 1),
    ('paid', 'Paid', 'Оплачено', 2),
    ('processing', 'Processing', 'Обробляється', 3),
    ('shipped', 'Shipped', 'Відправлено', 4),
    ('delivered', 'Delivered', 'Доставлено', 5),
    ('cancelled', 'Cancelled', 'Скасовано', 6),
    ('refunded', 'Refunded', 'Повернуто', 7);

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    
    -- Customer info
    user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    email text NOT NULL,
    
    -- Totals (in minor units)
    subtotal_minor integer NOT NULL CHECK (subtotal_minor >= 0),
    total_minor integer NOT NULL CHECK (total_minor >= 0),
    currency text NOT NULL DEFAULT 'GBP',
    
    -- Status
    status text NOT NULL DEFAULT 'pending' REFERENCES public.order_status(value),
    
    -- Payment info (Stripe)
    payment_intent_id text,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for orders
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER set_public_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- -----------------------------------------------------
-- 5. ORDER ITEMS TABLE
-- -----------------------------------------------------

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    
    -- Product reference
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
    
    -- Pricing
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price_minor integer NOT NULL CHECK (unit_price_minor >= 0),
    currency text NOT NULL DEFAULT 'GBP',
    
    -- Snapshot at purchase time (in case product changes)
    name_snapshot text NOT NULL,
    metadata jsonb, -- variant details (gender, age_group, size)
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for order_items
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items USING btree (product_id);

-- -----------------------------------------------------
-- 6. COMMENTS FOR DOCUMENTATION
-- -----------------------------------------------------

COMMENT ON TABLE public.products IS 'Shop products available for purchase';
COMMENT ON TABLE public.product_variants IS 'Size/gender/age variants with stock levels';
COMMENT ON TABLE public.orders IS 'Customer orders with payment status';
COMMENT ON TABLE public.order_items IS 'Individual items within an order';
COMMENT ON COLUMN public.products.price_minor IS 'Price in minor currency units (e.g., pence for GBP)';
COMMENT ON COLUMN public.product_variants.price_override_minor IS 'Optional variant-specific price override';
