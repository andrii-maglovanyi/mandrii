-- Seed data for shop products and variants
-- This creates sample products for testing the shop functionality

-- ============================================================================
-- PRODUCTS - Use UPSERT with slug as unique key
-- ============================================================================

INSERT INTO public.products (id, name, slug, description_en, description_uk, category, price_minor, currency, images, badge, status)
VALUES
  (
    'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
    'Mandrii Trident T-Shirt',
    'mandrii-trident-tshirt',
    'Premium cotton t-shirt featuring the Mandrii trident design. Comfortable fit, pre-shrunk fabric, available in multiple sizes for adults and kids.',
    'Преміум бавовняна футболка з дизайном тризуба Мандрій. Комфортний крій, попередньо усаджена тканина, доступна в різних розмірах для дорослих та дітей.',
    'clothing',
    2500,
    'GBP',
    ARRAY['shop/tshirt-trident-front.webp', 'shop/tshirt-trident-back.webp', 'shop/tshirt-trident-detail.webp'],
    'New',
    'ACTIVE'
  ),
  (
    'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
    'Sunflower Embroidered Sweatshirt',
    'sunflower-sweatshirt',
    'Cozy crew neck sweatshirt with embroidered Ukrainian sunflower design. Fleece-lined interior, ribbed cuffs, perfect for autumn weather.',
    'Затишний світшот з вишитим українським соняшником. Флісова підкладка, манжети в рубчик, ідеально для осінньої погоди.',
    'clothing',
    4000,
    'GBP',
    ARRAY['shop/sweatshirt-sunflower-front.webp', 'shop/sweatshirt-sunflower-back.webp'],
    'Bestseller',
    'ACTIVE'
  ),
  (
    'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
    'Stand with Ukraine T-Shirt',
    'stand-with-ukraine-tshirt',
    'Lightweight t-shirt with the classic Stand with Ukraine message. 100% organic cotton, ethically made.',
    'Легка футболка з класичним написом Stand with Ukraine. 100% органічна бавовна, етичне виробництво.',
    'clothing',
    2200,
    'GBP',
    ARRAY['shop/tshirt-stand-front.webp'],
    NULL,
    'ACTIVE'
  ),
  (
    'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
    'Carpathian Mountains Jumper',
    'carpathian-jumper',
    'Premium knit jumper featuring embroidered Carpathian mountain range. Soft merino wool blend, ribbed hem and cuffs.',
    'Преміум в''язаний джемпер з вишитими Карпатськими горами. М''яка суміш меріносової вовни, манжети та низ у рубчик.',
    'clothing',
    5500,
    'GBP',
    ARRAY['shop/jumper-carpathian-front.webp', 'shop/jumper-carpathian-detail.webp'],
    'Limited',
    'ACTIVE'
  ),
  (
    'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b',
    'Ukrainian Heart Hoodie',
    'ukrainian-heart-hoodie',
    'Classic heavyweight hoodie with Ukrainian flag heart design. Fleece-lined, kangaroo pocket, drawstring hood.',
    'Класичне худі з дизайном серця у кольорах українського прапора. Флісова підкладка, кенгуру кишеня, капюшон зі шнурком.',
    'clothing',
    4500,
    'GBP',
    ARRAY['shop/hoodie-flag-heart-front.webp', 'shop/hoodie-flag-heart-back.webp'],
    NULL,
    'ACTIVE'
  ),
  -- Gift products (non-clothing)
  (
    'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
    'Iznik Ceramics Bowl',
    'iznik-ceramics-bowl',
    'Hand-painted ceramic bowl featuring traditional Iznik designs. Each piece is unique, crafted by skilled artisans using centuries-old techniques. Perfect for serving or as a decorative piece.',
    'Керамічна миска ручного розпису з традиційними ізнікськими візерунками. Кожен виріб унікальний, створений майстрами за багатовіковими техніками. Ідеально підходить для сервірування або як декоративний елемент.',
    'gifts',
    3500,
    'GBP',
    ARRAY['shop/iznik-ceramics-bowl.webp', 'shop/iznik-ceramics-bowl-detail.webp'],
    'Handmade',
    'ACTIVE'
  ),
  (
    'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d',
    'Nazar Boncugu Evil Eye Pendant',
    'nazar-boncugu-pendant',
    'Traditional Turkish evil eye amulet (Nazar Boncugu) pendant on a sterling silver chain. Believed to protect against negative energy and bring good luck. Authentic handcrafted glass bead from Turkey.',
    'Традиційний турецький амулет від злого ока (Назар Бонджугу) на срібному ланцюжку. Вірять, що захищає від негативної енергії та приносить удачу. Автентична скляна намистина ручної роботи з Туреччини.',
    'gifts',
    2800,
    'GBP',
    ARRAY['shop/nazar-pendant.webp', 'shop/nazar-pendant-box.webp'],
    'Bestseller',
    'ACTIVE'
  ),
  (
    'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e',
    'Copper Turkish Coffee Pot (Cezve)',
    'copper-cezve-coffee-pot',
    'Authentic small copper coffee pot (Cezve/Ibrik) for making traditional Turkish coffee. Hand-hammered with intricate patterns, wooden handle. Makes 2-3 cups of rich, aromatic Turkish coffee.',
    'Автентична мідна кавоварка (джезва/ібрік) для приготування традиційної турецької кави. Ручне карбування з вишуканими візерунками, дерев''яна ручка. Готує 2-3 чашки насиченої ароматної турецької кави.',
    'gifts',
    4200,
    'GBP',
    ARRAY['shop/copper-cezve.webp', 'shop/copper-cezve-detail.webp'],
    NULL,
    'ACTIVE'
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description_en = EXCLUDED.description_en,
  description_uk = EXCLUDED.description_uk,
  price_minor = EXCLUDED.price_minor,
  images = EXCLUDED.images,
  badge = EXCLUDED.badge,
  status = EXCLUDED.status,
  updated_at = now();

-- ============================================================================
-- CLOTHING PRODUCT DETAILS - Category-specific details for clothing products
-- ============================================================================

INSERT INTO public.clothing_product_details (product_id, clothing_type)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'tshirt'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'sweatshirt'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'tshirt'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'jumper'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'hoodie')
ON CONFLICT (product_id) DO UPDATE SET
  clothing_type = EXCLUDED.clothing_type,
  updated_at = now();

-- ============================================================================
-- VARIANTS - Delete existing and re-insert to handle partial unique indexes
-- ============================================================================

-- Delete all existing variants for seeded products (will be re-created below)
DELETE FROM public.product_variants 
WHERE product_id IN (
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b',
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  'a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d',
  'b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e'
);

-- Insert variants for Mandrii Trident T-Shirt (no color variants)
INSERT INTO public.product_variants (product_id, gender, age_group, size, color, stock, sku)
VALUES
  -- Men's Adult sizes
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'men', 'adult', 's', NULL, 15, 'TRIDENT-M-A-S'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'men', 'adult', 'm', NULL, 20, 'TRIDENT-M-A-M'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'men', 'adult', 'l', NULL, 18, 'TRIDENT-M-A-L'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'men', 'adult', 'xl', NULL, 12, 'TRIDENT-M-A-XL'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'men', 'adult', 'xxl', NULL, 8, 'TRIDENT-M-A-2XL'),
  -- Women's Adult sizes
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'women', 'adult', 'xs', NULL, 10, 'TRIDENT-W-A-XS'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'women', 'adult', 's', NULL, 14, 'TRIDENT-W-A-S'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'women', 'adult', 'm', NULL, 16, 'TRIDENT-W-A-M'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'women', 'adult', 'l', NULL, 12, 'TRIDENT-W-A-L'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'women', 'adult', 'xl', NULL, 6, 'TRIDENT-W-A-XL'),
  -- Kids sizes (unisex)
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'unisex', 'kids', 'y5_6', NULL, 8, 'TRIDENT-U-K-56'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'unisex', 'kids', 'y7_8', NULL, 10, 'TRIDENT-U-K-78'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'unisex', 'kids', 'y9_10', NULL, 12, 'TRIDENT-U-K-910'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'unisex', 'kids', 'y11_12', NULL, 9, 'TRIDENT-U-K-1112');

-- Insert variants for Sunflower Sweatshirt (WITH COLORS)
INSERT INTO public.product_variants (product_id, gender, age_group, size, color, stock, sku)
VALUES
  -- Black color - Unisex Adult sizes
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 's', 'black', 6, 'SUNFLOWER-U-A-S-BLK'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'm', 'black', 9, 'SUNFLOWER-U-A-M-BLK'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'l', 'black', 10, 'SUNFLOWER-U-A-L-BLK'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'xl', 'black', 8, 'SUNFLOWER-U-A-XL-BLK'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'xxl', 'black', 5, 'SUNFLOWER-U-A-2XL-BLK'),
  -- Navy color - Unisex Adult sizes
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 's', 'navy', 6, 'SUNFLOWER-U-A-S-NVY'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'm', 'navy', 9, 'SUNFLOWER-U-A-M-NVY'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'l', 'navy', 10, 'SUNFLOWER-U-A-L-NVY'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'adult', 'xl', 'navy', 7, 'SUNFLOWER-U-A-XL-NVY'),
  -- Kids sizes (black only)
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'kids', 'y7_8', 'black', 6, 'SUNFLOWER-U-K-78-BLK'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'kids', 'y9_10', 'black', 8, 'SUNFLOWER-U-K-910-BLK'),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'unisex', 'kids', 'y11_12', 'black', 10, 'SUNFLOWER-U-K-1112-BLK');

-- Insert variants for Stand with Ukraine T-Shirt (no color variants)
INSERT INTO public.product_variants (product_id, gender, age_group, size, color, stock, sku)
VALUES
  -- Unisex Adult sizes
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'adult', 'xs', NULL, 8, 'STAND-U-A-XS'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'adult', 's', NULL, 15, 'STAND-U-A-S'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'adult', 'm', NULL, 22, 'STAND-U-A-M'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'adult', 'l', NULL, 18, 'STAND-U-A-L'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'adult', 'xl', NULL, 14, 'STAND-U-A-XL'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'adult', 'xxl', NULL, 9, 'STAND-U-A-2XL'),
  -- Kids sizes
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'kids', 'y5_6', NULL, 5, 'STAND-U-K-56'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'kids', 'y7_8', NULL, 7, 'STAND-U-K-78'),
  ('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'unisex', 'kids', 'y9_10', NULL, 9, 'STAND-U-K-910');

-- Insert variants for Carpathian Jumper (no color variants)
INSERT INTO public.product_variants (product_id, gender, age_group, size, color, stock, sku)
VALUES
  -- Men's Adult sizes
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'men', 'adult', 'm', NULL, 8, 'CARPATHIAN-M-A-M'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'men', 'adult', 'l', NULL, 10, 'CARPATHIAN-M-A-L'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'men', 'adult', 'xl', NULL, 7, 'CARPATHIAN-M-A-XL'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'men', 'adult', 'xxl', NULL, 4, 'CARPATHIAN-M-A-2XL'),
  -- Women's Adult sizes
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'women', 'adult', 's', NULL, 6, 'CARPATHIAN-W-A-S'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'women', 'adult', 'm', NULL, 9, 'CARPATHIAN-W-A-M'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'women', 'adult', 'l', NULL, 8, 'CARPATHIAN-W-A-L'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'women', 'adult', 'xl', NULL, 3, 'CARPATHIAN-W-A-XL');

-- Insert variants for Ukrainian Heart Hoodie (WITH COLORS)
INSERT INTO public.product_variants (product_id, gender, age_group, size, color, stock, sku)
VALUES
  -- Grey color - Unisex Adult sizes
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 's', 'grey', 7, 'HEART-U-A-S-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'm', 'grey', 10, 'HEART-U-A-M-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'l', 'grey', 9, 'HEART-U-A-L-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'xl', 'grey', 6, 'HEART-U-A-XL-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'xxl', 'grey', 4, 'HEART-U-A-2XL-GRY'),
  -- Black color - Unisex Adult sizes
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 's', 'black', 7, 'HEART-U-A-S-BLK'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'm', 'black', 10, 'HEART-U-A-M-BLK'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'l', 'black', 9, 'HEART-U-A-L-BLK'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'xl', 'black', 6, 'HEART-U-A-XL-BLK'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'adult', 'xxl', 'black', 4, 'HEART-U-A-2XL-BLK'),
  -- Kids sizes (grey only)
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'kids', 'y7_8', 'grey', 6, 'HEART-U-K-78-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'kids', 'y9_10', 'grey', 8, 'HEART-U-K-910-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'kids', 'y11_12', 'grey', 7, 'HEART-U-K-1112-GRY'),
  ('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'unisex', 'kids', 'y13_14', 'grey', 5, 'HEART-U-K-1314-GRY');

-- ============================================================================
-- GIFT PRODUCTS VARIANTS (non-clothing - all variant attributes are NULL)
-- ============================================================================

-- Insert single variant for each gift product (for stock tracking only)
INSERT INTO public.product_variants (product_id, gender, age_group, size, color, stock, sku)
VALUES
  -- Iznik Ceramics Bowl
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', NULL, NULL, NULL, NULL, 12, 'IZNIK-BOWL-001'),
  -- Nazar Boncugu Pendant
  ('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', NULL, NULL, NULL, NULL, 25, 'NAZAR-PENDANT-001'),
  -- Copper Cezve
  ('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', NULL, NULL, NULL, NULL, 8, 'CEZVE-COPPER-001');
