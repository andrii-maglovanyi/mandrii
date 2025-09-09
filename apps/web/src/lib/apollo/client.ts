import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

import { publicConfig } from "../config/public";

const httpLink = new HttpLink({
  uri: publicConfig.hasura.endpoint,
});

const authLink = setContext(async (_, { headers }) => {
  const session = await getSession();

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
        locations: {
          keyArgs: ["where"],
        },
        locations_aggregate: {
          keyArgs: ["where"],
        },
      },
    },
  },
});

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink),
});

export default client;
