import { DocumentNode, useQuery } from "@apollo/client";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";

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

export const useGraphApi = <T extends Record<string, unknown>[]>(
  query: DocumentNode,
  variables: APIParams,
  options?: UseInfiniteQueryOptions,
) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const queryVariables = isMobile ? { ...variables, offset: 0 } : variables;

  const { data, error, fetchMore, loading } = useQuery(query, {
    variables: queryVariables,
    ...options,
  });

  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const lastFetchedOffsetRef = useRef(0);
  const requestInProgressRef = useRef(false);

  const [dataKey] = getDataKeysFromQuery(query);
  const aggregateKey: string = `${dataKey}_aggregate`;

  const items: T = data?.[dataKey] ?? [];
  const total: number = data?.[aggregateKey]?.aggregate?.count ?? 0;

  useEffect(() => {
    if (!isMobile) return;

    if (!variables.offset || variables.offset <= lastFetchedOffsetRef.current) {
      return;
    }

    const loadMore = async () => {
      if (requestInProgressRef.current) {
        return;
      }

      if (items.length >= total) {
        return;
      }

      if (isFetchingMore || loading) {
        return;
      }

      lastFetchedOffsetRef.current = variables.offset ?? 0;
      requestInProgressRef.current = true;
      setIsFetchingMore(true);

      try {
        await fetchMore({
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;

            return {
              ...prev,
              [aggregateKey]: fetchMoreResult[aggregateKey],
              [dataKey]: [...(prev[dataKey] ?? []), ...(fetchMoreResult[dataKey] ?? [])],
            };
          },
          variables: { ...variables, offset: items.length },
        });
      } catch (error) {
        lastFetchedOffsetRef.current = items.length;
        throw error;
      } finally {
        setTimeout(() => {
          setIsFetchingMore(false);
          requestInProgressRef.current = false;
        }, 0);
      }
    };

    loadMore();
  }, [isMobile, variables, items.length, total, isFetchingMore, loading, fetchMore, dataKey, aggregateKey]);

  return {
    data: items,
    error,
    hasMore: items.length < total,
    isFetchingMore,
    isInitialLoading: loading && items.length === 0,
    loading: loading || isFetchingMore,
    total,
  };
};
