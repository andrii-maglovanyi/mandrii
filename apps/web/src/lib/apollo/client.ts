import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { getSession } from "next-auth/react";
import { createClient } from "graphql-ws";

import { publicConfig } from "../config/public";

const ACCESS_TOKEN_CACHE_MS = 30_000;
let accessTokenCache: { expiresAt: number; token: string | undefined } | null = null;
let accessTokenRequest: null | Promise<string | undefined> = null;

const getAccessToken = async () => {
  if (typeof window !== "undefined" && accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }
  if (typeof window !== "undefined" && accessTokenRequest) return accessTokenRequest;

  const load = async () => {
    let token: string | undefined;
    try {
      token = (await getSession())?.accessToken;
    } catch {
      // Session restoration can fail transiently (for example while an expired
      // cookie is being cleared). Public GraphQL requests must still work, and
      // a WebSocket reconnect must not turn that into an unbounded error loop.
      token = undefined;
    }
    if (typeof window !== "undefined") {
      accessTokenCache = { expiresAt: Date.now() + ACCESS_TOKEN_CACHE_MS, token };
    }
    return token;
  };

  if (typeof window !== "undefined") {
    accessTokenRequest = load().finally(() => {
      accessTokenRequest = null;
    });
    return accessTokenRequest;
  }

  return load();
};

const httpLink = new HttpLink({
  uri: publicConfig.hasura.endpoint,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();

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
            const token = await getAccessToken();
            return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
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
