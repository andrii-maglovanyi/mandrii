import { gql } from "@apollo/client";

/**
 * Shared GraphQL fragment for product variant fields.
 */
export const PRODUCT_VARIANT_FIELDS_FRAGMENT = gql`
  fragment ProductVariantFields on product_variants {
    id
    gender
    age_group
    size
    color
    stock
    sku
    price_override_minor
  }
`;

/**
 * Shared GraphQL fragment for product fields.
 * Used across multiple queries to ensure consistency.
 */
export const PRODUCT_FIELDS_FRAGMENT = gql`
  ${PRODUCT_VARIANT_FIELDS_FRAGMENT}
  fragment ProductFields on products {
    id
    name
    slug
    description_en
    description_uk
    category
    clothing_type
    price_minor
    currency
    images
    badge
    status
    stock
    created_at
    updated_at
    product_variants {
      ...ProductVariantFields
    }
  }
`;

/**
 * Get public products with filtering, pagination and ordering.
 * Note: The $where should always include status filter for public queries.
 */
export const GET_PUBLIC_PRODUCTS = gql`
  ${PRODUCT_FIELDS_FRAGMENT}
  query GetPublicProducts($where: products_bool_exp!, $limit: Int, $offset: Int, $order_by: [products_order_by!]) {
    products(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      ...ProductFields
    }
    products_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

/**
 * Get a single product by slug.
 */
export const GET_PRODUCT_BY_SLUG = gql`
  ${PRODUCT_FIELDS_FRAGMENT}
  query GetProductBySlug($slug: String!) {
    products(where: { slug: { _eq: $slug }, status: { _eq: "ACTIVE" } }, limit: 1) {
      ...ProductFields
    }
  }
`;
