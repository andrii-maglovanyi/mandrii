import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { getSession } from "next-auth/react";
import { createClient } from "graphql-ws";

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

function getWebSocketUrl(endpoint: string) {
  const url = new URL(endpoint);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

const wsLink =
  typeof window === "undefined"
    ? null
    : new GraphQLWsLink(
        createClient({
          connectionParams: async () => {
            const session = await getSession();
            return session?.accessToken ? { headers: { Authorization: `Bearer ${session.accessToken}` } } : {};
          },
          lazy: true,
          retryAttempts: Infinity,
          url: getWebSocketUrl(publicConfig.hasura.endpoint),
        }),
      );

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
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

const client = new ApolloClient({
  cache,
  link: wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === "OperationDefinition" && definition.operation === "subscription";
        },
        wsLink,
        authLink.concat(httpLink),
      )
    : authLink.concat(httpLink),
});

export default client;
