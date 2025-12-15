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
    ageGroup: Clothing_Age_Group_Enum;
    color?: string;
    gender: Clothing_Gender_Enum;
    priceOverrideMinor?: number;
    size: Clothing_Size_Enum;
    sku?: string;
    stock: number;
  }>,
): ProductVariant[] =>
  options.map((opt, index) => ({
    ageGroup: opt.ageGroup,
    color: opt.color,
    gender: opt.gender,
    id: `${productId}-v${index + 1}`,
    priceOverrideMinor: opt.priceOverrideMinor,
    size: opt.size,
    sku: opt.sku,
    stock: opt.stock,
  }));

/**
 * Mock products - mirrors seed data structure
 */
export const mockProducts: Product[] = [
  {
    badge: "New",
    category: "clothing",
    clothingType: "tshirt",
    currency: "GBP",
    description_en: "Premium cotton t-shirt featuring the Mandrii trident design. Comfortable fit, pre-shrunk fabric.",
    description_uk: "Преміум бавовняна футболка з дизайном тризуба Мандрій.",
    id: "prod-1",
    images: ["shop/tshirt-trident-front.webp", "shop/tshirt-trident-back.webp"],
    name: "Mandrii Trident T-Shirt",
    priceMinor: 2500,
    slug: "mandrii-trident-tshirt",
    status: "ACTIVE",
    variants: createVariants("prod-1", [
      { ageGroup: A.Adult, gender: G.Men, size: S.S, stock: 15 },
      { ageGroup: A.Adult, gender: G.Men, size: S.M, stock: 20 },
      { ageGroup: A.Adult, gender: G.Men, size: S.L, stock: 18 },
      { ageGroup: A.Adult, gender: G.Men, size: S.Xl, stock: 12 },
      { ageGroup: A.Adult, gender: G.Women, size: S.S, stock: 14 },
      { ageGroup: A.Adult, gender: G.Women, size: S.M, stock: 16 },
      { ageGroup: A.Adult, gender: G.Women, size: S.L, stock: 12 },
      { ageGroup: A.Kids, gender: G.Unisex, size: S.Y7_8, stock: 10 },
      { ageGroup: A.Kids, gender: G.Unisex, size: S.Y9_10, stock: 12 },
    ]),
  },
  {
    badge: "Bestseller",
    category: "clothing",
    clothingType: "sweatshirt",
    currency: "GBP",
    description_en: "Cozy crew neck sweatshirt with embroidered Ukrainian sunflower design.",
    description_uk: "Затишний світшот з вишитим українським соняшником.",
    id: "prod-2",
    images: ["shop/sweatshirt-sunflower-front.webp", "shop/sweatshirt-sunflower-back.webp"],
    name: "Sunflower Embroidered Sweatshirt",
    priceMinor: 4000,
    slug: "sunflower-sweatshirt",
    status: "ACTIVE",
    variants: createVariants("prod-2", [
      // Black color variants
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.S, stock: 6 },
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.M, stock: 9 },
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.L, stock: 10 },
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.Xl, stock: 8 },
      // Navy color variants
      { ageGroup: A.Adult, color: "navy", gender: G.Unisex, size: S.S, stock: 6 },
      { ageGroup: A.Adult, color: "navy", gender: G.Unisex, size: S.M, stock: 9 },
      { ageGroup: A.Adult, color: "navy", gender: G.Unisex, size: S.L, stock: 10 },
      { ageGroup: A.Adult, color: "navy", gender: G.Unisex, size: S.Xl, stock: 7 },
    ]),
  },
  {
    category: "clothing",
    clothingType: "tshirt",
    currency: "GBP",
    description_en: "Lightweight t-shirt with the classic Stand with Ukraine message.",
    description_uk: "Легка футболка з класичним написом Stand with Ukraine.",
    id: "prod-3",
    images: ["shop/tshirt-stand-front.webp"],
    name: "Stand with Ukraine T-Shirt",
    priceMinor: 2200,
    slug: "stand-with-ukraine-tshirt",
    status: "ACTIVE",
    variants: createVariants("prod-3", [
      { ageGroup: A.Adult, gender: G.Unisex, size: S.Xs, stock: 8 },
      { ageGroup: A.Adult, gender: G.Unisex, size: S.S, stock: 15 },
      { ageGroup: A.Adult, gender: G.Unisex, size: S.M, stock: 22 },
      { ageGroup: A.Adult, gender: G.Unisex, size: S.L, stock: 18 },
    ]),
  },
  {
    badge: "Limited",
    category: "clothing",
    clothingType: "jumper",
    currency: "GBP",
    description_en: "Premium knit jumper featuring embroidered Carpathian mountain range.",
    description_uk: "Преміум в'язаний джемпер з вишитими Карпатськими горами.",
    id: "prod-4",
    images: ["shop/jumper-carpathian-front.webp", "shop/jumper-carpathian-detail.webp"],
    name: "Carpathian Mountains Jumper",
    priceMinor: 5500,
    slug: "carpathian-jumper",
    status: "ACTIVE",
    variants: createVariants("prod-4", [
      { ageGroup: A.Adult, gender: G.Men, size: S.M, stock: 8 },
      { ageGroup: A.Adult, gender: G.Men, size: S.L, stock: 10 },
      { ageGroup: A.Adult, gender: G.Men, size: S.Xl, stock: 7 },
      { ageGroup: A.Adult, gender: G.Women, size: S.S, stock: 6 },
      { ageGroup: A.Adult, gender: G.Women, size: S.M, stock: 9 },
      { ageGroup: A.Adult, gender: G.Women, size: S.L, stock: 8 },
    ]),
  },
  {
    category: "clothing",
    clothingType: "hoodie",
    currency: "GBP",
    description_en: "Classic heavyweight hoodie with Ukrainian flag heart design.",
    description_uk: "Класичне худі з дизайном серця у кольорах українського прапора.",
    id: "prod-5",
    images: ["shop/hoodie-flag-heart-front.webp", "shop/hoodie-flag-heart-back.webp"],
    name: "Ukrainian Heart Hoodie",
    priceMinor: 4500,
    slug: "ukrainian-heart-hoodie",
    status: "ACTIVE",
    variants: createVariants("prod-5", [
      // Grey color variants
      { ageGroup: A.Adult, color: "grey", gender: G.Unisex, size: S.S, stock: 7 },
      { ageGroup: A.Adult, color: "grey", gender: G.Unisex, size: S.M, stock: 10 },
      { ageGroup: A.Adult, color: "grey", gender: G.Unisex, size: S.L, stock: 9 },
      { ageGroup: A.Adult, color: "grey", gender: G.Unisex, size: S.Xl, stock: 6 },
      // Black color variants
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.S, stock: 7 },
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.M, stock: 10 },
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.L, stock: 9 },
      { ageGroup: A.Adult, color: "black", gender: G.Unisex, size: S.Xl, stock: 6 },
      // Kids sizes (grey only)
      { ageGroup: A.Kids, color: "grey", gender: G.Unisex, size: S.Y9_10, stock: 8 },
      { ageGroup: A.Kids, color: "grey", gender: G.Unisex, size: S.Y11_12, stock: 7 },
    ]),
  },
  {
    category: "clothing",
    clothingType: "tshirt",
    currency: "GBP",
    description_en: "This item is currently out of stock.",
    description_uk: "Цей товар наразі відсутній.",
    id: "prod-6",
    images: ["shop/sold-out-item.webp"],
    name: "Out of Stock Item",
    priceMinor: 1999,
    slug: "out-of-stock-item",
    status: "ACTIVE",
    stock: 0,
    variants: createVariants("prod-6", [
      { ageGroup: A.Adult, gender: G.Unisex, size: S.M, stock: 0 },
      { ageGroup: A.Adult, gender: G.Unisex, size: S.L, stock: 0 },
    ]),
  },
  {
    category: "accessories",
    currency: "GBP",
    description_en: "Beautiful Ukrainian embroidery accessory.",
    description_uk: "Прекрасний аксесуар з українською вишивкою.",
    id: "prod-7",
    images: [],
    name: "Ukrainian Embroidery Accessory",
    priceMinor: 1500,
    slug: "ukrainian-embroidery-accessory",
    status: "ACTIVE",
    stock: 25,
    variants: [],
  },
  {
    category: "accessories",
    currency: "EUR",
    description_en: "A product priced in EUR for multi-currency testing.",
    description_uk: "Товар в євро для тестування мультивалютності.",
    id: "prod-8",
    images: [],
    name: "Euro Priced Item",
    priceMinor: 2000,
    slug: "euro-priced-item",
    status: "ACTIVE",
    stock: 10,
    variants: [],
  },
  {
    category: "clothing",
    clothingType: "tshirt",
    currency: "GBP",
    description_en: "Premium embroidered shirt with XL/XXL size upcharge.",
    description_uk: "Преміальна вишита сорочка з доплатою за великі розміри.",
    id: "prod-9",
    images: ["shop/vyshyvanka-front.webp"],
    name: "Premium Vyshyvanka Shirt",
    priceMinor: 3500,
    slug: "premium-vyshyvanka-shirt",
    status: "ACTIVE",
    variants: createVariants("prod-9", [
      { ageGroup: A.Adult, gender: G.Unisex, size: S.S, stock: 8 },
      { ageGroup: A.Adult, gender: G.Unisex, size: S.M, stock: 12 },
      { ageGroup: A.Adult, gender: G.Unisex, size: S.L, stock: 10 },
      // XL has price override (+£5)
      { ageGroup: A.Adult, gender: G.Unisex, priceOverrideMinor: 4000, size: S.Xl, stock: 6 },
      // XXL has higher price override (+£8)
      { ageGroup: A.Adult, gender: G.Unisex, priceOverrideMinor: 4300, size: S.Xxl, stock: 4 },
    ]),
  },
  {
    category: "accessories",
    currency: "GBP",
    description_en: "Limited edition Ukrainian flag badge. Only 2 left!",
    description_uk: "Лімітований значок з українським прапором. Залишилось тільки 2!",
    id: "prod-10",
    images: ["shop/badge-flag.webp"],
    name: "Limited Edition Badge",
    priceMinor: 500,
    slug: "limited-edition-badge",
    status: "ACTIVE",
    stock: 2,
    variants: [],
  },
];

/**
 * Get a product by slug
 */
export const mockProductBySlug = (slug: string): null | Product => {
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
  badge: product.badge || null,
  category: product.category,
  clothing_product_details: product.clothingType ? { clothing_type: product.clothingType } : null,
  created_at: new Date().toISOString(),
  currency: product.currency,
  description_en: product.description_en,
  description_uk: product.description_uk,
  id: product.id,
  images: product.images,
  name: product.name,
  price_minor: product.priceMinor,
  product_variants:
    product.variants?.map((v) => ({
      age_group: v.ageGroup,
      color: v.color || null,
      gender: v.gender,
      id: v.id,
      price_override_minor: v.priceOverrideMinor || null,
      size: v.size,
      sku: v.sku || null,
      stock: v.stock,
    })) ?? [],
  slug: product.slug,
  status: product.status,
  stock: product.stock ?? null,
  updated_at: new Date().toISOString(),
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
export const getMockProductBySlugResponse = (product: null | Product) => ({
  products: product ? [toGraphQLProduct(product)] : [],
});
