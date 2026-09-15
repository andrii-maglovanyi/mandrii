import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { cache as cacheForRequest } from "react";

import { auth } from "~/lib/auth";

import { publicConfig } from "../config/public";

export const getServerClient = cacheForRequest(async () => {
  const session = await auth();
  const token = session?.accessToken;
  const httpLink = new HttpLink({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    uri: publicConfig.hasura.endpoint,
  });

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          events: {
            keyArgs: ["where", "limit", "offset", "order_by"],
          },
          events_aggregate: {
            keyArgs: ["where"],
          },
          venues: {
            keyArgs: ["where", "limit", "offset", "order_by"],
          },
          venues_aggregate: {
            keyArgs: ["where"],
          },
        },
      },
    },
  });

  return new ApolloClient({
    cache,
    link: httpLink,
  });
});
