import { addTypenameToDocument } from "@apollo/client/utilities";
import { type DocumentNode, print, valueFromASTUntyped } from "graphql";
import { unstable_cache } from "next/cache";

import type { FilterParams } from "~/types";

import { GET_PUBLIC_EVENT_SCHEDULES, GET_PUBLIC_EVENTS } from "~/graphql/events";
import { GET_PUBLIC_VENUE_OPTIONS, GET_PUBLIC_VENUES, GET_VENUE_BY_SLUG } from "~/graphql/venues";
import { publicConfig } from "~/lib/config/public";
import { getDiscoverableVenuesWhere, getPubliclyViewableEventsWhere } from "~/lib/content-visibility";

import { PUBLIC_CONTENT_TAG } from "./invalidate";
import { canonicalJson, isPublicOperation, type PublicOperation } from "./operations";
import { retryInvalidatedRead, singleFlight } from "./single-flight";

const documents: Record<PublicOperation, DocumentNode> = {
  GetPublicEvents: GET_PUBLIC_EVENTS,
  GetPublicEventSchedules: GET_PUBLIC_EVENT_SCHEDULES,
  GetPublicVenueOptions: GET_PUBLIC_VENUE_OPTIONS,
  GetPublicVenues: GET_PUBLIC_VENUES,
  GetVenueViewBySlug: GET_VENUE_BY_SLUG,
};

export function publicQueryVariables(operation: PublicOperation, input: Record<string, unknown>) {
  const document = documents[operation];
  const definition = document.definitions.find((item) => item.kind === "OperationDefinition");
  const allowed =
    definition?.kind === "OperationDefinition"
      ? (definition.variableDefinitions?.map((item) => item.variable.name.value) ?? [])
      : [];
  const variables = Object.fromEntries(Object.entries(input).filter(([key]) => allowed.includes(key)));
  // Defaults and unused aggregates must not split otherwise identical cache entries.
  if (definition?.kind === "OperationDefinition") {
    for (const item of definition.variableDefinitions ?? []) {
      if (variables[item.variable.name.value] === undefined && item.defaultValue) {
        variables[item.variable.name.value] = valueFromASTUntyped(item.defaultValue);
      }
    }
  }
  if (!variables.includeTotal) delete variables.totalWhere;
  if (allowed.includes("offset")) variables.offset ??= 0;
  const visibility = operation.includes("Event") ? getPubliclyViewableEventsWhere : getDiscoverableVenuesWhere;
  variables.where = visibility(variables.where as FilterParams | undefined);
  if (allowed.includes("totalWhere"))
    variables.totalWhere = visibility(variables.totalWhere as FilterParams | undefined);
  if (allowed.includes("whereEvents"))
    variables.whereEvents = getPubliclyViewableEventsWhere(variables.whereEvents as FilterParams | undefined);
  return variables;
}

const read = (operation: PublicOperation) =>
  unstable_cache(
    async (serializedVariables: string) =>
      singleFlight(`${operation}:${serializedVariables}`, async () => {
        const response = await fetch(publicConfig.hasura.endpoint, {
          // Never forward cookies, an account token, or an admin credential.
          body: JSON.stringify({
            query: print(addTypenameToDocument(documents[operation])),
            variables: JSON.parse(serializedVariables),
          }),
          cache: "no-store",
          headers: { "Content-Type": "application/json", "x-hasura-role": "public" },
          method: "POST",
          signal: AbortSignal.timeout(15_000),
        });
        if (!response.ok) throw new Error("Public content is temporarily unavailable");
        const result = await response.json();
        // Failed/partial reads must never populate the persistent cache.
        if (result.errors?.length || !result.data) throw new Error("Unable to load public content");
        return result.data;
      }),
    ["public-query-v2", publicConfig.hasura.endpoint, operation, print(documents[operation])],
    { revalidate: operation.includes("Event") ? 900 : 86400, tags: [PUBLIC_CONTENT_TAG] },
  );
const readers = Object.fromEntries(Object.keys(documents).map((name) => [name, read(name as PublicOperation)]));

export async function getCachedPublicQuery<T>(
  operation: PublicOperation,
  variables: Record<string, unknown>,
): Promise<{ data: T }> {
  if (!isPublicOperation(operation)) throw new Error("Unsupported public operation");
  // Mobile discovery asks for 12, then 24, then 36 ordered IDs. Reuse fixed
  // batches so scrolling doesn't re-query every previously displayed event.
  const where = variables.where as { _and?: Array<{ id?: { _in?: unknown[] } }> } | undefined;
  const clauses = Array.isArray(where?._and) ? where._and : [];
  const idClause = clauses.findIndex((clause) => Array.isArray(clause?.id?._in));
  const ids = idClause >= 0 ? clauses[idClause].id?._in : undefined;
  if (
    operation === "GetPublicEvents" &&
    ids &&
    ids.length > 12 &&
    new Set(ids).size === ids.length &&
    variables.limit === ids.length &&
    !variables.offset &&
    !variables.order_by &&
    !variables.includeCount &&
    !variables.includeTotal
  ) {
    const events: unknown[] = [];
    // Sequential batches bound origin concurrency on a completely cold request.
    for (let offset = 0; offset < ids.length; offset += 12) {
      const batch = ids.slice(offset, offset + 12);
      const batchClauses = clauses.map((clause, index) =>
        index === idClause ? { ...clause, id: { ...clause.id, _in: batch } } : clause,
      );
      const result = await getCachedPublicQuery<{ events: unknown[] }>(operation, {
        ...variables,
        limit: batch.length,
        where: { ...where, _and: batchClauses },
      });
      events.push(...result.data.events);
    }
    return { data: { events } as T };
  }
  const data = await retryInvalidatedRead(() =>
    readers[operation](canonicalJson(publicQueryVariables(operation, variables))),
  );
  return { data: data as T };
}
