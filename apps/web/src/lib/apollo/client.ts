import type { Session } from "next-auth";

import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

import { isPublicOperation } from "~/lib/public-cache/operations";

import { publicConfig } from "../config/public";
import { getApolloAccessToken, setApolloSessionToken } from "./session-token";

const httpLink = new HttpLink({
  uri: publicConfig.hasura.endpoint,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await getApolloAccessToken();

  const authorizationHeader = token ? { Authorization: `Bearer ${token}` } : {};

  return {
    headers: {
      ...Object.fromEntries(Object.entries(headers ?? {}).filter(([name]) => name.toLowerCase() !== "authorization")),
      ...authorizationHeader,
    },
  };
});

function getWebSocketUrl(endpoint: string) {
  const url = new URL(endpoint);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

const wsClient =
  typeof window === "undefined"
    ? null
    : createClient({
        connectionParams: async () => {
          const token = await getApolloAccessToken();
          return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        },
        lazy: true,
        retryAttempts: Infinity,
        url: getWebSocketUrl(publicConfig.hasura.endpoint),
      });
const wsLink = wsClient ? new GraphQLWsLink(wsClient) : null;

let sessionIdentity: string | undefined;
let sessionToken: string | undefined;
export function syncApolloSession(session: null | Session) {
  setApolloSessionToken(session);
  const identity = session ? `${session.user.id}:${session.user.role}:${session.user.status}` : "anonymous";
  const identityChanged = sessionIdentity !== undefined && sessionIdentity !== identity;
  const tokenChanged = sessionToken !== session?.accessToken;
  sessionIdentity = identity;
  sessionToken = session?.accessToken;
  if (tokenChanged) wsClient?.terminate();
  if (identityChanged)
    void client.resetStore().catch((error) => console.error("Unable to refresh account data", error));
}

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

const readLink = split(
  (operation) => isPublicOperation(operation.operationName),
  new HttpLink({ uri: "/api/discovery" }),
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  cache,
  link: wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return definition.kind === "OperationDefinition" && definition.operation === "subscription";
        },
        wsLink,
        readLink,
      )
    : readLink,
});

export default client;
