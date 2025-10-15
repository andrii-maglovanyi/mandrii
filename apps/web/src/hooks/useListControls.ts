import { useCallback, useReducer } from "react";

import { APIParams, FilterParams, PaginateParams, SortParams } from "~/types";

const DEFAULT_LIMIT = 10;

const INITIAL_STATE: APIParams = {
  limit: DEFAULT_LIMIT,
  where: {},
};

enum ACTIONS {
  changeLimit = "CHANGE_LIMIT",
  filter = "FILTER",
  paginate = "PAGINATE",
  sort = "SORT",
}

type Action =
  | { payload: FilterParams; type: ACTIONS.filter }
  | { payload: number; type: ACTIONS.changeLimit }
  | { payload: PaginateParams; type: ACTIONS.paginate }
  | { payload: SortParams | undefined; type: ACTIONS.sort };

const reducer = (state: APIParams, action: Action): APIParams => {
  switch (action.type) {
    case ACTIONS.changeLimit: {
      return {
        ...state,
        limit: action.payload ?? state.limit,
      };
    }

    case ACTIONS.filter: {
      const resetOffset = state.offset ? { offset: 0 } : {};

      const stateWithoutWhere = Object.entries(state).reduce((acc, [key, value]) => {
        if (key.startsWith("where")) {
          return acc;
        }
        return { ...acc, [key]: value };
      }, {});

      const whereClauses: { [key: string]: object } = { where: {} };
      Object.keys(action.payload).forEach((key) => {
        if (key.startsWith("$")) {
          whereClauses[key.substring(1)] = action.payload[key];
        } else {
          whereClauses["where"] = {
            ...whereClauses.where,
            [key]: action.payload[key],
          };
        }
      });

      return {
        ...stateWithoutWhere,
        ...resetOffset,
        ...whereClauses,
      };
    }

    case ACTIONS.paginate: {
      const limit = action.payload.limit ?? state.limit ?? DEFAULT_LIMIT;
      const offset = action.payload.offset ?? state.offset ?? 0;

      return {
        ...state,
        limit: Math.max(1, limit),
        offset: Math.max(0, offset),
      };
    }
    case ACTIONS.sort:
      return {
        ...state,
        order_by: action.payload?.map((item) =>
          Object.entries(item).reduce(
            (acc, [key, value]) => {
              if (key.includes(".")) {
                const [outerKey, innerKey] = key.split(".");
                acc[outerKey] = { [innerKey]: value };
              } else {
                acc[key] = value;
              }
              return acc;
            },
            {} as SortParams[number],
          ),
        ),
      };
    default:
      throw new Error("Invalid action.");
  }
};

export const useListControls = (initialState: APIParams = {}) => {
  const [listState, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    ...initialState,
  });

  const handleFilter = useCallback((filter: FilterParams) => {
    dispatch({ payload: filter, type: ACTIONS.filter });
  }, []);

  const handlePaginate = useCallback(({ limit, offset = 0 }: PaginateParams) => {
    dispatch({ payload: { limit, offset }, type: ACTIONS.paginate });
  }, []);

  const handleSort = useCallback((sort?: SortParams) => {
    dispatch({ payload: sort, type: ACTIONS.sort });
  }, []);

  const handleChangePageSize = useCallback((payload: number) => {
    dispatch({ payload, type: ACTIONS.changeLimit });
  }, []);

  return {
    handleChangePageSize,
    handleFilter,
    handlePaginate,
    handleSort,
    listState,
  };
};
