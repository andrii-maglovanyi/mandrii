/**
 * Shop MSW Handlers
 *
 * GraphQL handlers for shop-related queries and mutations.
 */

import { graphql, HttpResponse } from "msw";

import {
  applyWhereClause,
  getMockProductBySlugResponse,
  getMockProductsResponse,
  mockProductBySlug,
  mockProducts,
} from "../data/shop";

/**
 * GraphQL endpoint for Hasura
 * Adjust this URL to match your actual GraphQL endpoint
 */
const graphqlEndpoint = graphql.link(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8080/v1/graphql");

export const shopHandlers = [
  /**
   * Handler for GetPublicProducts query
   * Parses the _and/_or boolean expression structure emitted by useProducts
   */
  graphqlEndpoint.query("GetPublicProducts", ({ variables }) => {
    const { limit = 12, offset = 0, where = {} } = variables || {};

    // Apply where clause filtering (handles _and, _or, _eq, _ilike)
    const filteredProducts = applyWhereClause([...mockProducts], where as Record<string, unknown>);

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return HttpResponse.json({
      data: getMockProductsResponse(paginatedProducts, filteredProducts.length),
    });
  }),

  /**
   * Handler for GetProductBySlug query
   */
  graphqlEndpoint.query("GetProductBySlug", ({ variables }) => {
    const { slug } = variables || {};

    const product = mockProductBySlug(slug);

    return HttpResponse.json({
      data: getMockProductBySlugResponse(product),
    });
  }),
];

/**
 * Error scenario handlers - use these in specific tests
 */
export const shopErrorHandlers = {
  /**
   * Simulates a network error for GetPublicProducts
   */
  networkError: graphqlEndpoint.query("GetPublicProducts", () => {
    return HttpResponse.error();
  }),

  /**
   * Simulates a GraphQL error for GetPublicProducts
   */
  graphqlError: graphqlEndpoint.query("GetPublicProducts", () => {
    return HttpResponse.json({
      errors: [
        {
          message: "Failed to fetch products",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        },
      ],
    });
  }),

  /**
   * Simulates empty results
   */
  emptyResults: graphqlEndpoint.query("GetPublicProducts", () => {
    return HttpResponse.json({
      data: getMockProductsResponse([], 0),
    });
  }),

  /**
   * Simulates product not found
   */
  productNotFound: graphqlEndpoint.query("GetProductBySlug", () => {
    return HttpResponse.json({
      data: getMockProductBySlugResponse(null),
    });
  }),
};
