export enum FILTER_OPERATORS {
  and = "_and",
  or = "_or",
}

export enum FILTER_TYPES {
  eq = "_eq",
  gt = "_gt",
  gte = "_gte",
  ilike = "_ilike",
  in = "_in",
  is_null = "_is_null",
  like = "_like",
  lt = "_lt",
  lte = "_lte",
  nilike = "_nilike",
  st_d_within = "_st_d_within",
}

export interface APIOptions {
  skip?: boolean;
}

export interface APIParams extends PaginateParams {
  order_by?: SortParams;
  where?: FilterParams;
  whereEvents?: FilterParams;
}

export type FilterOperators = {
  [FILTER_OPERATORS.and]?: Array<FilterParams>;
  [FILTER_OPERATORS.or]?: Array<FilterParams>;
};

export type FilterParams<T = FilterOperators & FilterTypes> = {
  [key: string]: Array<FilterParams<T>> | FilterParams<T> | T;
};

export interface FilterProps {
  onFilter: (filter: FilterParams) => void;
}

export type FilterTypes = {
  [FILTER_TYPES.eq]?: boolean | string;
  [FILTER_TYPES.gt]?: Date | string;
  [FILTER_TYPES.gte]?: Date | string;
  [FILTER_TYPES.ilike]?: string;
  [FILTER_TYPES.in]?: Array<string>;
  [FILTER_TYPES.is_null]?: boolean;
  [FILTER_TYPES.like]?: string;
  [FILTER_TYPES.lt]?: Date | string;
  [FILTER_TYPES.lte]?: Date | string;
  [FILTER_TYPES.nilike]?: string;
  [FILTER_TYPES.st_d_within]?: {
    distance: string;
    from: {
      coordinates: [number, number];
      type: "Point";
    };
  };
};

export interface PaginateParams {
  limit?: number;
  offset?: number;
}

export type SortDirections = "asc" | "desc";

export type SortParams = Array<SortParam>;

type SortParam = {
  [key: string]: SortDirections | SortParam;
};
