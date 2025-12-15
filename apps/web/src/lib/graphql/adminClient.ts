import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

import { privateConfig } from "~/lib/config/private";
import { publicConfig } from "~/lib/config/public";

/**
 * Returns a server-side Apollo Client with admin privileges.
 * Uses Hasura admin secret for full database access.
 *
 * ⚠️ SECURITY WARNING: Only use in server-side code (API routes, server components).
 * Never expose admin secret to client-side code.
 */
export function getAdminClient(): ApolloClient<object> {
  const httpLink = new HttpLink({
    headers: {
      "x-hasura-admin-secret": privateConfig.hasura.adminSecret,
    },
    uri: publicConfig.hasura.endpoint,
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    defaultOptions: {
      mutate: {
        errorPolicy: "none",
        fetchPolicy: "network-only",
      },
      query: {
        errorPolicy: "none",
        fetchPolicy: "network-only",
      },
    },
    link: httpLink,
  });
}
