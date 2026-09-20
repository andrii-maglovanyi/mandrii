import { DocumentNode, useQuery } from "@apollo/client";
import { getOperationName } from "@apollo/client/utilities";
import { useEffect, useMemo, useRef, useState } from "react";

import { useMediaQuery } from "~/hooks/useMediaQuery";
import { isPublicOperation } from "~/lib/public-cache/operations";
import { INFINITE_SCROLL_MEDIA_QUERY } from "~/lib/responsive";
import { APIParams } from "~/types";

interface UseInfiniteQueryOptions {
  [key: string]: unknown;
  skip?: boolean;
}

function getDataKeysFromQuery(doc: DocumentNode): string[] {
  const operation = doc.definitions.find((def) => def.kind === "OperationDefinition");
  if (!operation || operation.kind !== "OperationDefinition") return [];

  return operation.selectionSet.selections.filter((sel) => sel.kind === "Field").map((sel) => sel.name.value);
}

const EMPTY_ITEMS: Record<string, unknown>[] = [];

export const useGraphApi = <T extends Record<string, unknown>[]>(
  query: DocumentNode,
  variables: APIParams,
  options?: UseInfiniteQueryOptions,
) => {
  const isMobile = useMediaQuery({
    query: INFINITE_SCROLL_MEDIA_QUERY,
  });

  const queryVariables = { ...variables, offset: isMobile ? 0 : (variables.offset ?? 0) };

  const { data, error, fetchMore, loading } = useQuery(query, {
    fetchPolicy: isPublicOperation(getOperationName(query) ?? "") ? "cache-and-network" : "cache-first",
    variables: queryVariables,
    ...options,
  });

  const [fetchMoreError, setFetchMoreError] = useState<Error>();
  const generationRef = useRef(0);
  const queryKey = JSON.stringify({ ...variables, offset: undefined });
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const lastFetchedOffsetRef = useRef(0);
  const requestInProgressRef = useRef(false);

  const [dataKey] = useMemo(() => getDataKeysFromQuery(query), [query]);
  const aggregateKey: string = `${dataKey}_aggregate`;

  const items: T = options?.skip ? (EMPTY_ITEMS as T) : (data?.[dataKey] ?? (EMPTY_ITEMS as T));
  const count: number = options?.skip ? 0 : (data?.[aggregateKey]?.aggregate?.count ?? 0);
  const total: number = options?.skip ? 0 : (data?.total?.aggregate?.count ?? 0);

  useEffect(() => {
    generationRef.current += 1;
    lastFetchedOffsetRef.current = 0;
    requestInProgressRef.current = false;
    setIsFetchingMore(false);
    setFetchMoreError(undefined);
    return () => {
      generationRef.current += 1;
    };
  }, [query, queryKey, options?.skip]);

  useEffect(() => {
    if (options?.skip || !isMobile) return;

    if (!variables.offset || variables.offset <= lastFetchedOffsetRef.current) {
      return;
    }

    const loadMore = async () => {
      if (requestInProgressRef.current) {
        return;
      }

      if (items.length >= count) {
        return;
      }

      if (isFetchingMore || loading) {
        return;
      }

      const generation = generationRef.current;
      lastFetchedOffsetRef.current = variables.offset ?? 0;
      requestInProgressRef.current = true;
      setIsFetchingMore(true);

      try {
        await fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult || generation !== generationRef.current) return prev;

            return {
              ...prev,
              [aggregateKey]: fetchMoreResult[aggregateKey],
              [dataKey]: [...(prev[dataKey] ?? []), ...(fetchMoreResult[dataKey] ?? [])],
            };
          },
          variables: { ...variables, offset: items.length },
        });
      } catch (error) {
        if (generation === generationRef.current) {
          setFetchMoreError(error instanceof Error ? error : new Error("Unable to load more results"));
        }
      } finally {
        if (generation === generationRef.current) {
          setIsFetchingMore(false);
          requestInProgressRef.current = false;
        }
      }
    };

    loadMore();
  }, [
    options?.skip,
    isMobile,
    variables,
    items.length,
    count,
    isFetchingMore,
    loading,
    fetchMore,
    dataKey,
    aggregateKey,
  ]);

  return {
    count,
    data: items,
    error: options?.skip ? undefined : (error ?? fetchMoreError),
    hasMore: items.length < count,
    isFetchingMore: !options?.skip && isFetchingMore,
    isInitialLoading: !options?.skip && loading && items.length === 0,
    loading: !options?.skip && (loading || isFetchingMore),
    total,
  };
};
