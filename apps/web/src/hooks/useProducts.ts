import { useMemo } from "react";

import { constants } from "~/lib/constants";
import { ClothingSize } from "~/lib/constants/options/CLOTHING";
import {
  Clothing_Age_Group_Enum,
  Clothing_Gender_Enum,
  GetProductBySlugQuery,
  GetPublicProductsQuery,
  Order_By,
  Product_Status_Enum,
  Products_Bool_Exp,
  Products_Order_By,
  useGetProductBySlugQuery,
  useGetPublicProductsQuery,
} from "~/types/graphql.generated";

export interface Product extends Record<string, unknown> {
  badge?: null | string;
  category?: string;
  clothingType?: null | string; // Now comes from clothing_product_details relationship
  currency: string;
  description_en?: null | string;
  description_uk?: null | string;
  id: string;
  images?: string[];
  name: string;
  priceMinor: number;
  slug: string;
  status: string;
  stock?: number;
  variants?: ProductVariant[];
}

/** Stock information per variant (gender + age + size + color combination) */
export interface ProductVariant {
  ageGroup: Clothing_Age_Group_Enum;
  color?: null | string;
  gender: Clothing_Gender_Enum;
  id: string;
  priceOverrideMinor?: null | number;
  size: ClothingSize;
  sku?: null | string;
  stock: number;
}

interface UsePublicProductsParams {
  limit?: number;
  offset?: number;
  orderBy?: Products_Order_By[];
  where?: Products_Bool_Exp;
}

/** Default sort order for deterministic pagination */
const DEFAULT_ORDER_BY: Products_Order_By[] = [{ created_at: Order_By.Desc }];

export const normalizeImage = (path?: null | string) => {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${constants.vercelBlobStorageUrl}/${path}`;
};

type GraphQLProduct = GetProductBySlugQuery["products"][number] | GetPublicProductsQuery["products"][number];

/**
 * Map a GraphQL product response to our Product interface.
 *
 * @param product - Raw product data from GraphQL.
 * @returns Normalized Product object.
 */
export const mapProduct = (product: GraphQLProduct): Product => ({
  badge: product.badge,
  category: product.category,
  clothingType: product.clothing_product_details?.clothing_type ?? null,
  currency: product.currency,
  description_en: product.description_en,
  description_uk: product.description_uk,
  id: product.id,
  images: product.images?.map(normalizeImage).filter((img): img is string => img !== undefined),
  name: product.name,
  priceMinor: product.price_minor,
  slug: product.slug,
  status: product.status,
  stock: product.stock ?? undefined,
  variants: product.product_variants.map((v) => ({
    ageGroup: v.age_group as Clothing_Age_Group_Enum,
    color: v.color ?? undefined,
    gender: v.gender as Clothing_Gender_Enum,
    id: v.id,
    priceOverrideMinor: v.price_override_minor,
    size: v.size as ClothingSize,
    sku: v.sku,
    stock: v.stock,
  })),
});

/** Default filter for active products only */
const ACTIVE_FILTER: Products_Bool_Exp = { status: { _eq: Product_Status_Enum.Active } };

/**
 * Hook for accessing product data from GraphQL.
 *
 * @returns Object with usePublicProducts and useGetProduct hooks.
 */
export const useProducts = () => {
  /**
   * Fetch public products with filtering, pagination, and ordering.
   * Always enforces status: ACTIVE filter to prevent exposing draft/inactive products.
   *
   * @param params - Query parameters including where, limit, offset, orderBy.
   * @returns Query result with normalized product data.
   */
  const usePublicProducts = (params: UsePublicProductsParams = {}) => {
    const { limit, offset, orderBy, where = {} } = params;

    // Use _and to ensure ACTIVE filter cannot be overridden by caller
    const mergedWhere: Products_Bool_Exp = {
      _and: [ACTIVE_FILTER, where],
    };

    const { data, error, loading, refetch } = useGetPublicProductsQuery({
      variables: {
        limit,
        offset,
        order_by: orderBy ?? DEFAULT_ORDER_BY,
        where: mergedWhere,
      },
    });

    const products = useMemo(() => {
      if (!data?.products) return [];
      return data.products.map(mapProduct);
    }, [data?.products]);

    const count = data?.products_aggregate?.aggregate?.count ?? 0;

    return {
      count,
      data: products,
      error,
      loading,
      refetch,
    };
  };

  /**
   * Fetch a single product by its slug.
   *
   * @param slug - The product slug to look up.
   * @returns Query result with the product data or undefined.
   */
  const useGetProduct = (slug?: string) => {
    const { data, error, loading } = useGetProductBySlugQuery({
      skip: !slug,
      variables: { slug: slug ?? "" },
    });

    const product = useMemo(() => {
      if (!data?.products?.[0]) return undefined;
      return mapProduct(data.products[0]);
    }, [data?.products]);

    return {
      data: product,
      error,
      loading,
    };
  };

  return {
    useGetProduct,
    usePublicProducts,
  };
};
