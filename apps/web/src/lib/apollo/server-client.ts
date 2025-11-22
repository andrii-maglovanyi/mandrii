import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

import { auth } from "~/lib/auth";

import { publicConfig } from "../config/public";

export async function getServerClient() {
  const httpLink = new HttpLink({
    uri: publicConfig.hasura.endpoint,
  });

  const authLink = setContext(async (_, { headers }) => {
    const session = await auth();
    const token = session?.accessToken;

    const authorizationHeader = token ? { Authorization: `Bearer ${token}` } : {};

    return {
      headers: {
        ...headers,
        ...authorizationHeader,
      },
    };
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
    link: authLink.concat(httpLink),
  });
}
