/**
 * Shop Mock Data
 *
 * This file contains mock data for shop-related tests.
 * Data structure mirrors the GraphQL schema.
 */

import { Product, ProductVariant } from "~/hooks/useProducts";
import { Clothing_Age_Group_Enum, Clothing_Gender_Enum, Clothing_Size_Enum } from "~/types/graphql.generated";

// Shorthand aliases for enum values (they match the string values)
const G = Clothing_Gender_Enum;
const A = Clothing_Age_Group_Enum;
const S = Clothing_Size_Enum;

/**
 * Mock product variants - supports optional color and price override
 */
const createVariants = (
  productId: string,
  options: Array<{
    gender: Clothing_Gender_Enum;
    ageGroup: Clothing_Age_Group_Enum;
    size: Clothing_Size_Enum;
    stock: number;
    color?: string;
    priceOverrideMinor?: number;
    sku?: string;
  }>,
): ProductVariant[] =>
  options.map((opt, index) => ({
    id: `${productId}-v${index + 1}`,
    gender: opt.gender,
    ageGroup: opt.ageGroup,
    size: opt.size,
    stock: opt.stock,
    color: opt.color,
    priceOverrideMinor: opt.priceOverrideMinor,
    sku: opt.sku,
  }));

/**
 * Mock products - mirrors seed data structure
 */
export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Mandrii Trident T-Shirt",
    slug: "mandrii-trident-tshirt",
    description_en: "Premium cotton t-shirt featuring the Mandrii trident design. Comfortable fit, pre-shrunk fabric.",
    description_uk: "Преміум бавовняна футболка з дизайном тризуба Мандрій.",
    category: "clothing",
    clothingType: "tshirt",
    priceMinor: 2500,
    currency: "GBP",
    images: ["shop/tshirt-trident-front.webp", "shop/tshirt-trident-back.webp"],
    badge: "New",
    status: "ACTIVE",
    variants: createVariants("prod-1", [
      { gender: G.Men, ageGroup: A.Adult, size: S.S, stock: 15 },
      { gender: G.Men, ageGroup: A.Adult, size: S.M, stock: 20 },
      { gender: G.Men, ageGroup: A.Adult, size: S.L, stock: 18 },
      { gender: G.Men, ageGroup: A.Adult, size: S.Xl, stock: 12 },
      { gender: G.Women, ageGroup: A.Adult, size: S.S, stock: 14 },
      { gender: G.Women, ageGroup: A.Adult, size: S.M, stock: 16 },
      { gender: G.Women, ageGroup: A.Adult, size: S.L, stock: 12 },
      { gender: G.Unisex, ageGroup: A.Kids, size: S.Y7_8, stock: 10 },
      { gender: G.Unisex, ageGroup: A.Kids, size: S.Y9_10, stock: 12 },
    ]),
  },
  {
    id: "prod-2",
    name: "Sunflower Embroidered Sweatshirt",
    slug: "sunflower-sweatshirt",
    description_en: "Cozy crew neck sweatshirt with embroidered Ukrainian sunflower design.",
    description_uk: "Затишний світшот з вишитим українським соняшником.",
    category: "clothing",
    clothingType: "sweatshirt",
    priceMinor: 4000,
    currency: "GBP",
    images: ["shop/sweatshirt-sunflower-front.webp", "shop/sweatshirt-sunflower-back.webp"],
    badge: "Bestseller",
    status: "ACTIVE",
    variants: createVariants("prod-2", [
      // Black color variants
      { gender: G.Unisex, ageGroup: A.Adult, size: S.S, stock: 6, color: "black" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 9, color: "black" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 10, color: "black" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xl, stock: 8, color: "black" },
      // Navy color variants
      { gender: G.Unisex, ageGroup: A.Adult, size: S.S, stock: 6, color: "navy" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 9, color: "navy" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 10, color: "navy" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xl, stock: 7, color: "navy" },
    ]),
  },
  {
    id: "prod-3",
    name: "Stand with Ukraine T-Shirt",
    slug: "stand-with-ukraine-tshirt",
    description_en: "Lightweight t-shirt with the classic Stand with Ukraine message.",
    description_uk: "Легка футболка з класичним написом Stand with Ukraine.",
    category: "clothing",
    clothingType: "tshirt",
    priceMinor: 2200,
    currency: "GBP",
    images: ["shop/tshirt-stand-front.webp"],
    status: "ACTIVE",
    variants: createVariants("prod-3", [
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xs, stock: 8 },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.S, stock: 15 },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 22 },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 18 },
    ]),
  },
  {
    id: "prod-4",
    name: "Carpathian Mountains Jumper",
    slug: "carpathian-jumper",
    description_en: "Premium knit jumper featuring embroidered Carpathian mountain range.",
    description_uk: "Преміум в'язаний джемпер з вишитими Карпатськими горами.",
    category: "clothing",
    clothingType: "jumper",
    priceMinor: 5500,
    currency: "GBP",
    images: ["shop/jumper-carpathian-front.webp", "shop/jumper-carpathian-detail.webp"],
    badge: "Limited",
    status: "ACTIVE",
    variants: createVariants("prod-4", [
      { gender: G.Men, ageGroup: A.Adult, size: S.M, stock: 8 },
      { gender: G.Men, ageGroup: A.Adult, size: S.L, stock: 10 },
      { gender: G.Men, ageGroup: A.Adult, size: S.Xl, stock: 7 },
      { gender: G.Women, ageGroup: A.Adult, size: S.S, stock: 6 },
      { gender: G.Women, ageGroup: A.Adult, size: S.M, stock: 9 },
      { gender: G.Women, ageGroup: A.Adult, size: S.L, stock: 8 },
    ]),
  },
  {
    id: "prod-5",
    name: "Ukrainian Heart Hoodie",
    slug: "ukrainian-heart-hoodie",
    description_en: "Classic heavyweight hoodie with Ukrainian flag heart design.",
    description_uk: "Класичне худі з дизайном серця у кольорах українського прапора.",
    category: "clothing",
    clothingType: "hoodie",
    priceMinor: 4500,
    currency: "GBP",
    images: ["shop/hoodie-flag-heart-front.webp", "shop/hoodie-flag-heart-back.webp"],
    status: "ACTIVE",
    variants: createVariants("prod-5", [
      // Grey color variants
      { gender: G.Unisex, ageGroup: A.Adult, size: S.S, stock: 7, color: "grey" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 10, color: "grey" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 9, color: "grey" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xl, stock: 6, color: "grey" },
      // Black color variants
      { gender: G.Unisex, ageGroup: A.Adult, size: S.S, stock: 7, color: "black" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 10, color: "black" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 9, color: "black" },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xl, stock: 6, color: "black" },
      // Kids sizes (grey only)
      { gender: G.Unisex, ageGroup: A.Kids, size: S.Y9_10, stock: 8, color: "grey" },
      { gender: G.Unisex, ageGroup: A.Kids, size: S.Y11_12, stock: 7, color: "grey" },
    ]),
  },
  {
    id: "prod-6",
    name: "Out of Stock Item",
    slug: "out-of-stock-item",
    description_en: "This item is currently out of stock.",
    description_uk: "Цей товар наразі відсутній.",
    category: "clothing",
    clothingType: "tshirt",
    priceMinor: 1999,
    currency: "GBP",
    images: ["shop/sold-out-item.webp"],
    status: "ACTIVE",
    stock: 0,
    variants: createVariants("prod-6", [
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 0 },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 0 },
    ]),
  },
  {
    id: "prod-7",
    name: "Ukrainian Embroidery Accessory",
    slug: "ukrainian-embroidery-accessory",
    description_en: "Beautiful Ukrainian embroidery accessory.",
    description_uk: "Прекрасний аксесуар з українською вишивкою.",
    category: "accessories",
    priceMinor: 1500,
    currency: "GBP",
    images: [],
    status: "ACTIVE",
    stock: 25,
    variants: [],
  },
  {
    id: "prod-8",
    name: "Euro Priced Item",
    slug: "euro-priced-item",
    description_en: "A product priced in EUR for multi-currency testing.",
    description_uk: "Товар в євро для тестування мультивалютності.",
    category: "accessories",
    priceMinor: 2000,
    currency: "EUR",
    images: [],
    status: "ACTIVE",
    stock: 10,
    variants: [],
  },
  {
    id: "prod-9",
    name: "Premium Vyshyvanka Shirt",
    slug: "premium-vyshyvanka-shirt",
    description_en: "Premium embroidered shirt with XL/XXL size upcharge.",
    description_uk: "Преміальна вишита сорочка з доплатою за великі розміри.",
    category: "clothing",
    clothingType: "tshirt",
    priceMinor: 3500,
    currency: "GBP",
    images: ["shop/vyshyvanka-front.webp"],
    status: "ACTIVE",
    variants: createVariants("prod-9", [
      { gender: G.Unisex, ageGroup: A.Adult, size: S.S, stock: 8 },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.M, stock: 12 },
      { gender: G.Unisex, ageGroup: A.Adult, size: S.L, stock: 10 },
      // XL has price override (+£5)
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xl, stock: 6, priceOverrideMinor: 4000 },
      // XXL has higher price override (+£8)
      { gender: G.Unisex, ageGroup: A.Adult, size: S.Xxl, stock: 4, priceOverrideMinor: 4300 },
    ]),
  },
  {
    id: "prod-10",
    name: "Limited Edition Badge",
    slug: "limited-edition-badge",
    description_en: "Limited edition Ukrainian flag badge. Only 2 left!",
    description_uk: "Лімітований значок з українським прапором. Залишилось тільки 2!",
    category: "accessories",
    priceMinor: 500,
    currency: "GBP",
    images: ["shop/badge-flag.webp"],
    status: "ACTIVE",
    stock: 2,
    variants: [],
  },
];

/**
 * Get a product by slug
 */
export const mockProductBySlug = (slug: string): Product | null => {
  return mockProducts.find((p) => p.slug === slug) || null;
};

/**
 * Get products by category
 */
export const mockProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter((p) => p.category === category);
};

/**
 * Search products by name
 */
export const mockSearchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return mockProducts.filter((p) => p.name.toLowerCase().includes(lowerQuery));
};

/**
 * Parse Hasura-style boolean expressions to filter products.
 * Handles _and, _or, _eq, _ilike operators as used by useProducts.
 * Exported for use in tests and MSW handlers.
 */
export const applyWhereClause = (products: Product[], where: Record<string, unknown>): Product[] => {
  if (!where || Object.keys(where).length === 0) {
    return products;
  }

  return products.filter((product) => matchesWhere(product, where));
};

/**
 * Check if a product matches a where clause.
 */
const matchesWhere = (product: Product, where: Record<string, unknown>): boolean => {
  // Handle _and: all conditions must match
  if (where._and && Array.isArray(where._and)) {
    return where._and.every((condition: Record<string, unknown>) => matchesWhere(product, condition));
  }

  // Handle _or: at least one condition must match
  if (where._or && Array.isArray(where._or)) {
    return where._or.some((condition: Record<string, unknown>) => matchesWhere(product, condition));
  }

  // Handle direct field conditions
  for (const [field, condition] of Object.entries(where)) {
    if (field.startsWith("_")) continue; // Skip operators we already handled

    const value = product[field as keyof Product];

    if (typeof condition === "object" && condition !== null) {
      const cond = condition as Record<string, unknown>;

      // Handle _eq
      if ("_eq" in cond && value !== cond._eq) {
        return false;
      }

      // Handle _ilike (case-insensitive like)
      if ("_ilike" in cond && typeof cond._ilike === "string") {
        const pattern = cond._ilike.replace(/%/g, "").toLowerCase();
        if (typeof value !== "string" || !value.toLowerCase().includes(pattern)) {
          return false;
        }
      }
    }
  }

  return true;
};

/**
 * Transform mock product to GraphQL response format
 * Note: Uses 'product_variants' to match the GraphQL schema (not 'variants')
 */
const toGraphQLProduct = (product: Product) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  description_en: product.description_en,
  description_uk: product.description_uk,
  category: product.category,
  clothing_product_details: product.clothingType ? { clothing_type: product.clothingType } : null,
  price_minor: product.priceMinor,
  currency: product.currency,
  images: product.images,
  badge: product.badge || null,
  status: product.status,
  stock: product.stock ?? null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  product_variants:
    product.variants?.map((v) => ({
      id: v.id,
      gender: v.gender,
      age_group: v.ageGroup,
      size: v.size,
      color: v.color || null,
      stock: v.stock,
      sku: v.sku || null,
      price_override_minor: v.priceOverrideMinor || null,
    })) ?? [],
});

/**
 * Create GraphQL response for GetPublicProducts query
 */
export const getMockProductsResponse = (products: Product[], totalCount: number) => ({
  products: products.map(toGraphQLProduct),
  products_aggregate: {
    aggregate: {
      count: totalCount,
    },
  },
});

/**
 * Create GraphQL response for GetProductBySlug query
 */
export const getMockProductBySlugResponse = (product: Product | null) => ({
  products: product ? [toGraphQLProduct(product)] : [],
});
