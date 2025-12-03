import { Geography } from './geography';
import { Geometry } from './geometry';
import { Json } from './json';
import { Numeric } from './numeric';
import { Time } from './timestamp';
import { Timestamp } from './timestamp';
import { UUID } from './uuid';
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  geography: { input: Geography; output: Geography; }
  geometry: { input: Geometry; output: Geometry; }
  json: { input: Json; output: Json; }
  jsonb: { input: Json; output: Json; }
  numeric: { input: Numeric; output: Numeric; }
  time: { input: Time; output: Time; }
  timestamp: { input: Timestamp; output: Timestamp; }
  timestamptz: { input: Timestamp; output: Timestamp; }
  uuid: { input: UUID; output: UUID; }
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars['String']['input']>>;
  _eq?: InputMaybe<Array<Scalars['String']['input']>>;
  _gt?: InputMaybe<Array<Scalars['String']['input']>>;
  _gte?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Array<Scalars['String']['input']>>;
  _lte?: InputMaybe<Array<Scalars['String']['input']>>;
  _neq?: InputMaybe<Array<Scalars['String']['input']>>;
  _nin?: InputMaybe<Array<Array<Scalars['String']['input']>>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** columns and relationships of "accounts" */
export type Accounts = {
  __typename?: 'accounts';
  access_token?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['Int']['output']>;
  id: Scalars['uuid']['output'];
  id_token?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  providerAccountId: Scalars['String']['output'];
  /** An object relationship */
  provider_type: Provider_Type;
  refresh_token?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  session_state?: Maybe<Scalars['String']['output']>;
  token_type?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  /** An object relationship */
  user: Users;
  userId: Scalars['uuid']['output'];
};

/** aggregated selection of "accounts" */
export type Accounts_Aggregate = {
  __typename?: 'accounts_aggregate';
  aggregate?: Maybe<Accounts_Aggregate_Fields>;
  nodes: Array<Accounts>;
};

export type Accounts_Aggregate_Bool_Exp = {
  count?: InputMaybe<Accounts_Aggregate_Bool_Exp_Count>;
};

export type Accounts_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Accounts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Accounts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "accounts" */
export type Accounts_Aggregate_Fields = {
  __typename?: 'accounts_aggregate_fields';
  avg?: Maybe<Accounts_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Accounts_Max_Fields>;
  min?: Maybe<Accounts_Min_Fields>;
  stddev?: Maybe<Accounts_Stddev_Fields>;
  stddev_pop?: Maybe<Accounts_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Accounts_Stddev_Samp_Fields>;
  sum?: Maybe<Accounts_Sum_Fields>;
  var_pop?: Maybe<Accounts_Var_Pop_Fields>;
  var_samp?: Maybe<Accounts_Var_Samp_Fields>;
  variance?: Maybe<Accounts_Variance_Fields>;
};


/** aggregate fields of "accounts" */
export type Accounts_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Accounts_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "accounts" */
export type Accounts_Aggregate_Order_By = {
  avg?: InputMaybe<Accounts_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Accounts_Max_Order_By>;
  min?: InputMaybe<Accounts_Min_Order_By>;
  stddev?: InputMaybe<Accounts_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Accounts_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Accounts_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Accounts_Sum_Order_By>;
  var_pop?: InputMaybe<Accounts_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Accounts_Var_Samp_Order_By>;
  variance?: InputMaybe<Accounts_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "accounts" */
export type Accounts_Arr_Rel_Insert_Input = {
  data: Array<Accounts_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Accounts_On_Conflict>;
};

/** aggregate avg on columns */
export type Accounts_Avg_Fields = {
  __typename?: 'accounts_avg_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "accounts" */
export type Accounts_Avg_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "accounts". All fields are combined with a logical 'AND'. */
export type Accounts_Bool_Exp = {
  _and?: InputMaybe<Array<Accounts_Bool_Exp>>;
  _not?: InputMaybe<Accounts_Bool_Exp>;
  _or?: InputMaybe<Array<Accounts_Bool_Exp>>;
  access_token?: InputMaybe<String_Comparison_Exp>;
  expires_at?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  id_token?: InputMaybe<String_Comparison_Exp>;
  provider?: InputMaybe<String_Comparison_Exp>;
  providerAccountId?: InputMaybe<String_Comparison_Exp>;
  provider_type?: InputMaybe<Provider_Type_Bool_Exp>;
  refresh_token?: InputMaybe<String_Comparison_Exp>;
  scope?: InputMaybe<String_Comparison_Exp>;
  session_state?: InputMaybe<String_Comparison_Exp>;
  token_type?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "accounts" */
export enum Accounts_Constraint {
  /** unique or primary key constraint on columns "id" */
  AccountsPkey = 'accounts_pkey'
}

/** input type for incrementing numeric columns in table "accounts" */
export type Accounts_Inc_Input = {
  expires_at?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "accounts" */
export type Accounts_Insert_Input = {
  access_token?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  id_token?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  providerAccountId?: InputMaybe<Scalars['String']['input']>;
  provider_type?: InputMaybe<Provider_Type_Obj_Rel_Insert_Input>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  session_state?: InputMaybe<Scalars['String']['input']>;
  token_type?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Accounts_Max_Fields = {
  __typename?: 'accounts_max_fields';
  access_token?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  id_token?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  providerAccountId?: Maybe<Scalars['String']['output']>;
  refresh_token?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  session_state?: Maybe<Scalars['String']['output']>;
  token_type?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "accounts" */
export type Accounts_Max_Order_By = {
  access_token?: InputMaybe<Order_By>;
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  id_token?: InputMaybe<Order_By>;
  provider?: InputMaybe<Order_By>;
  providerAccountId?: InputMaybe<Order_By>;
  refresh_token?: InputMaybe<Order_By>;
  scope?: InputMaybe<Order_By>;
  session_state?: InputMaybe<Order_By>;
  token_type?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Accounts_Min_Fields = {
  __typename?: 'accounts_min_fields';
  access_token?: Maybe<Scalars['String']['output']>;
  expires_at?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  id_token?: Maybe<Scalars['String']['output']>;
  provider?: Maybe<Scalars['String']['output']>;
  providerAccountId?: Maybe<Scalars['String']['output']>;
  refresh_token?: Maybe<Scalars['String']['output']>;
  scope?: Maybe<Scalars['String']['output']>;
  session_state?: Maybe<Scalars['String']['output']>;
  token_type?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "accounts" */
export type Accounts_Min_Order_By = {
  access_token?: InputMaybe<Order_By>;
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  id_token?: InputMaybe<Order_By>;
  provider?: InputMaybe<Order_By>;
  providerAccountId?: InputMaybe<Order_By>;
  refresh_token?: InputMaybe<Order_By>;
  scope?: InputMaybe<Order_By>;
  session_state?: InputMaybe<Order_By>;
  token_type?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "accounts" */
export type Accounts_Mutation_Response = {
  __typename?: 'accounts_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Accounts>;
};

/** on_conflict condition type for table "accounts" */
export type Accounts_On_Conflict = {
  constraint: Accounts_Constraint;
  update_columns?: Array<Accounts_Update_Column>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

/** Ordering options when selecting data from "accounts". */
export type Accounts_Order_By = {
  access_token?: InputMaybe<Order_By>;
  expires_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  id_token?: InputMaybe<Order_By>;
  provider?: InputMaybe<Order_By>;
  providerAccountId?: InputMaybe<Order_By>;
  provider_type?: InputMaybe<Provider_Type_Order_By>;
  refresh_token?: InputMaybe<Order_By>;
  scope?: InputMaybe<Order_By>;
  session_state?: InputMaybe<Order_By>;
  token_type?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: accounts */
export type Accounts_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "accounts" */
export enum Accounts_Select_Column {
  /** column name */
  AccessToken = 'access_token',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  IdToken = 'id_token',
  /** column name */
  Provider = 'provider',
  /** column name */
  ProviderAccountId = 'providerAccountId',
  /** column name */
  RefreshToken = 'refresh_token',
  /** column name */
  Scope = 'scope',
  /** column name */
  SessionState = 'session_state',
  /** column name */
  TokenType = 'token_type',
  /** column name */
  Type = 'type',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "accounts" */
export type Accounts_Set_Input = {
  access_token?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  id_token?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  providerAccountId?: InputMaybe<Scalars['String']['input']>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  session_state?: InputMaybe<Scalars['String']['input']>;
  token_type?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Accounts_Stddev_Fields = {
  __typename?: 'accounts_stddev_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "accounts" */
export type Accounts_Stddev_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Accounts_Stddev_Pop_Fields = {
  __typename?: 'accounts_stddev_pop_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "accounts" */
export type Accounts_Stddev_Pop_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Accounts_Stddev_Samp_Fields = {
  __typename?: 'accounts_stddev_samp_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "accounts" */
export type Accounts_Stddev_Samp_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "accounts" */
export type Accounts_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Accounts_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Accounts_Stream_Cursor_Value_Input = {
  access_token?: InputMaybe<Scalars['String']['input']>;
  expires_at?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  id_token?: InputMaybe<Scalars['String']['input']>;
  provider?: InputMaybe<Scalars['String']['input']>;
  providerAccountId?: InputMaybe<Scalars['String']['input']>;
  refresh_token?: InputMaybe<Scalars['String']['input']>;
  scope?: InputMaybe<Scalars['String']['input']>;
  session_state?: InputMaybe<Scalars['String']['input']>;
  token_type?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Accounts_Sum_Fields = {
  __typename?: 'accounts_sum_fields';
  expires_at?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "accounts" */
export type Accounts_Sum_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** update columns of table "accounts" */
export enum Accounts_Update_Column {
  /** column name */
  AccessToken = 'access_token',
  /** column name */
  ExpiresAt = 'expires_at',
  /** column name */
  Id = 'id',
  /** column name */
  IdToken = 'id_token',
  /** column name */
  Provider = 'provider',
  /** column name */
  ProviderAccountId = 'providerAccountId',
  /** column name */
  RefreshToken = 'refresh_token',
  /** column name */
  Scope = 'scope',
  /** column name */
  SessionState = 'session_state',
  /** column name */
  TokenType = 'token_type',
  /** column name */
  Type = 'type',
  /** column name */
  UserId = 'userId'
}

export type Accounts_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Accounts_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Accounts_Set_Input>;
  /** filter the rows which have to be updated */
  where: Accounts_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Accounts_Var_Pop_Fields = {
  __typename?: 'accounts_var_pop_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "accounts" */
export type Accounts_Var_Pop_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Accounts_Var_Samp_Fields = {
  __typename?: 'accounts_var_samp_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "accounts" */
export type Accounts_Var_Samp_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Accounts_Variance_Fields = {
  __typename?: 'accounts_variance_fields';
  expires_at?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "accounts" */
export type Accounts_Variance_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** columns and relationships of "chains" */
export type Chains = {
  __typename?: 'chains';
  /** An object relationship */
  chain?: Maybe<Chains>;
  chain_id?: Maybe<Scalars['uuid']['output']>;
  /** An array relationship */
  chains: Array<Chains>;
  /** An aggregate relationship */
  chains_aggregate: Chains_Aggregate;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['uuid']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  owner_id?: Maybe<Scalars['uuid']['output']>;
  phone_numbers?: Maybe<Array<Scalars['String']['output']>>;
  slug: Scalars['String']['output'];
  social_links: Scalars['json']['output'];
  updated_at: Scalars['timestamptz']['output'];
  user_id: Scalars['uuid']['output'];
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
  website?: Maybe<Scalars['String']['output']>;
};


/** columns and relationships of "chains" */
export type ChainsChainsArgs = {
  distinct_on?: InputMaybe<Array<Chains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chains_Order_By>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


/** columns and relationships of "chains" */
export type ChainsChains_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Chains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chains_Order_By>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


/** columns and relationships of "chains" */
export type ChainsSocial_LinksArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** columns and relationships of "chains" */
export type ChainsVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


/** columns and relationships of "chains" */
export type ChainsVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** aggregated selection of "chains" */
export type Chains_Aggregate = {
  __typename?: 'chains_aggregate';
  aggregate?: Maybe<Chains_Aggregate_Fields>;
  nodes: Array<Chains>;
};

export type Chains_Aggregate_Bool_Exp = {
  count?: InputMaybe<Chains_Aggregate_Bool_Exp_Count>;
};

export type Chains_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Chains_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Chains_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "chains" */
export type Chains_Aggregate_Fields = {
  __typename?: 'chains_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Chains_Max_Fields>;
  min?: Maybe<Chains_Min_Fields>;
};


/** aggregate fields of "chains" */
export type Chains_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Chains_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "chains" */
export type Chains_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Chains_Max_Order_By>;
  min?: InputMaybe<Chains_Min_Order_By>;
};

/** input type for inserting array relation for remote table "chains" */
export type Chains_Arr_Rel_Insert_Input = {
  data: Array<Chains_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Chains_On_Conflict>;
};

/** Boolean expression to filter rows from the table "chains". All fields are combined with a logical 'AND'. */
export type Chains_Bool_Exp = {
  _and?: InputMaybe<Array<Chains_Bool_Exp>>;
  _not?: InputMaybe<Chains_Bool_Exp>;
  _or?: InputMaybe<Array<Chains_Bool_Exp>>;
  chain?: InputMaybe<Chains_Bool_Exp>;
  chain_id?: InputMaybe<Uuid_Comparison_Exp>;
  chains?: InputMaybe<Chains_Bool_Exp>;
  chains_aggregate?: InputMaybe<Chains_Aggregate_Bool_Exp>;
  city?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description_en?: InputMaybe<String_Comparison_Exp>;
  description_uk?: InputMaybe<String_Comparison_Exp>;
  emails?: InputMaybe<String_Array_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  logo?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  owner_id?: InputMaybe<Uuid_Comparison_Exp>;
  phone_numbers?: InputMaybe<String_Array_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  social_links?: InputMaybe<Json_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  venues?: InputMaybe<Venues_Bool_Exp>;
  venues_aggregate?: InputMaybe<Venues_Aggregate_Bool_Exp>;
  website?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "chains" */
export enum Chains_Constraint {
  /** unique or primary key constraint on columns "id" */
  ChainsPkey = 'chains_pkey',
  /** unique or primary key constraint on columns "slug" */
  ChainsSlugKey = 'chains_slug_key'
}

/** input type for inserting data into table "chains" */
export type Chains_Insert_Input = {
  chain?: InputMaybe<Chains_Obj_Rel_Insert_Input>;
  chain_id?: InputMaybe<Scalars['uuid']['input']>;
  chains?: InputMaybe<Chains_Arr_Rel_Insert_Input>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  phone_numbers?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['json']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  venues?: InputMaybe<Venues_Arr_Rel_Insert_Input>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Chains_Max_Fields = {
  __typename?: 'chains_max_fields';
  chain_id?: Maybe<Scalars['uuid']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['uuid']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  phone_numbers?: Maybe<Array<Scalars['String']['output']>>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "chains" */
export type Chains_Max_Order_By = {
  chain_id?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  phone_numbers?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Chains_Min_Fields = {
  __typename?: 'chains_min_fields';
  chain_id?: Maybe<Scalars['uuid']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['uuid']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  phone_numbers?: Maybe<Array<Scalars['String']['output']>>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "chains" */
export type Chains_Min_Order_By = {
  chain_id?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  phone_numbers?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "chains" */
export type Chains_Mutation_Response = {
  __typename?: 'chains_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Chains>;
};

/** input type for inserting object relation for remote table "chains" */
export type Chains_Obj_Rel_Insert_Input = {
  data: Chains_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Chains_On_Conflict>;
};

/** on_conflict condition type for table "chains" */
export type Chains_On_Conflict = {
  constraint: Chains_Constraint;
  update_columns?: Array<Chains_Update_Column>;
  where?: InputMaybe<Chains_Bool_Exp>;
};

/** Ordering options when selecting data from "chains". */
export type Chains_Order_By = {
  chain?: InputMaybe<Chains_Order_By>;
  chain_id?: InputMaybe<Order_By>;
  chains_aggregate?: InputMaybe<Chains_Aggregate_Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  phone_numbers?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  social_links?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  venues_aggregate?: InputMaybe<Venues_Aggregate_Order_By>;
  website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: chains */
export type Chains_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "chains" */
export enum Chains_Select_Column {
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  Emails = 'emails',
  /** column name */
  Id = 'id',
  /** column name */
  Logo = 'logo',
  /** column name */
  Name = 'name',
  /** column name */
  OwnerId = 'owner_id',
  /** column name */
  PhoneNumbers = 'phone_numbers',
  /** column name */
  Slug = 'slug',
  /** column name */
  SocialLinks = 'social_links',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  Website = 'website'
}

/** input type for updating data in table "chains" */
export type Chains_Set_Input = {
  chain_id?: InputMaybe<Scalars['uuid']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  phone_numbers?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['json']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "chains" */
export type Chains_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Chains_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Chains_Stream_Cursor_Value_Input = {
  chain_id?: InputMaybe<Scalars['uuid']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  phone_numbers?: InputMaybe<Array<Scalars['String']['input']>>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['json']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "chains" */
export enum Chains_Update_Column {
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  Emails = 'emails',
  /** column name */
  Id = 'id',
  /** column name */
  Logo = 'logo',
  /** column name */
  Name = 'name',
  /** column name */
  OwnerId = 'owner_id',
  /** column name */
  PhoneNumbers = 'phone_numbers',
  /** column name */
  Slug = 'slug',
  /** column name */
  SocialLinks = 'social_links',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  Website = 'website'
}

export type Chains_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Chains_Set_Input>;
  /** filter the rows which have to be updated */
  where: Chains_Bool_Exp;
};

/** columns and relationships of "clothing_age_group" */
export type Clothing_Age_Group = {
  __typename?: 'clothing_age_group';
  label_en: Scalars['String']['output'];
  label_uk: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

/** aggregated selection of "clothing_age_group" */
export type Clothing_Age_Group_Aggregate = {
  __typename?: 'clothing_age_group_aggregate';
  aggregate?: Maybe<Clothing_Age_Group_Aggregate_Fields>;
  nodes: Array<Clothing_Age_Group>;
};

/** aggregate fields of "clothing_age_group" */
export type Clothing_Age_Group_Aggregate_Fields = {
  __typename?: 'clothing_age_group_aggregate_fields';
  avg?: Maybe<Clothing_Age_Group_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Clothing_Age_Group_Max_Fields>;
  min?: Maybe<Clothing_Age_Group_Min_Fields>;
  stddev?: Maybe<Clothing_Age_Group_Stddev_Fields>;
  stddev_pop?: Maybe<Clothing_Age_Group_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Clothing_Age_Group_Stddev_Samp_Fields>;
  sum?: Maybe<Clothing_Age_Group_Sum_Fields>;
  var_pop?: Maybe<Clothing_Age_Group_Var_Pop_Fields>;
  var_samp?: Maybe<Clothing_Age_Group_Var_Samp_Fields>;
  variance?: Maybe<Clothing_Age_Group_Variance_Fields>;
};


/** aggregate fields of "clothing_age_group" */
export type Clothing_Age_Group_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Clothing_Age_Group_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Clothing_Age_Group_Avg_Fields = {
  __typename?: 'clothing_age_group_avg_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "clothing_age_group". All fields are combined with a logical 'AND'. */
export type Clothing_Age_Group_Bool_Exp = {
  _and?: InputMaybe<Array<Clothing_Age_Group_Bool_Exp>>;
  _not?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
  _or?: InputMaybe<Array<Clothing_Age_Group_Bool_Exp>>;
  label_en?: InputMaybe<String_Comparison_Exp>;
  label_uk?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "clothing_age_group" */
export enum Clothing_Age_Group_Constraint {
  /** unique or primary key constraint on columns "value" */
  ClothingAgeGroupPkey = 'clothing_age_group_pkey'
}

/** input type for incrementing numeric columns in table "clothing_age_group" */
export type Clothing_Age_Group_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "clothing_age_group" */
export type Clothing_Age_Group_Insert_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Clothing_Age_Group_Max_Fields = {
  __typename?: 'clothing_age_group_max_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Clothing_Age_Group_Min_Fields = {
  __typename?: 'clothing_age_group_min_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "clothing_age_group" */
export type Clothing_Age_Group_Mutation_Response = {
  __typename?: 'clothing_age_group_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Clothing_Age_Group>;
};

/** input type for inserting object relation for remote table "clothing_age_group" */
export type Clothing_Age_Group_Obj_Rel_Insert_Input = {
  data: Clothing_Age_Group_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Clothing_Age_Group_On_Conflict>;
};

/** on_conflict condition type for table "clothing_age_group" */
export type Clothing_Age_Group_On_Conflict = {
  constraint: Clothing_Age_Group_Constraint;
  update_columns?: Array<Clothing_Age_Group_Update_Column>;
  where?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
};

/** Ordering options when selecting data from "clothing_age_group". */
export type Clothing_Age_Group_Order_By = {
  label_en?: InputMaybe<Order_By>;
  label_uk?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: clothing_age_group */
export type Clothing_Age_Group_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "clothing_age_group" */
export enum Clothing_Age_Group_Select_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "clothing_age_group" */
export type Clothing_Age_Group_Set_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Clothing_Age_Group_Stddev_Fields = {
  __typename?: 'clothing_age_group_stddev_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Clothing_Age_Group_Stddev_Pop_Fields = {
  __typename?: 'clothing_age_group_stddev_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Clothing_Age_Group_Stddev_Samp_Fields = {
  __typename?: 'clothing_age_group_stddev_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "clothing_age_group" */
export type Clothing_Age_Group_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Clothing_Age_Group_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Clothing_Age_Group_Stream_Cursor_Value_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Clothing_Age_Group_Sum_Fields = {
  __typename?: 'clothing_age_group_sum_fields';
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "clothing_age_group" */
export enum Clothing_Age_Group_Update_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

export type Clothing_Age_Group_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Clothing_Age_Group_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Clothing_Age_Group_Set_Input>;
  /** filter the rows which have to be updated */
  where: Clothing_Age_Group_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Clothing_Age_Group_Var_Pop_Fields = {
  __typename?: 'clothing_age_group_var_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Clothing_Age_Group_Var_Samp_Fields = {
  __typename?: 'clothing_age_group_var_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Clothing_Age_Group_Variance_Fields = {
  __typename?: 'clothing_age_group_variance_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "clothing_gender" */
export type Clothing_Gender = {
  __typename?: 'clothing_gender';
  label_en: Scalars['String']['output'];
  label_uk: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

/** aggregated selection of "clothing_gender" */
export type Clothing_Gender_Aggregate = {
  __typename?: 'clothing_gender_aggregate';
  aggregate?: Maybe<Clothing_Gender_Aggregate_Fields>;
  nodes: Array<Clothing_Gender>;
};

/** aggregate fields of "clothing_gender" */
export type Clothing_Gender_Aggregate_Fields = {
  __typename?: 'clothing_gender_aggregate_fields';
  avg?: Maybe<Clothing_Gender_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Clothing_Gender_Max_Fields>;
  min?: Maybe<Clothing_Gender_Min_Fields>;
  stddev?: Maybe<Clothing_Gender_Stddev_Fields>;
  stddev_pop?: Maybe<Clothing_Gender_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Clothing_Gender_Stddev_Samp_Fields>;
  sum?: Maybe<Clothing_Gender_Sum_Fields>;
  var_pop?: Maybe<Clothing_Gender_Var_Pop_Fields>;
  var_samp?: Maybe<Clothing_Gender_Var_Samp_Fields>;
  variance?: Maybe<Clothing_Gender_Variance_Fields>;
};


/** aggregate fields of "clothing_gender" */
export type Clothing_Gender_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Clothing_Gender_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Clothing_Gender_Avg_Fields = {
  __typename?: 'clothing_gender_avg_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "clothing_gender". All fields are combined with a logical 'AND'. */
export type Clothing_Gender_Bool_Exp = {
  _and?: InputMaybe<Array<Clothing_Gender_Bool_Exp>>;
  _not?: InputMaybe<Clothing_Gender_Bool_Exp>;
  _or?: InputMaybe<Array<Clothing_Gender_Bool_Exp>>;
  label_en?: InputMaybe<String_Comparison_Exp>;
  label_uk?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "clothing_gender" */
export enum Clothing_Gender_Constraint {
  /** unique or primary key constraint on columns "value" */
  ClothingGenderPkey = 'clothing_gender_pkey'
}

/** input type for incrementing numeric columns in table "clothing_gender" */
export type Clothing_Gender_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "clothing_gender" */
export type Clothing_Gender_Insert_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Clothing_Gender_Max_Fields = {
  __typename?: 'clothing_gender_max_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Clothing_Gender_Min_Fields = {
  __typename?: 'clothing_gender_min_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "clothing_gender" */
export type Clothing_Gender_Mutation_Response = {
  __typename?: 'clothing_gender_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Clothing_Gender>;
};

/** input type for inserting object relation for remote table "clothing_gender" */
export type Clothing_Gender_Obj_Rel_Insert_Input = {
  data: Clothing_Gender_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Clothing_Gender_On_Conflict>;
};

/** on_conflict condition type for table "clothing_gender" */
export type Clothing_Gender_On_Conflict = {
  constraint: Clothing_Gender_Constraint;
  update_columns?: Array<Clothing_Gender_Update_Column>;
  where?: InputMaybe<Clothing_Gender_Bool_Exp>;
};

/** Ordering options when selecting data from "clothing_gender". */
export type Clothing_Gender_Order_By = {
  label_en?: InputMaybe<Order_By>;
  label_uk?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: clothing_gender */
export type Clothing_Gender_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "clothing_gender" */
export enum Clothing_Gender_Select_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "clothing_gender" */
export type Clothing_Gender_Set_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Clothing_Gender_Stddev_Fields = {
  __typename?: 'clothing_gender_stddev_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Clothing_Gender_Stddev_Pop_Fields = {
  __typename?: 'clothing_gender_stddev_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Clothing_Gender_Stddev_Samp_Fields = {
  __typename?: 'clothing_gender_stddev_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "clothing_gender" */
export type Clothing_Gender_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Clothing_Gender_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Clothing_Gender_Stream_Cursor_Value_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Clothing_Gender_Sum_Fields = {
  __typename?: 'clothing_gender_sum_fields';
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "clothing_gender" */
export enum Clothing_Gender_Update_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

export type Clothing_Gender_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Clothing_Gender_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Clothing_Gender_Set_Input>;
  /** filter the rows which have to be updated */
  where: Clothing_Gender_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Clothing_Gender_Var_Pop_Fields = {
  __typename?: 'clothing_gender_var_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Clothing_Gender_Var_Samp_Fields = {
  __typename?: 'clothing_gender_var_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Clothing_Gender_Variance_Fields = {
  __typename?: 'clothing_gender_variance_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "clothing_size" */
export type Clothing_Size = {
  __typename?: 'clothing_size';
  age_group: Scalars['String']['output'];
  label_en: Scalars['String']['output'];
  label_uk: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

/** aggregated selection of "clothing_size" */
export type Clothing_Size_Aggregate = {
  __typename?: 'clothing_size_aggregate';
  aggregate?: Maybe<Clothing_Size_Aggregate_Fields>;
  nodes: Array<Clothing_Size>;
};

/** aggregate fields of "clothing_size" */
export type Clothing_Size_Aggregate_Fields = {
  __typename?: 'clothing_size_aggregate_fields';
  avg?: Maybe<Clothing_Size_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Clothing_Size_Max_Fields>;
  min?: Maybe<Clothing_Size_Min_Fields>;
  stddev?: Maybe<Clothing_Size_Stddev_Fields>;
  stddev_pop?: Maybe<Clothing_Size_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Clothing_Size_Stddev_Samp_Fields>;
  sum?: Maybe<Clothing_Size_Sum_Fields>;
  var_pop?: Maybe<Clothing_Size_Var_Pop_Fields>;
  var_samp?: Maybe<Clothing_Size_Var_Samp_Fields>;
  variance?: Maybe<Clothing_Size_Variance_Fields>;
};


/** aggregate fields of "clothing_size" */
export type Clothing_Size_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Clothing_Size_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Clothing_Size_Avg_Fields = {
  __typename?: 'clothing_size_avg_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "clothing_size". All fields are combined with a logical 'AND'. */
export type Clothing_Size_Bool_Exp = {
  _and?: InputMaybe<Array<Clothing_Size_Bool_Exp>>;
  _not?: InputMaybe<Clothing_Size_Bool_Exp>;
  _or?: InputMaybe<Array<Clothing_Size_Bool_Exp>>;
  age_group?: InputMaybe<String_Comparison_Exp>;
  label_en?: InputMaybe<String_Comparison_Exp>;
  label_uk?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "clothing_size" */
export enum Clothing_Size_Constraint {
  /** unique or primary key constraint on columns "value" */
  ClothingSizePkey = 'clothing_size_pkey'
}

/** input type for incrementing numeric columns in table "clothing_size" */
export type Clothing_Size_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "clothing_size" */
export type Clothing_Size_Insert_Input = {
  age_group?: InputMaybe<Scalars['String']['input']>;
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Clothing_Size_Max_Fields = {
  __typename?: 'clothing_size_max_fields';
  age_group?: Maybe<Scalars['String']['output']>;
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Clothing_Size_Min_Fields = {
  __typename?: 'clothing_size_min_fields';
  age_group?: Maybe<Scalars['String']['output']>;
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "clothing_size" */
export type Clothing_Size_Mutation_Response = {
  __typename?: 'clothing_size_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Clothing_Size>;
};

/** input type for inserting object relation for remote table "clothing_size" */
export type Clothing_Size_Obj_Rel_Insert_Input = {
  data: Clothing_Size_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Clothing_Size_On_Conflict>;
};

/** on_conflict condition type for table "clothing_size" */
export type Clothing_Size_On_Conflict = {
  constraint: Clothing_Size_Constraint;
  update_columns?: Array<Clothing_Size_Update_Column>;
  where?: InputMaybe<Clothing_Size_Bool_Exp>;
};

/** Ordering options when selecting data from "clothing_size". */
export type Clothing_Size_Order_By = {
  age_group?: InputMaybe<Order_By>;
  label_en?: InputMaybe<Order_By>;
  label_uk?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: clothing_size */
export type Clothing_Size_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "clothing_size" */
export enum Clothing_Size_Select_Column {
  /** column name */
  AgeGroup = 'age_group',
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "clothing_size" */
export type Clothing_Size_Set_Input = {
  age_group?: InputMaybe<Scalars['String']['input']>;
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Clothing_Size_Stddev_Fields = {
  __typename?: 'clothing_size_stddev_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Clothing_Size_Stddev_Pop_Fields = {
  __typename?: 'clothing_size_stddev_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Clothing_Size_Stddev_Samp_Fields = {
  __typename?: 'clothing_size_stddev_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "clothing_size" */
export type Clothing_Size_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Clothing_Size_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Clothing_Size_Stream_Cursor_Value_Input = {
  age_group?: InputMaybe<Scalars['String']['input']>;
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Clothing_Size_Sum_Fields = {
  __typename?: 'clothing_size_sum_fields';
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "clothing_size" */
export enum Clothing_Size_Update_Column {
  /** column name */
  AgeGroup = 'age_group',
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

export type Clothing_Size_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Clothing_Size_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Clothing_Size_Set_Input>;
  /** filter the rows which have to be updated */
  where: Clothing_Size_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Clothing_Size_Var_Pop_Fields = {
  __typename?: 'clothing_size_var_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Clothing_Size_Var_Samp_Fields = {
  __typename?: 'clothing_size_var_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Clothing_Size_Variance_Fields = {
  __typename?: 'clothing_size_variance_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "clothing_type" */
export type Clothing_Type = {
  __typename?: 'clothing_type';
  label_en: Scalars['String']['output'];
  label_uk: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

/** aggregated selection of "clothing_type" */
export type Clothing_Type_Aggregate = {
  __typename?: 'clothing_type_aggregate';
  aggregate?: Maybe<Clothing_Type_Aggregate_Fields>;
  nodes: Array<Clothing_Type>;
};

/** aggregate fields of "clothing_type" */
export type Clothing_Type_Aggregate_Fields = {
  __typename?: 'clothing_type_aggregate_fields';
  avg?: Maybe<Clothing_Type_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Clothing_Type_Max_Fields>;
  min?: Maybe<Clothing_Type_Min_Fields>;
  stddev?: Maybe<Clothing_Type_Stddev_Fields>;
  stddev_pop?: Maybe<Clothing_Type_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Clothing_Type_Stddev_Samp_Fields>;
  sum?: Maybe<Clothing_Type_Sum_Fields>;
  var_pop?: Maybe<Clothing_Type_Var_Pop_Fields>;
  var_samp?: Maybe<Clothing_Type_Var_Samp_Fields>;
  variance?: Maybe<Clothing_Type_Variance_Fields>;
};


/** aggregate fields of "clothing_type" */
export type Clothing_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Clothing_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Clothing_Type_Avg_Fields = {
  __typename?: 'clothing_type_avg_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "clothing_type". All fields are combined with a logical 'AND'. */
export type Clothing_Type_Bool_Exp = {
  _and?: InputMaybe<Array<Clothing_Type_Bool_Exp>>;
  _not?: InputMaybe<Clothing_Type_Bool_Exp>;
  _or?: InputMaybe<Array<Clothing_Type_Bool_Exp>>;
  label_en?: InputMaybe<String_Comparison_Exp>;
  label_uk?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "clothing_type" */
export enum Clothing_Type_Constraint {
  /** unique or primary key constraint on columns "value" */
  ClothingTypePkey = 'clothing_type_pkey'
}

/** input type for incrementing numeric columns in table "clothing_type" */
export type Clothing_Type_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "clothing_type" */
export type Clothing_Type_Insert_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Clothing_Type_Max_Fields = {
  __typename?: 'clothing_type_max_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Clothing_Type_Min_Fields = {
  __typename?: 'clothing_type_min_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "clothing_type" */
export type Clothing_Type_Mutation_Response = {
  __typename?: 'clothing_type_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Clothing_Type>;
};

/** input type for inserting object relation for remote table "clothing_type" */
export type Clothing_Type_Obj_Rel_Insert_Input = {
  data: Clothing_Type_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Clothing_Type_On_Conflict>;
};

/** on_conflict condition type for table "clothing_type" */
export type Clothing_Type_On_Conflict = {
  constraint: Clothing_Type_Constraint;
  update_columns?: Array<Clothing_Type_Update_Column>;
  where?: InputMaybe<Clothing_Type_Bool_Exp>;
};

/** Ordering options when selecting data from "clothing_type". */
export type Clothing_Type_Order_By = {
  label_en?: InputMaybe<Order_By>;
  label_uk?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: clothing_type */
export type Clothing_Type_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "clothing_type" */
export enum Clothing_Type_Select_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "clothing_type" */
export type Clothing_Type_Set_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Clothing_Type_Stddev_Fields = {
  __typename?: 'clothing_type_stddev_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Clothing_Type_Stddev_Pop_Fields = {
  __typename?: 'clothing_type_stddev_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Clothing_Type_Stddev_Samp_Fields = {
  __typename?: 'clothing_type_stddev_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "clothing_type" */
export type Clothing_Type_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Clothing_Type_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Clothing_Type_Stream_Cursor_Value_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Clothing_Type_Sum_Fields = {
  __typename?: 'clothing_type_sum_fields';
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "clothing_type" */
export enum Clothing_Type_Update_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

export type Clothing_Type_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Clothing_Type_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Clothing_Type_Set_Input>;
  /** filter the rows which have to be updated */
  where: Clothing_Type_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Clothing_Type_Var_Pop_Fields = {
  __typename?: 'clothing_type_var_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Clothing_Type_Var_Samp_Fields = {
  __typename?: 'clothing_type_var_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Clothing_Type_Variance_Fields = {
  __typename?: 'clothing_type_variance_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** columns and relationships of "event_status" */
export type Event_Status = {
  __typename?: 'event_status';
  description?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

/** aggregated selection of "event_status" */
export type Event_Status_Aggregate = {
  __typename?: 'event_status_aggregate';
  aggregate?: Maybe<Event_Status_Aggregate_Fields>;
  nodes: Array<Event_Status>;
};

/** aggregate fields of "event_status" */
export type Event_Status_Aggregate_Fields = {
  __typename?: 'event_status_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Status_Max_Fields>;
  min?: Maybe<Event_Status_Min_Fields>;
};


/** aggregate fields of "event_status" */
export type Event_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event_status". All fields are combined with a logical 'AND'. */
export type Event_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Status_Bool_Exp>>;
  _not?: InputMaybe<Event_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Status_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "event_status" */
export enum Event_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  EventStatusPkey = 'event_status_pkey'
}

export enum Event_Status_Enum {
  /** Published and visible to public */
  Active = 'ACTIVE',
  /** Event is archived and hidden */
  Archived = 'ARCHIVED',
  /** Event has been cancelled */
  Cancelled = 'CANCELLED',
  /** Event has already occurred */
  Completed = 'COMPLETED',
  /** Draft event not yet submitted */
  Draft = 'DRAFT',
  /** Awaiting moderation approval */
  Pending = 'PENDING',
  /** Event has been postponed to new date */
  Postponed = 'POSTPONED'
}

/** Boolean expression to compare columns of type "event_status_enum". All fields are combined with logical 'AND'. */
export type Event_Status_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Event_Status_Enum>;
  _in?: InputMaybe<Array<Event_Status_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Event_Status_Enum>;
  _nin?: InputMaybe<Array<Event_Status_Enum>>;
};

/** input type for inserting data into table "event_status" */
export type Event_Status_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Event_Status_Max_Fields = {
  __typename?: 'event_status_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Event_Status_Min_Fields = {
  __typename?: 'event_status_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "event_status" */
export type Event_Status_Mutation_Response = {
  __typename?: 'event_status_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Status>;
};

/** input type for inserting object relation for remote table "event_status" */
export type Event_Status_Obj_Rel_Insert_Input = {
  data: Event_Status_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Event_Status_On_Conflict>;
};

/** on_conflict condition type for table "event_status" */
export type Event_Status_On_Conflict = {
  constraint: Event_Status_Constraint;
  update_columns?: Array<Event_Status_Update_Column>;
  where?: InputMaybe<Event_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "event_status". */
export type Event_Status_Order_By = {
  description?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event_status */
export type Event_Status_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "event_status" */
export enum Event_Status_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "event_status" */
export type Event_Status_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "event_status" */
export type Event_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Status_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "event_status" */
export enum Event_Status_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type Event_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Status_Bool_Exp;
};

/** Tags for categorizing and filtering events */
export type Event_Tags = {
  __typename?: 'event_tags';
  category?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  events_event_tags: Array<Events_Event_Tags>;
  /** An aggregate relationship */
  events_event_tags_aggregate: Events_Event_Tags_Aggregate;
  id: Scalars['uuid']['output'];
  name_en: Scalars['String']['output'];
  name_uk: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};


/** Tags for categorizing and filtering events */
export type Event_TagsEvents_Event_TagsArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


/** Tags for categorizing and filtering events */
export type Event_TagsEvents_Event_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};

/** aggregated selection of "event_tags" */
export type Event_Tags_Aggregate = {
  __typename?: 'event_tags_aggregate';
  aggregate?: Maybe<Event_Tags_Aggregate_Fields>;
  nodes: Array<Event_Tags>;
};

/** aggregate fields of "event_tags" */
export type Event_Tags_Aggregate_Fields = {
  __typename?: 'event_tags_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Tags_Max_Fields>;
  min?: Maybe<Event_Tags_Min_Fields>;
};


/** aggregate fields of "event_tags" */
export type Event_Tags_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event_tags". All fields are combined with a logical 'AND'. */
export type Event_Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Tags_Bool_Exp>>;
  _not?: InputMaybe<Event_Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Tags_Bool_Exp>>;
  category?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  events_event_tags?: InputMaybe<Events_Event_Tags_Bool_Exp>;
  events_event_tags_aggregate?: InputMaybe<Events_Event_Tags_Aggregate_Bool_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  name_en?: InputMaybe<String_Comparison_Exp>;
  name_uk?: InputMaybe<String_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "event_tags" */
export enum Event_Tags_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventTagsPkey = 'event_tags_pkey',
  /** unique or primary key constraint on columns "slug" */
  EventTagsSlugKey = 'event_tags_slug_key'
}

/** input type for inserting data into table "event_tags" */
export type Event_Tags_Insert_Input = {
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  events_event_tags?: InputMaybe<Events_Event_Tags_Arr_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name_en?: InputMaybe<Scalars['String']['input']>;
  name_uk?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Event_Tags_Max_Fields = {
  __typename?: 'event_tags_max_fields';
  category?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name_en?: Maybe<Scalars['String']['output']>;
  name_uk?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Event_Tags_Min_Fields = {
  __typename?: 'event_tags_min_fields';
  category?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name_en?: Maybe<Scalars['String']['output']>;
  name_uk?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "event_tags" */
export type Event_Tags_Mutation_Response = {
  __typename?: 'event_tags_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Tags>;
};

/** input type for inserting object relation for remote table "event_tags" */
export type Event_Tags_Obj_Rel_Insert_Input = {
  data: Event_Tags_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Event_Tags_On_Conflict>;
};

/** on_conflict condition type for table "event_tags" */
export type Event_Tags_On_Conflict = {
  constraint: Event_Tags_Constraint;
  update_columns?: Array<Event_Tags_Update_Column>;
  where?: InputMaybe<Event_Tags_Bool_Exp>;
};

/** Ordering options when selecting data from "event_tags". */
export type Event_Tags_Order_By = {
  category?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  events_event_tags_aggregate?: InputMaybe<Events_Event_Tags_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  name_en?: InputMaybe<Order_By>;
  name_uk?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event_tags */
export type Event_Tags_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "event_tags" */
export enum Event_Tags_Select_Column {
  /** column name */
  Category = 'category',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  NameEn = 'name_en',
  /** column name */
  NameUk = 'name_uk',
  /** column name */
  Slug = 'slug',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "event_tags" */
export type Event_Tags_Set_Input = {
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name_en?: InputMaybe<Scalars['String']['input']>;
  name_uk?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "event_tags" */
export type Event_Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Tags_Stream_Cursor_Value_Input = {
  category?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  name_en?: InputMaybe<Scalars['String']['input']>;
  name_uk?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "event_tags" */
export enum Event_Tags_Update_Column {
  /** column name */
  Category = 'category',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  NameEn = 'name_en',
  /** column name */
  NameUk = 'name_uk',
  /** column name */
  Slug = 'slug',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Event_Tags_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Tags_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Tags_Bool_Exp;
};

/** columns and relationships of "event_type" */
export type Event_Type = {
  __typename?: 'event_type';
  description?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

/** aggregated selection of "event_type" */
export type Event_Type_Aggregate = {
  __typename?: 'event_type_aggregate';
  aggregate?: Maybe<Event_Type_Aggregate_Fields>;
  nodes: Array<Event_Type>;
};

/** aggregate fields of "event_type" */
export type Event_Type_Aggregate_Fields = {
  __typename?: 'event_type_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Event_Type_Max_Fields>;
  min?: Maybe<Event_Type_Min_Fields>;
};


/** aggregate fields of "event_type" */
export type Event_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Event_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "event_type". All fields are combined with a logical 'AND'. */
export type Event_Type_Bool_Exp = {
  _and?: InputMaybe<Array<Event_Type_Bool_Exp>>;
  _not?: InputMaybe<Event_Type_Bool_Exp>;
  _or?: InputMaybe<Array<Event_Type_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "event_type" */
export enum Event_Type_Constraint {
  /** unique or primary key constraint on columns "value" */
  EventTypePkey = 'event_type_pkey'
}

export enum Event_Type_Enum {
  /** Celebration or party */
  Celebration = 'CELEBRATION',
  /** Charity or fundraising event */
  Charity = 'CHARITY',
  /** Music concert or performance */
  Concert = 'CONCERT',
  /** Conference or seminar */
  Conference = 'CONFERENCE',
  /** Art or cultural exhibition */
  Exhibition = 'EXHIBITION',
  /** Festival or large-scale event */
  Festival = 'FESTIVAL',
  /** Informal gathering or meetup */
  Gathering = 'GATHERING',
  /** Other type of event */
  Other = 'OTHER',
  /** Film or video screening */
  Screening = 'SCREENING',
  /** Sports event or activity */
  Sports = 'SPORTS',
  /** Theater performance */
  Theater = 'THEATER',
  /** Educational workshop or class */
  Workshop = 'WORKSHOP'
}

/** Boolean expression to compare columns of type "event_type_enum". All fields are combined with logical 'AND'. */
export type Event_Type_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Event_Type_Enum>;
  _in?: InputMaybe<Array<Event_Type_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Event_Type_Enum>;
  _nin?: InputMaybe<Array<Event_Type_Enum>>;
};

/** input type for inserting data into table "event_type" */
export type Event_Type_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Event_Type_Max_Fields = {
  __typename?: 'event_type_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Event_Type_Min_Fields = {
  __typename?: 'event_type_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "event_type" */
export type Event_Type_Mutation_Response = {
  __typename?: 'event_type_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Event_Type>;
};

/** input type for inserting object relation for remote table "event_type" */
export type Event_Type_Obj_Rel_Insert_Input = {
  data: Event_Type_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Event_Type_On_Conflict>;
};

/** on_conflict condition type for table "event_type" */
export type Event_Type_On_Conflict = {
  constraint: Event_Type_Constraint;
  update_columns?: Array<Event_Type_Update_Column>;
  where?: InputMaybe<Event_Type_Bool_Exp>;
};

/** Ordering options when selecting data from "event_type". */
export type Event_Type_Order_By = {
  description?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: event_type */
export type Event_Type_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "event_type" */
export enum Event_Type_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "event_type" */
export type Event_Type_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "event_type" */
export type Event_Type_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Event_Type_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Event_Type_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "event_type" */
export enum Event_Type_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type Event_Type_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Event_Type_Set_Input>;
  /** filter the rows which have to be updated */
  where: Event_Type_Bool_Exp;
};

/** Events at Ukrainian venues or custom locations */
export type Events = {
  __typename?: 'events';
  accessibility_info?: Maybe<Scalars['String']['output']>;
  age_restriction?: Maybe<Scalars['String']['output']>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  custom_location_address?: Maybe<Scalars['String']['output']>;
  custom_location_name?: Maybe<Scalars['String']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  end_date?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  event_price_type: Price_Type;
  /** An object relationship */
  event_status: Event_Status;
  /** An object relationship */
  event_type: Event_Type;
  /** An array relationship */
  events_event_tags: Array<Events_Event_Tags>;
  /** An aggregate relationship */
  events_event_tags_aggregate: Events_Event_Tags_Aggregate;
  external_url?: Maybe<Scalars['String']['output']>;
  geo?: Maybe<Scalars['geography']['output']>;
  id: Scalars['uuid']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  is_online: Scalars['Boolean']['output'];
  is_recurring: Scalars['Boolean']['output'];
  language?: Maybe<Array<Scalars['String']['output']>>;
  organizer_email?: Maybe<Scalars['String']['output']>;
  organizer_name?: Maybe<Scalars['String']['output']>;
  organizer_phone_number?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  owner?: Maybe<Users>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  price_amount?: Maybe<Scalars['numeric']['output']>;
  price_currency?: Maybe<Scalars['String']['output']>;
  price_type: Price_Type_Enum;
  recurrence_rule?: Maybe<Scalars['String']['output']>;
  registration_required: Scalars['Boolean']['output'];
  registration_url?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  social_links?: Maybe<Scalars['jsonb']['output']>;
  start_date: Scalars['timestamptz']['output'];
  status: Event_Status_Enum;
  title_en: Scalars['String']['output'];
  title_uk: Scalars['String']['output'];
  type: Event_Type_Enum;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user: Users;
  user_id: Scalars['uuid']['output'];
  /** An object relationship */
  venue?: Maybe<Venues>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};


/** Events at Ukrainian venues or custom locations */
export type EventsEvents_Event_TagsArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


/** Events at Ukrainian venues or custom locations */
export type EventsEvents_Event_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


/** Events at Ukrainian venues or custom locations */
export type EventsSocial_LinksArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "events" */
export type Events_Aggregate = {
  __typename?: 'events_aggregate';
  aggregate?: Maybe<Events_Aggregate_Fields>;
  nodes: Array<Events>;
};

export type Events_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Events_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Events_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Events_Aggregate_Bool_Exp_Count>;
};

export type Events_Aggregate_Bool_Exp_Bool_And = {
  arguments: Events_Select_Column_Events_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Events_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Events_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Events_Select_Column_Events_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Events_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Events_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Events_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Events_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "events" */
export type Events_Aggregate_Fields = {
  __typename?: 'events_aggregate_fields';
  avg?: Maybe<Events_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Events_Max_Fields>;
  min?: Maybe<Events_Min_Fields>;
  stddev?: Maybe<Events_Stddev_Fields>;
  stddev_pop?: Maybe<Events_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Events_Stddev_Samp_Fields>;
  sum?: Maybe<Events_Sum_Fields>;
  var_pop?: Maybe<Events_Var_Pop_Fields>;
  var_samp?: Maybe<Events_Var_Samp_Fields>;
  variance?: Maybe<Events_Variance_Fields>;
};


/** aggregate fields of "events" */
export type Events_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Events_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "events" */
export type Events_Aggregate_Order_By = {
  avg?: InputMaybe<Events_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Events_Max_Order_By>;
  min?: InputMaybe<Events_Min_Order_By>;
  stddev?: InputMaybe<Events_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Events_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Events_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Events_Sum_Order_By>;
  var_pop?: InputMaybe<Events_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Events_Var_Samp_Order_By>;
  variance?: InputMaybe<Events_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Events_Append_Input = {
  social_links?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "events" */
export type Events_Arr_Rel_Insert_Input = {
  data: Array<Events_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Events_On_Conflict>;
};

/** aggregate avg on columns */
export type Events_Avg_Fields = {
  __typename?: 'events_avg_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "events" */
export type Events_Avg_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "events". All fields are combined with a logical 'AND'. */
export type Events_Bool_Exp = {
  _and?: InputMaybe<Array<Events_Bool_Exp>>;
  _not?: InputMaybe<Events_Bool_Exp>;
  _or?: InputMaybe<Array<Events_Bool_Exp>>;
  accessibility_info?: InputMaybe<String_Comparison_Exp>;
  age_restriction?: InputMaybe<String_Comparison_Exp>;
  area?: InputMaybe<String_Comparison_Exp>;
  capacity?: InputMaybe<Int_Comparison_Exp>;
  city?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  custom_location_address?: InputMaybe<String_Comparison_Exp>;
  custom_location_name?: InputMaybe<String_Comparison_Exp>;
  description_en?: InputMaybe<String_Comparison_Exp>;
  description_uk?: InputMaybe<String_Comparison_Exp>;
  end_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  event_price_type?: InputMaybe<Price_Type_Bool_Exp>;
  event_status?: InputMaybe<Event_Status_Bool_Exp>;
  event_type?: InputMaybe<Event_Type_Bool_Exp>;
  events_event_tags?: InputMaybe<Events_Event_Tags_Bool_Exp>;
  events_event_tags_aggregate?: InputMaybe<Events_Event_Tags_Aggregate_Bool_Exp>;
  external_url?: InputMaybe<String_Comparison_Exp>;
  geo?: InputMaybe<Geography_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  images?: InputMaybe<String_Array_Comparison_Exp>;
  is_online?: InputMaybe<Boolean_Comparison_Exp>;
  is_recurring?: InputMaybe<Boolean_Comparison_Exp>;
  language?: InputMaybe<String_Array_Comparison_Exp>;
  organizer_email?: InputMaybe<String_Comparison_Exp>;
  organizer_name?: InputMaybe<String_Comparison_Exp>;
  organizer_phone_number?: InputMaybe<String_Comparison_Exp>;
  owner?: InputMaybe<Users_Bool_Exp>;
  owner_id?: InputMaybe<Uuid_Comparison_Exp>;
  price_amount?: InputMaybe<Numeric_Comparison_Exp>;
  price_currency?: InputMaybe<String_Comparison_Exp>;
  price_type?: InputMaybe<Price_Type_Enum_Comparison_Exp>;
  recurrence_rule?: InputMaybe<String_Comparison_Exp>;
  registration_required?: InputMaybe<Boolean_Comparison_Exp>;
  registration_url?: InputMaybe<String_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  social_links?: InputMaybe<Jsonb_Comparison_Exp>;
  start_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  status?: InputMaybe<Event_Status_Enum_Comparison_Exp>;
  title_en?: InputMaybe<String_Comparison_Exp>;
  title_uk?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<Event_Type_Enum_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "events" */
export enum Events_Constraint {
  /** unique or primary key constraint on columns "id" */
  EventsPkey = 'events_pkey',
  /** unique or primary key constraint on columns "slug" */
  EventsSlugKey = 'events_slug_key'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Events_Delete_At_Path_Input = {
  social_links?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Events_Delete_Elem_Input = {
  social_links?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Events_Delete_Key_Input = {
  social_links?: InputMaybe<Scalars['String']['input']>;
};

/** Many-to-many relationship between events and tags */
export type Events_Event_Tags = {
  __typename?: 'events_event_tags';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  event: Events;
  event_id: Scalars['uuid']['output'];
  /** An object relationship */
  event_tag: Event_Tags;
  tag_id: Scalars['uuid']['output'];
};

/** aggregated selection of "events_event_tags" */
export type Events_Event_Tags_Aggregate = {
  __typename?: 'events_event_tags_aggregate';
  aggregate?: Maybe<Events_Event_Tags_Aggregate_Fields>;
  nodes: Array<Events_Event_Tags>;
};

export type Events_Event_Tags_Aggregate_Bool_Exp = {
  count?: InputMaybe<Events_Event_Tags_Aggregate_Bool_Exp_Count>;
};

export type Events_Event_Tags_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Events_Event_Tags_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "events_event_tags" */
export type Events_Event_Tags_Aggregate_Fields = {
  __typename?: 'events_event_tags_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Events_Event_Tags_Max_Fields>;
  min?: Maybe<Events_Event_Tags_Min_Fields>;
};


/** aggregate fields of "events_event_tags" */
export type Events_Event_Tags_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "events_event_tags" */
export type Events_Event_Tags_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Events_Event_Tags_Max_Order_By>;
  min?: InputMaybe<Events_Event_Tags_Min_Order_By>;
};

/** input type for inserting array relation for remote table "events_event_tags" */
export type Events_Event_Tags_Arr_Rel_Insert_Input = {
  data: Array<Events_Event_Tags_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Events_Event_Tags_On_Conflict>;
};

/** Boolean expression to filter rows from the table "events_event_tags". All fields are combined with a logical 'AND'. */
export type Events_Event_Tags_Bool_Exp = {
  _and?: InputMaybe<Array<Events_Event_Tags_Bool_Exp>>;
  _not?: InputMaybe<Events_Event_Tags_Bool_Exp>;
  _or?: InputMaybe<Array<Events_Event_Tags_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  event?: InputMaybe<Events_Bool_Exp>;
  event_id?: InputMaybe<Uuid_Comparison_Exp>;
  event_tag?: InputMaybe<Event_Tags_Bool_Exp>;
  tag_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "events_event_tags" */
export enum Events_Event_Tags_Constraint {
  /** unique or primary key constraint on columns "tag_id", "event_id" */
  EventsEventTagsPkey = 'events_event_tags_pkey'
}

/** input type for inserting data into table "events_event_tags" */
export type Events_Event_Tags_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event?: InputMaybe<Events_Obj_Rel_Insert_Input>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  event_tag?: InputMaybe<Event_Tags_Obj_Rel_Insert_Input>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Events_Event_Tags_Max_Fields = {
  __typename?: 'events_event_tags_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  tag_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "events_event_tags" */
export type Events_Event_Tags_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Events_Event_Tags_Min_Fields = {
  __typename?: 'events_event_tags_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  event_id?: Maybe<Scalars['uuid']['output']>;
  tag_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "events_event_tags" */
export type Events_Event_Tags_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event_id?: InputMaybe<Order_By>;
  tag_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "events_event_tags" */
export type Events_Event_Tags_Mutation_Response = {
  __typename?: 'events_event_tags_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Events_Event_Tags>;
};

/** on_conflict condition type for table "events_event_tags" */
export type Events_Event_Tags_On_Conflict = {
  constraint: Events_Event_Tags_Constraint;
  update_columns?: Array<Events_Event_Tags_Update_Column>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};

/** Ordering options when selecting data from "events_event_tags". */
export type Events_Event_Tags_Order_By = {
  created_at?: InputMaybe<Order_By>;
  event?: InputMaybe<Events_Order_By>;
  event_id?: InputMaybe<Order_By>;
  event_tag?: InputMaybe<Event_Tags_Order_By>;
  tag_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: events_event_tags */
export type Events_Event_Tags_Pk_Columns_Input = {
  event_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};

/** select columns of table "events_event_tags" */
export enum Events_Event_Tags_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  TagId = 'tag_id'
}

/** input type for updating data in table "events_event_tags" */
export type Events_Event_Tags_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "events_event_tags" */
export type Events_Event_Tags_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Events_Event_Tags_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Events_Event_Tags_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  event_id?: InputMaybe<Scalars['uuid']['input']>;
  tag_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "events_event_tags" */
export enum Events_Event_Tags_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  EventId = 'event_id',
  /** column name */
  TagId = 'tag_id'
}

export type Events_Event_Tags_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Events_Event_Tags_Set_Input>;
  /** filter the rows which have to be updated */
  where: Events_Event_Tags_Bool_Exp;
};

/** input type for incrementing numeric columns in table "events" */
export type Events_Inc_Input = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
  price_amount?: InputMaybe<Scalars['numeric']['input']>;
};

/** input type for inserting data into table "events" */
export type Events_Insert_Input = {
  accessibility_info?: InputMaybe<Scalars['String']['input']>;
  age_restriction?: InputMaybe<Scalars['String']['input']>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  custom_location_address?: InputMaybe<Scalars['String']['input']>;
  custom_location_name?: InputMaybe<Scalars['String']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['timestamptz']['input']>;
  event_price_type?: InputMaybe<Price_Type_Obj_Rel_Insert_Input>;
  event_status?: InputMaybe<Event_Status_Obj_Rel_Insert_Input>;
  event_type?: InputMaybe<Event_Type_Obj_Rel_Insert_Input>;
  events_event_tags?: InputMaybe<Events_Event_Tags_Arr_Rel_Insert_Input>;
  external_url?: InputMaybe<Scalars['String']['input']>;
  geo?: InputMaybe<Scalars['geography']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  is_online?: InputMaybe<Scalars['Boolean']['input']>;
  is_recurring?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<Array<Scalars['String']['input']>>;
  organizer_email?: InputMaybe<Scalars['String']['input']>;
  organizer_name?: InputMaybe<Scalars['String']['input']>;
  organizer_phone_number?: InputMaybe<Scalars['String']['input']>;
  owner?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  price_amount?: InputMaybe<Scalars['numeric']['input']>;
  price_currency?: InputMaybe<Scalars['String']['input']>;
  price_type?: InputMaybe<Price_Type_Enum>;
  recurrence_rule?: InputMaybe<Scalars['String']['input']>;
  registration_required?: InputMaybe<Scalars['Boolean']['input']>;
  registration_url?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['jsonb']['input']>;
  start_date?: InputMaybe<Scalars['timestamptz']['input']>;
  status?: InputMaybe<Event_Status_Enum>;
  title_en?: InputMaybe<Scalars['String']['input']>;
  title_uk?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Event_Type_Enum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Events_Max_Fields = {
  __typename?: 'events_max_fields';
  accessibility_info?: Maybe<Scalars['String']['output']>;
  age_restriction?: Maybe<Scalars['String']['output']>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  custom_location_address?: Maybe<Scalars['String']['output']>;
  custom_location_name?: Maybe<Scalars['String']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  end_date?: Maybe<Scalars['timestamptz']['output']>;
  external_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  language?: Maybe<Array<Scalars['String']['output']>>;
  organizer_email?: Maybe<Scalars['String']['output']>;
  organizer_name?: Maybe<Scalars['String']['output']>;
  organizer_phone_number?: Maybe<Scalars['String']['output']>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  price_amount?: Maybe<Scalars['numeric']['output']>;
  price_currency?: Maybe<Scalars['String']['output']>;
  recurrence_rule?: Maybe<Scalars['String']['output']>;
  registration_url?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  start_date?: Maybe<Scalars['timestamptz']['output']>;
  title_en?: Maybe<Scalars['String']['output']>;
  title_uk?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "events" */
export type Events_Max_Order_By = {
  accessibility_info?: InputMaybe<Order_By>;
  age_restriction?: InputMaybe<Order_By>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  custom_location_address?: InputMaybe<Order_By>;
  custom_location_name?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  end_date?: InputMaybe<Order_By>;
  external_url?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  language?: InputMaybe<Order_By>;
  organizer_email?: InputMaybe<Order_By>;
  organizer_name?: InputMaybe<Order_By>;
  organizer_phone_number?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
  price_currency?: InputMaybe<Order_By>;
  recurrence_rule?: InputMaybe<Order_By>;
  registration_url?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  title_en?: InputMaybe<Order_By>;
  title_uk?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Events_Min_Fields = {
  __typename?: 'events_min_fields';
  accessibility_info?: Maybe<Scalars['String']['output']>;
  age_restriction?: Maybe<Scalars['String']['output']>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['Int']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  custom_location_address?: Maybe<Scalars['String']['output']>;
  custom_location_name?: Maybe<Scalars['String']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  end_date?: Maybe<Scalars['timestamptz']['output']>;
  external_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  language?: Maybe<Array<Scalars['String']['output']>>;
  organizer_email?: Maybe<Scalars['String']['output']>;
  organizer_name?: Maybe<Scalars['String']['output']>;
  organizer_phone_number?: Maybe<Scalars['String']['output']>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  price_amount?: Maybe<Scalars['numeric']['output']>;
  price_currency?: Maybe<Scalars['String']['output']>;
  recurrence_rule?: Maybe<Scalars['String']['output']>;
  registration_url?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  start_date?: Maybe<Scalars['timestamptz']['output']>;
  title_en?: Maybe<Scalars['String']['output']>;
  title_uk?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "events" */
export type Events_Min_Order_By = {
  accessibility_info?: InputMaybe<Order_By>;
  age_restriction?: InputMaybe<Order_By>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  custom_location_address?: InputMaybe<Order_By>;
  custom_location_name?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  end_date?: InputMaybe<Order_By>;
  external_url?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  language?: InputMaybe<Order_By>;
  organizer_email?: InputMaybe<Order_By>;
  organizer_name?: InputMaybe<Order_By>;
  organizer_phone_number?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
  price_currency?: InputMaybe<Order_By>;
  recurrence_rule?: InputMaybe<Order_By>;
  registration_url?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  title_en?: InputMaybe<Order_By>;
  title_uk?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "events" */
export type Events_Mutation_Response = {
  __typename?: 'events_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Events>;
};

/** input type for inserting object relation for remote table "events" */
export type Events_Obj_Rel_Insert_Input = {
  data: Events_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Events_On_Conflict>;
};

/** on_conflict condition type for table "events" */
export type Events_On_Conflict = {
  constraint: Events_Constraint;
  update_columns?: Array<Events_Update_Column>;
  where?: InputMaybe<Events_Bool_Exp>;
};

/** Ordering options when selecting data from "events". */
export type Events_Order_By = {
  accessibility_info?: InputMaybe<Order_By>;
  age_restriction?: InputMaybe<Order_By>;
  area?: InputMaybe<Order_By>;
  capacity?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  custom_location_address?: InputMaybe<Order_By>;
  custom_location_name?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  end_date?: InputMaybe<Order_By>;
  event_price_type?: InputMaybe<Price_Type_Order_By>;
  event_status?: InputMaybe<Event_Status_Order_By>;
  event_type?: InputMaybe<Event_Type_Order_By>;
  events_event_tags_aggregate?: InputMaybe<Events_Event_Tags_Aggregate_Order_By>;
  external_url?: InputMaybe<Order_By>;
  geo?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  is_online?: InputMaybe<Order_By>;
  is_recurring?: InputMaybe<Order_By>;
  language?: InputMaybe<Order_By>;
  organizer_email?: InputMaybe<Order_By>;
  organizer_name?: InputMaybe<Order_By>;
  organizer_phone_number?: InputMaybe<Order_By>;
  owner?: InputMaybe<Users_Order_By>;
  owner_id?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
  price_currency?: InputMaybe<Order_By>;
  price_type?: InputMaybe<Order_By>;
  recurrence_rule?: InputMaybe<Order_By>;
  registration_required?: InputMaybe<Order_By>;
  registration_url?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  social_links?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  title_en?: InputMaybe<Order_By>;
  title_uk?: InputMaybe<Order_By>;
  type?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: events */
export type Events_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Events_Prepend_Input = {
  social_links?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "events" */
export enum Events_Select_Column {
  /** column name */
  AccessibilityInfo = 'accessibility_info',
  /** column name */
  AgeRestriction = 'age_restriction',
  /** column name */
  Area = 'area',
  /** column name */
  Capacity = 'capacity',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CustomLocationAddress = 'custom_location_address',
  /** column name */
  CustomLocationName = 'custom_location_name',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  EndDate = 'end_date',
  /** column name */
  ExternalUrl = 'external_url',
  /** column name */
  Geo = 'geo',
  /** column name */
  Id = 'id',
  /** column name */
  Images = 'images',
  /** column name */
  IsOnline = 'is_online',
  /** column name */
  IsRecurring = 'is_recurring',
  /** column name */
  Language = 'language',
  /** column name */
  OrganizerEmail = 'organizer_email',
  /** column name */
  OrganizerName = 'organizer_name',
  /** column name */
  OrganizerPhoneNumber = 'organizer_phone_number',
  /** column name */
  OwnerId = 'owner_id',
  /** column name */
  PriceAmount = 'price_amount',
  /** column name */
  PriceCurrency = 'price_currency',
  /** column name */
  PriceType = 'price_type',
  /** column name */
  RecurrenceRule = 'recurrence_rule',
  /** column name */
  RegistrationRequired = 'registration_required',
  /** column name */
  RegistrationUrl = 'registration_url',
  /** column name */
  Slug = 'slug',
  /** column name */
  SocialLinks = 'social_links',
  /** column name */
  StartDate = 'start_date',
  /** column name */
  Status = 'status',
  /** column name */
  TitleEn = 'title_en',
  /** column name */
  TitleUk = 'title_uk',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VenueId = 'venue_id'
}

/** select "events_aggregate_bool_exp_bool_and_arguments_columns" columns of table "events" */
export enum Events_Select_Column_Events_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsOnline = 'is_online',
  /** column name */
  IsRecurring = 'is_recurring',
  /** column name */
  RegistrationRequired = 'registration_required'
}

/** select "events_aggregate_bool_exp_bool_or_arguments_columns" columns of table "events" */
export enum Events_Select_Column_Events_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsOnline = 'is_online',
  /** column name */
  IsRecurring = 'is_recurring',
  /** column name */
  RegistrationRequired = 'registration_required'
}

/** input type for updating data in table "events" */
export type Events_Set_Input = {
  accessibility_info?: InputMaybe<Scalars['String']['input']>;
  age_restriction?: InputMaybe<Scalars['String']['input']>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  custom_location_address?: InputMaybe<Scalars['String']['input']>;
  custom_location_name?: InputMaybe<Scalars['String']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_url?: InputMaybe<Scalars['String']['input']>;
  geo?: InputMaybe<Scalars['geography']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  is_online?: InputMaybe<Scalars['Boolean']['input']>;
  is_recurring?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<Array<Scalars['String']['input']>>;
  organizer_email?: InputMaybe<Scalars['String']['input']>;
  organizer_name?: InputMaybe<Scalars['String']['input']>;
  organizer_phone_number?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  price_amount?: InputMaybe<Scalars['numeric']['input']>;
  price_currency?: InputMaybe<Scalars['String']['input']>;
  price_type?: InputMaybe<Price_Type_Enum>;
  recurrence_rule?: InputMaybe<Scalars['String']['input']>;
  registration_required?: InputMaybe<Scalars['Boolean']['input']>;
  registration_url?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['jsonb']['input']>;
  start_date?: InputMaybe<Scalars['timestamptz']['input']>;
  status?: InputMaybe<Event_Status_Enum>;
  title_en?: InputMaybe<Scalars['String']['input']>;
  title_uk?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Event_Type_Enum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Events_Stddev_Fields = {
  __typename?: 'events_stddev_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "events" */
export type Events_Stddev_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Events_Stddev_Pop_Fields = {
  __typename?: 'events_stddev_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "events" */
export type Events_Stddev_Pop_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Events_Stddev_Samp_Fields = {
  __typename?: 'events_stddev_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "events" */
export type Events_Stddev_Samp_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "events" */
export type Events_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Events_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Events_Stream_Cursor_Value_Input = {
  accessibility_info?: InputMaybe<Scalars['String']['input']>;
  age_restriction?: InputMaybe<Scalars['String']['input']>;
  /** Searchable location details (auto-populated from geocoding, similar to venues.area) */
  area?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['Int']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  custom_location_address?: InputMaybe<Scalars['String']['input']>;
  custom_location_name?: InputMaybe<Scalars['String']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  end_date?: InputMaybe<Scalars['timestamptz']['input']>;
  external_url?: InputMaybe<Scalars['String']['input']>;
  geo?: InputMaybe<Scalars['geography']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  is_online?: InputMaybe<Scalars['Boolean']['input']>;
  is_recurring?: InputMaybe<Scalars['Boolean']['input']>;
  language?: InputMaybe<Array<Scalars['String']['input']>>;
  organizer_email?: InputMaybe<Scalars['String']['input']>;
  organizer_name?: InputMaybe<Scalars['String']['input']>;
  organizer_phone_number?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  price_amount?: InputMaybe<Scalars['numeric']['input']>;
  price_currency?: InputMaybe<Scalars['String']['input']>;
  price_type?: InputMaybe<Price_Type_Enum>;
  recurrence_rule?: InputMaybe<Scalars['String']['input']>;
  registration_required?: InputMaybe<Scalars['Boolean']['input']>;
  registration_url?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['jsonb']['input']>;
  start_date?: InputMaybe<Scalars['timestamptz']['input']>;
  status?: InputMaybe<Event_Status_Enum>;
  title_en?: InputMaybe<Scalars['String']['input']>;
  title_uk?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Event_Type_Enum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Events_Sum_Fields = {
  __typename?: 'events_sum_fields';
  capacity?: Maybe<Scalars['Int']['output']>;
  price_amount?: Maybe<Scalars['numeric']['output']>;
};

/** order by sum() on columns of table "events" */
export type Events_Sum_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** update columns of table "events" */
export enum Events_Update_Column {
  /** column name */
  AccessibilityInfo = 'accessibility_info',
  /** column name */
  AgeRestriction = 'age_restriction',
  /** column name */
  Area = 'area',
  /** column name */
  Capacity = 'capacity',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  CustomLocationAddress = 'custom_location_address',
  /** column name */
  CustomLocationName = 'custom_location_name',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  EndDate = 'end_date',
  /** column name */
  ExternalUrl = 'external_url',
  /** column name */
  Geo = 'geo',
  /** column name */
  Id = 'id',
  /** column name */
  Images = 'images',
  /** column name */
  IsOnline = 'is_online',
  /** column name */
  IsRecurring = 'is_recurring',
  /** column name */
  Language = 'language',
  /** column name */
  OrganizerEmail = 'organizer_email',
  /** column name */
  OrganizerName = 'organizer_name',
  /** column name */
  OrganizerPhoneNumber = 'organizer_phone_number',
  /** column name */
  OwnerId = 'owner_id',
  /** column name */
  PriceAmount = 'price_amount',
  /** column name */
  PriceCurrency = 'price_currency',
  /** column name */
  PriceType = 'price_type',
  /** column name */
  RecurrenceRule = 'recurrence_rule',
  /** column name */
  RegistrationRequired = 'registration_required',
  /** column name */
  RegistrationUrl = 'registration_url',
  /** column name */
  Slug = 'slug',
  /** column name */
  SocialLinks = 'social_links',
  /** column name */
  StartDate = 'start_date',
  /** column name */
  Status = 'status',
  /** column name */
  TitleEn = 'title_en',
  /** column name */
  TitleUk = 'title_uk',
  /** column name */
  Type = 'type',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  VenueId = 'venue_id'
}

export type Events_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Events_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Events_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Events_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Events_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Events_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Events_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Events_Set_Input>;
  /** filter the rows which have to be updated */
  where: Events_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Events_Var_Pop_Fields = {
  __typename?: 'events_var_pop_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "events" */
export type Events_Var_Pop_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Events_Var_Samp_Fields = {
  __typename?: 'events_var_samp_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "events" */
export type Events_Var_Samp_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Events_Variance_Fields = {
  __typename?: 'events_variance_fields';
  capacity?: Maybe<Scalars['Float']['output']>;
  price_amount?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "events" */
export type Events_Variance_Order_By = {
  capacity?: InputMaybe<Order_By>;
  price_amount?: InputMaybe<Order_By>;
};

export type Geography_Cast_Exp = {
  geometry?: InputMaybe<Geometry_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "geography". All fields are combined with logical 'AND'. */
export type Geography_Comparison_Exp = {
  _cast?: InputMaybe<Geography_Cast_Exp>;
  _eq?: InputMaybe<Scalars['geography']['input']>;
  _gt?: InputMaybe<Scalars['geography']['input']>;
  _gte?: InputMaybe<Scalars['geography']['input']>;
  _in?: InputMaybe<Array<Scalars['geography']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['geography']['input']>;
  _lte?: InputMaybe<Scalars['geography']['input']>;
  _neq?: InputMaybe<Scalars['geography']['input']>;
  _nin?: InputMaybe<Array<Scalars['geography']['input']>>;
  /** is the column within a given distance from the given geography value */
  _st_d_within?: InputMaybe<St_D_Within_Geography_Input>;
  /** does the column spatially intersect the given geography value */
  _st_intersects?: InputMaybe<Scalars['geography']['input']>;
};

export type Geometry_Cast_Exp = {
  geography?: InputMaybe<Geography_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "geometry". All fields are combined with logical 'AND'. */
export type Geometry_Comparison_Exp = {
  _cast?: InputMaybe<Geometry_Cast_Exp>;
  _eq?: InputMaybe<Scalars['geometry']['input']>;
  _gt?: InputMaybe<Scalars['geometry']['input']>;
  _gte?: InputMaybe<Scalars['geometry']['input']>;
  _in?: InputMaybe<Array<Scalars['geometry']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['geometry']['input']>;
  _lte?: InputMaybe<Scalars['geometry']['input']>;
  _neq?: InputMaybe<Scalars['geometry']['input']>;
  _nin?: InputMaybe<Array<Scalars['geometry']['input']>>;
  /** is the column within a given 3D distance from the given geometry value */
  _st_3d_d_within?: InputMaybe<St_D_Within_Input>;
  /** does the column spatially intersect the given geometry value in 3D */
  _st_3d_intersects?: InputMaybe<Scalars['geometry']['input']>;
  /** does the column contain the given geometry value */
  _st_contains?: InputMaybe<Scalars['geometry']['input']>;
  /** does the column cross the given geometry value */
  _st_crosses?: InputMaybe<Scalars['geometry']['input']>;
  /** is the column within a given distance from the given geometry value */
  _st_d_within?: InputMaybe<St_D_Within_Input>;
  /** is the column equal to given geometry value (directionality is ignored) */
  _st_equals?: InputMaybe<Scalars['geometry']['input']>;
  /** does the column spatially intersect the given geometry value */
  _st_intersects?: InputMaybe<Scalars['geometry']['input']>;
  /** does the column 'spatially overlap' (intersect but not completely contain) the given geometry value */
  _st_overlaps?: InputMaybe<Scalars['geometry']['input']>;
  /** does the column have atleast one point in common with the given geometry value */
  _st_touches?: InputMaybe<Scalars['geometry']['input']>;
  /** is the column contained in the given geometry value */
  _st_within?: InputMaybe<Scalars['geometry']['input']>;
};

/** Boolean expression to compare columns of type "json". All fields are combined with logical 'AND'. */
export type Json_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['json']['input']>;
  _gt?: InputMaybe<Scalars['json']['input']>;
  _gte?: InputMaybe<Scalars['json']['input']>;
  _in?: InputMaybe<Array<Scalars['json']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['json']['input']>;
  _lte?: InputMaybe<Scalars['json']['input']>;
  _neq?: InputMaybe<Scalars['json']['input']>;
  _nin?: InputMaybe<Array<Scalars['json']['input']>>;
};

export type Jsonb_Cast_Exp = {
  String?: InputMaybe<String_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export type Jsonb_Comparison_Exp = {
  _cast?: InputMaybe<Jsonb_Cast_Exp>;
  /** is the column contained in the given json value */
  _contained_in?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the column contain the given json value at the top level */
  _contains?: InputMaybe<Scalars['jsonb']['input']>;
  _eq?: InputMaybe<Scalars['jsonb']['input']>;
  _gt?: InputMaybe<Scalars['jsonb']['input']>;
  _gte?: InputMaybe<Scalars['jsonb']['input']>;
  /** does the string exist as a top-level key in the column */
  _has_key?: InputMaybe<Scalars['String']['input']>;
  /** do all of these strings exist as top-level keys in the column */
  _has_keys_all?: InputMaybe<Array<Scalars['String']['input']>>;
  /** do any of these strings exist as top-level keys in the column */
  _has_keys_any?: InputMaybe<Array<Scalars['String']['input']>>;
  _in?: InputMaybe<Array<Scalars['jsonb']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['jsonb']['input']>;
  _lte?: InputMaybe<Scalars['jsonb']['input']>;
  _neq?: InputMaybe<Scalars['jsonb']['input']>;
  _nin?: InputMaybe<Array<Scalars['jsonb']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "accounts" */
  delete_accounts?: Maybe<Accounts_Mutation_Response>;
  /** delete single row from the table: "accounts" */
  delete_accounts_by_pk?: Maybe<Accounts>;
  /** delete data from the table: "chains" */
  delete_chains?: Maybe<Chains_Mutation_Response>;
  /** delete single row from the table: "chains" */
  delete_chains_by_pk?: Maybe<Chains>;
  /** delete data from the table: "clothing_age_group" */
  delete_clothing_age_group?: Maybe<Clothing_Age_Group_Mutation_Response>;
  /** delete single row from the table: "clothing_age_group" */
  delete_clothing_age_group_by_pk?: Maybe<Clothing_Age_Group>;
  /** delete data from the table: "clothing_gender" */
  delete_clothing_gender?: Maybe<Clothing_Gender_Mutation_Response>;
  /** delete single row from the table: "clothing_gender" */
  delete_clothing_gender_by_pk?: Maybe<Clothing_Gender>;
  /** delete data from the table: "clothing_size" */
  delete_clothing_size?: Maybe<Clothing_Size_Mutation_Response>;
  /** delete single row from the table: "clothing_size" */
  delete_clothing_size_by_pk?: Maybe<Clothing_Size>;
  /** delete data from the table: "clothing_type" */
  delete_clothing_type?: Maybe<Clothing_Type_Mutation_Response>;
  /** delete single row from the table: "clothing_type" */
  delete_clothing_type_by_pk?: Maybe<Clothing_Type>;
  /** delete data from the table: "event_status" */
  delete_event_status?: Maybe<Event_Status_Mutation_Response>;
  /** delete single row from the table: "event_status" */
  delete_event_status_by_pk?: Maybe<Event_Status>;
  /** delete data from the table: "event_tags" */
  delete_event_tags?: Maybe<Event_Tags_Mutation_Response>;
  /** delete single row from the table: "event_tags" */
  delete_event_tags_by_pk?: Maybe<Event_Tags>;
  /** delete data from the table: "event_type" */
  delete_event_type?: Maybe<Event_Type_Mutation_Response>;
  /** delete single row from the table: "event_type" */
  delete_event_type_by_pk?: Maybe<Event_Type>;
  /** delete data from the table: "events" */
  delete_events?: Maybe<Events_Mutation_Response>;
  /** delete single row from the table: "events" */
  delete_events_by_pk?: Maybe<Events>;
  /** delete data from the table: "events_event_tags" */
  delete_events_event_tags?: Maybe<Events_Event_Tags_Mutation_Response>;
  /** delete single row from the table: "events_event_tags" */
  delete_events_event_tags_by_pk?: Maybe<Events_Event_Tags>;
  /** delete data from the table: "order_items" */
  delete_order_items?: Maybe<Order_Items_Mutation_Response>;
  /** delete single row from the table: "order_items" */
  delete_order_items_by_pk?: Maybe<Order_Items>;
  /** delete data from the table: "order_status" */
  delete_order_status?: Maybe<Order_Status_Mutation_Response>;
  /** delete single row from the table: "order_status" */
  delete_order_status_by_pk?: Maybe<Order_Status>;
  /** delete data from the table: "orders" */
  delete_orders?: Maybe<Orders_Mutation_Response>;
  /** delete single row from the table: "orders" */
  delete_orders_by_pk?: Maybe<Orders>;
  /** delete data from the table: "price_type" */
  delete_price_type?: Maybe<Price_Type_Mutation_Response>;
  /** delete single row from the table: "price_type" */
  delete_price_type_by_pk?: Maybe<Price_Type>;
  /** delete data from the table: "product_status" */
  delete_product_status?: Maybe<Product_Status_Mutation_Response>;
  /** delete single row from the table: "product_status" */
  delete_product_status_by_pk?: Maybe<Product_Status>;
  /** delete data from the table: "product_variants" */
  delete_product_variants?: Maybe<Product_Variants_Mutation_Response>;
  /** delete single row from the table: "product_variants" */
  delete_product_variants_by_pk?: Maybe<Product_Variants>;
  /** delete data from the table: "products" */
  delete_products?: Maybe<Products_Mutation_Response>;
  /** delete single row from the table: "products" */
  delete_products_by_pk?: Maybe<Products>;
  /** delete data from the table: "provider_type" */
  delete_provider_type?: Maybe<Provider_Type_Mutation_Response>;
  /** delete single row from the table: "provider_type" */
  delete_provider_type_by_pk?: Maybe<Provider_Type>;
  /** delete data from the table: "sessions" */
  delete_sessions?: Maybe<Sessions_Mutation_Response>;
  /** delete single row from the table: "sessions" */
  delete_sessions_by_pk?: Maybe<Sessions>;
  /** delete data from the table: "user_role" */
  delete_user_role?: Maybe<User_Role_Mutation_Response>;
  /** delete single row from the table: "user_role" */
  delete_user_role_by_pk?: Maybe<User_Role>;
  /** delete data from the table: "user_status" */
  delete_user_status?: Maybe<User_Status_Mutation_Response>;
  /** delete single row from the table: "user_status" */
  delete_user_status_by_pk?: Maybe<User_Status>;
  /** delete data from the table: "users" */
  delete_users?: Maybe<Users_Mutation_Response>;
  /** delete single row from the table: "users" */
  delete_users_by_pk?: Maybe<Users>;
  /** delete data from the table: "venue_accommodation_details" */
  delete_venue_accommodation_details?: Maybe<Venue_Accommodation_Details_Mutation_Response>;
  /** delete single row from the table: "venue_accommodation_details" */
  delete_venue_accommodation_details_by_pk?: Maybe<Venue_Accommodation_Details>;
  /** delete data from the table: "venue_beauty_salon_details" */
  delete_venue_beauty_salon_details?: Maybe<Venue_Beauty_Salon_Details_Mutation_Response>;
  /** delete single row from the table: "venue_beauty_salon_details" */
  delete_venue_beauty_salon_details_by_pk?: Maybe<Venue_Beauty_Salon_Details>;
  /** delete data from the table: "venue_category" */
  delete_venue_category?: Maybe<Venue_Category_Mutation_Response>;
  /** delete single row from the table: "venue_category" */
  delete_venue_category_by_pk?: Maybe<Venue_Category>;
  /** delete data from the table: "venue_restaurant_details" */
  delete_venue_restaurant_details?: Maybe<Venue_Restaurant_Details_Mutation_Response>;
  /** delete single row from the table: "venue_restaurant_details" */
  delete_venue_restaurant_details_by_pk?: Maybe<Venue_Restaurant_Details>;
  /** delete data from the table: "venue_schedule" */
  delete_venue_schedule?: Maybe<Venue_Schedule_Mutation_Response>;
  /** delete single row from the table: "venue_schedule" */
  delete_venue_schedule_by_pk?: Maybe<Venue_Schedule>;
  /** delete data from the table: "venue_school_details" */
  delete_venue_school_details?: Maybe<Venue_School_Details_Mutation_Response>;
  /** delete single row from the table: "venue_school_details" */
  delete_venue_school_details_by_pk?: Maybe<Venue_School_Details>;
  /** delete data from the table: "venue_shop_details" */
  delete_venue_shop_details?: Maybe<Venue_Shop_Details_Mutation_Response>;
  /** delete single row from the table: "venue_shop_details" */
  delete_venue_shop_details_by_pk?: Maybe<Venue_Shop_Details>;
  /** delete data from the table: "venue_status" */
  delete_venue_status?: Maybe<Venue_Status_Mutation_Response>;
  /** delete single row from the table: "venue_status" */
  delete_venue_status_by_pk?: Maybe<Venue_Status>;
  /** delete data from the table: "venues" */
  delete_venues?: Maybe<Venues_Mutation_Response>;
  /** delete single row from the table: "venues" */
  delete_venues_by_pk?: Maybe<Venues>;
  /** delete data from the table: "verification_tokens" */
  delete_verification_tokens?: Maybe<Verification_Tokens_Mutation_Response>;
  /** delete single row from the table: "verification_tokens" */
  delete_verification_tokens_by_pk?: Maybe<Verification_Tokens>;
  /** insert data into the table: "accounts" */
  insert_accounts?: Maybe<Accounts_Mutation_Response>;
  /** insert a single row into the table: "accounts" */
  insert_accounts_one?: Maybe<Accounts>;
  /** insert data into the table: "chains" */
  insert_chains?: Maybe<Chains_Mutation_Response>;
  /** insert a single row into the table: "chains" */
  insert_chains_one?: Maybe<Chains>;
  /** insert data into the table: "clothing_age_group" */
  insert_clothing_age_group?: Maybe<Clothing_Age_Group_Mutation_Response>;
  /** insert a single row into the table: "clothing_age_group" */
  insert_clothing_age_group_one?: Maybe<Clothing_Age_Group>;
  /** insert data into the table: "clothing_gender" */
  insert_clothing_gender?: Maybe<Clothing_Gender_Mutation_Response>;
  /** insert a single row into the table: "clothing_gender" */
  insert_clothing_gender_one?: Maybe<Clothing_Gender>;
  /** insert data into the table: "clothing_size" */
  insert_clothing_size?: Maybe<Clothing_Size_Mutation_Response>;
  /** insert a single row into the table: "clothing_size" */
  insert_clothing_size_one?: Maybe<Clothing_Size>;
  /** insert data into the table: "clothing_type" */
  insert_clothing_type?: Maybe<Clothing_Type_Mutation_Response>;
  /** insert a single row into the table: "clothing_type" */
  insert_clothing_type_one?: Maybe<Clothing_Type>;
  /** insert data into the table: "event_status" */
  insert_event_status?: Maybe<Event_Status_Mutation_Response>;
  /** insert a single row into the table: "event_status" */
  insert_event_status_one?: Maybe<Event_Status>;
  /** insert data into the table: "event_tags" */
  insert_event_tags?: Maybe<Event_Tags_Mutation_Response>;
  /** insert a single row into the table: "event_tags" */
  insert_event_tags_one?: Maybe<Event_Tags>;
  /** insert data into the table: "event_type" */
  insert_event_type?: Maybe<Event_Type_Mutation_Response>;
  /** insert a single row into the table: "event_type" */
  insert_event_type_one?: Maybe<Event_Type>;
  /** insert data into the table: "events" */
  insert_events?: Maybe<Events_Mutation_Response>;
  /** insert data into the table: "events_event_tags" */
  insert_events_event_tags?: Maybe<Events_Event_Tags_Mutation_Response>;
  /** insert a single row into the table: "events_event_tags" */
  insert_events_event_tags_one?: Maybe<Events_Event_Tags>;
  /** insert a single row into the table: "events" */
  insert_events_one?: Maybe<Events>;
  /** insert data into the table: "order_items" */
  insert_order_items?: Maybe<Order_Items_Mutation_Response>;
  /** insert a single row into the table: "order_items" */
  insert_order_items_one?: Maybe<Order_Items>;
  /** insert data into the table: "order_status" */
  insert_order_status?: Maybe<Order_Status_Mutation_Response>;
  /** insert a single row into the table: "order_status" */
  insert_order_status_one?: Maybe<Order_Status>;
  /** insert data into the table: "orders" */
  insert_orders?: Maybe<Orders_Mutation_Response>;
  /** insert a single row into the table: "orders" */
  insert_orders_one?: Maybe<Orders>;
  /** insert data into the table: "price_type" */
  insert_price_type?: Maybe<Price_Type_Mutation_Response>;
  /** insert a single row into the table: "price_type" */
  insert_price_type_one?: Maybe<Price_Type>;
  /** insert data into the table: "product_status" */
  insert_product_status?: Maybe<Product_Status_Mutation_Response>;
  /** insert a single row into the table: "product_status" */
  insert_product_status_one?: Maybe<Product_Status>;
  /** insert data into the table: "product_variants" */
  insert_product_variants?: Maybe<Product_Variants_Mutation_Response>;
  /** insert a single row into the table: "product_variants" */
  insert_product_variants_one?: Maybe<Product_Variants>;
  /** insert data into the table: "products" */
  insert_products?: Maybe<Products_Mutation_Response>;
  /** insert a single row into the table: "products" */
  insert_products_one?: Maybe<Products>;
  /** insert data into the table: "provider_type" */
  insert_provider_type?: Maybe<Provider_Type_Mutation_Response>;
  /** insert a single row into the table: "provider_type" */
  insert_provider_type_one?: Maybe<Provider_Type>;
  /** insert data into the table: "sessions" */
  insert_sessions?: Maybe<Sessions_Mutation_Response>;
  /** insert a single row into the table: "sessions" */
  insert_sessions_one?: Maybe<Sessions>;
  /** insert data into the table: "user_role" */
  insert_user_role?: Maybe<User_Role_Mutation_Response>;
  /** insert a single row into the table: "user_role" */
  insert_user_role_one?: Maybe<User_Role>;
  /** insert data into the table: "user_status" */
  insert_user_status?: Maybe<User_Status_Mutation_Response>;
  /** insert a single row into the table: "user_status" */
  insert_user_status_one?: Maybe<User_Status>;
  /** insert data into the table: "users" */
  insert_users?: Maybe<Users_Mutation_Response>;
  /** insert a single row into the table: "users" */
  insert_users_one?: Maybe<Users>;
  /** insert data into the table: "venue_accommodation_details" */
  insert_venue_accommodation_details?: Maybe<Venue_Accommodation_Details_Mutation_Response>;
  /** insert a single row into the table: "venue_accommodation_details" */
  insert_venue_accommodation_details_one?: Maybe<Venue_Accommodation_Details>;
  /** insert data into the table: "venue_beauty_salon_details" */
  insert_venue_beauty_salon_details?: Maybe<Venue_Beauty_Salon_Details_Mutation_Response>;
  /** insert a single row into the table: "venue_beauty_salon_details" */
  insert_venue_beauty_salon_details_one?: Maybe<Venue_Beauty_Salon_Details>;
  /** insert data into the table: "venue_category" */
  insert_venue_category?: Maybe<Venue_Category_Mutation_Response>;
  /** insert a single row into the table: "venue_category" */
  insert_venue_category_one?: Maybe<Venue_Category>;
  /** insert data into the table: "venue_restaurant_details" */
  insert_venue_restaurant_details?: Maybe<Venue_Restaurant_Details_Mutation_Response>;
  /** insert a single row into the table: "venue_restaurant_details" */
  insert_venue_restaurant_details_one?: Maybe<Venue_Restaurant_Details>;
  /** insert data into the table: "venue_schedule" */
  insert_venue_schedule?: Maybe<Venue_Schedule_Mutation_Response>;
  /** insert a single row into the table: "venue_schedule" */
  insert_venue_schedule_one?: Maybe<Venue_Schedule>;
  /** insert data into the table: "venue_school_details" */
  insert_venue_school_details?: Maybe<Venue_School_Details_Mutation_Response>;
  /** insert a single row into the table: "venue_school_details" */
  insert_venue_school_details_one?: Maybe<Venue_School_Details>;
  /** insert data into the table: "venue_shop_details" */
  insert_venue_shop_details?: Maybe<Venue_Shop_Details_Mutation_Response>;
  /** insert a single row into the table: "venue_shop_details" */
  insert_venue_shop_details_one?: Maybe<Venue_Shop_Details>;
  /** insert data into the table: "venue_status" */
  insert_venue_status?: Maybe<Venue_Status_Mutation_Response>;
  /** insert a single row into the table: "venue_status" */
  insert_venue_status_one?: Maybe<Venue_Status>;
  /** insert data into the table: "venues" */
  insert_venues?: Maybe<Venues_Mutation_Response>;
  /** insert a single row into the table: "venues" */
  insert_venues_one?: Maybe<Venues>;
  /** insert data into the table: "verification_tokens" */
  insert_verification_tokens?: Maybe<Verification_Tokens_Mutation_Response>;
  /** insert a single row into the table: "verification_tokens" */
  insert_verification_tokens_one?: Maybe<Verification_Tokens>;
  /** update data of the table: "accounts" */
  update_accounts?: Maybe<Accounts_Mutation_Response>;
  /** update single row of the table: "accounts" */
  update_accounts_by_pk?: Maybe<Accounts>;
  /** update multiples rows of table: "accounts" */
  update_accounts_many?: Maybe<Array<Maybe<Accounts_Mutation_Response>>>;
  /** update data of the table: "chains" */
  update_chains?: Maybe<Chains_Mutation_Response>;
  /** update single row of the table: "chains" */
  update_chains_by_pk?: Maybe<Chains>;
  /** update multiples rows of table: "chains" */
  update_chains_many?: Maybe<Array<Maybe<Chains_Mutation_Response>>>;
  /** update data of the table: "clothing_age_group" */
  update_clothing_age_group?: Maybe<Clothing_Age_Group_Mutation_Response>;
  /** update single row of the table: "clothing_age_group" */
  update_clothing_age_group_by_pk?: Maybe<Clothing_Age_Group>;
  /** update multiples rows of table: "clothing_age_group" */
  update_clothing_age_group_many?: Maybe<Array<Maybe<Clothing_Age_Group_Mutation_Response>>>;
  /** update data of the table: "clothing_gender" */
  update_clothing_gender?: Maybe<Clothing_Gender_Mutation_Response>;
  /** update single row of the table: "clothing_gender" */
  update_clothing_gender_by_pk?: Maybe<Clothing_Gender>;
  /** update multiples rows of table: "clothing_gender" */
  update_clothing_gender_many?: Maybe<Array<Maybe<Clothing_Gender_Mutation_Response>>>;
  /** update data of the table: "clothing_size" */
  update_clothing_size?: Maybe<Clothing_Size_Mutation_Response>;
  /** update single row of the table: "clothing_size" */
  update_clothing_size_by_pk?: Maybe<Clothing_Size>;
  /** update multiples rows of table: "clothing_size" */
  update_clothing_size_many?: Maybe<Array<Maybe<Clothing_Size_Mutation_Response>>>;
  /** update data of the table: "clothing_type" */
  update_clothing_type?: Maybe<Clothing_Type_Mutation_Response>;
  /** update single row of the table: "clothing_type" */
  update_clothing_type_by_pk?: Maybe<Clothing_Type>;
  /** update multiples rows of table: "clothing_type" */
  update_clothing_type_many?: Maybe<Array<Maybe<Clothing_Type_Mutation_Response>>>;
  /** update data of the table: "event_status" */
  update_event_status?: Maybe<Event_Status_Mutation_Response>;
  /** update single row of the table: "event_status" */
  update_event_status_by_pk?: Maybe<Event_Status>;
  /** update multiples rows of table: "event_status" */
  update_event_status_many?: Maybe<Array<Maybe<Event_Status_Mutation_Response>>>;
  /** update data of the table: "event_tags" */
  update_event_tags?: Maybe<Event_Tags_Mutation_Response>;
  /** update single row of the table: "event_tags" */
  update_event_tags_by_pk?: Maybe<Event_Tags>;
  /** update multiples rows of table: "event_tags" */
  update_event_tags_many?: Maybe<Array<Maybe<Event_Tags_Mutation_Response>>>;
  /** update data of the table: "event_type" */
  update_event_type?: Maybe<Event_Type_Mutation_Response>;
  /** update single row of the table: "event_type" */
  update_event_type_by_pk?: Maybe<Event_Type>;
  /** update multiples rows of table: "event_type" */
  update_event_type_many?: Maybe<Array<Maybe<Event_Type_Mutation_Response>>>;
  /** update data of the table: "events" */
  update_events?: Maybe<Events_Mutation_Response>;
  /** update single row of the table: "events" */
  update_events_by_pk?: Maybe<Events>;
  /** update data of the table: "events_event_tags" */
  update_events_event_tags?: Maybe<Events_Event_Tags_Mutation_Response>;
  /** update single row of the table: "events_event_tags" */
  update_events_event_tags_by_pk?: Maybe<Events_Event_Tags>;
  /** update multiples rows of table: "events_event_tags" */
  update_events_event_tags_many?: Maybe<Array<Maybe<Events_Event_Tags_Mutation_Response>>>;
  /** update multiples rows of table: "events" */
  update_events_many?: Maybe<Array<Maybe<Events_Mutation_Response>>>;
  /** update data of the table: "order_items" */
  update_order_items?: Maybe<Order_Items_Mutation_Response>;
  /** update single row of the table: "order_items" */
  update_order_items_by_pk?: Maybe<Order_Items>;
  /** update multiples rows of table: "order_items" */
  update_order_items_many?: Maybe<Array<Maybe<Order_Items_Mutation_Response>>>;
  /** update data of the table: "order_status" */
  update_order_status?: Maybe<Order_Status_Mutation_Response>;
  /** update single row of the table: "order_status" */
  update_order_status_by_pk?: Maybe<Order_Status>;
  /** update multiples rows of table: "order_status" */
  update_order_status_many?: Maybe<Array<Maybe<Order_Status_Mutation_Response>>>;
  /** update data of the table: "orders" */
  update_orders?: Maybe<Orders_Mutation_Response>;
  /** update single row of the table: "orders" */
  update_orders_by_pk?: Maybe<Orders>;
  /** update multiples rows of table: "orders" */
  update_orders_many?: Maybe<Array<Maybe<Orders_Mutation_Response>>>;
  /** update data of the table: "price_type" */
  update_price_type?: Maybe<Price_Type_Mutation_Response>;
  /** update single row of the table: "price_type" */
  update_price_type_by_pk?: Maybe<Price_Type>;
  /** update multiples rows of table: "price_type" */
  update_price_type_many?: Maybe<Array<Maybe<Price_Type_Mutation_Response>>>;
  /** update data of the table: "product_status" */
  update_product_status?: Maybe<Product_Status_Mutation_Response>;
  /** update single row of the table: "product_status" */
  update_product_status_by_pk?: Maybe<Product_Status>;
  /** update multiples rows of table: "product_status" */
  update_product_status_many?: Maybe<Array<Maybe<Product_Status_Mutation_Response>>>;
  /** update data of the table: "product_variants" */
  update_product_variants?: Maybe<Product_Variants_Mutation_Response>;
  /** update single row of the table: "product_variants" */
  update_product_variants_by_pk?: Maybe<Product_Variants>;
  /** update multiples rows of table: "product_variants" */
  update_product_variants_many?: Maybe<Array<Maybe<Product_Variants_Mutation_Response>>>;
  /** update data of the table: "products" */
  update_products?: Maybe<Products_Mutation_Response>;
  /** update single row of the table: "products" */
  update_products_by_pk?: Maybe<Products>;
  /** update multiples rows of table: "products" */
  update_products_many?: Maybe<Array<Maybe<Products_Mutation_Response>>>;
  /** update data of the table: "provider_type" */
  update_provider_type?: Maybe<Provider_Type_Mutation_Response>;
  /** update single row of the table: "provider_type" */
  update_provider_type_by_pk?: Maybe<Provider_Type>;
  /** update multiples rows of table: "provider_type" */
  update_provider_type_many?: Maybe<Array<Maybe<Provider_Type_Mutation_Response>>>;
  /** update data of the table: "sessions" */
  update_sessions?: Maybe<Sessions_Mutation_Response>;
  /** update single row of the table: "sessions" */
  update_sessions_by_pk?: Maybe<Sessions>;
  /** update multiples rows of table: "sessions" */
  update_sessions_many?: Maybe<Array<Maybe<Sessions_Mutation_Response>>>;
  /** update data of the table: "user_role" */
  update_user_role?: Maybe<User_Role_Mutation_Response>;
  /** update single row of the table: "user_role" */
  update_user_role_by_pk?: Maybe<User_Role>;
  /** update multiples rows of table: "user_role" */
  update_user_role_many?: Maybe<Array<Maybe<User_Role_Mutation_Response>>>;
  /** update data of the table: "user_status" */
  update_user_status?: Maybe<User_Status_Mutation_Response>;
  /** update single row of the table: "user_status" */
  update_user_status_by_pk?: Maybe<User_Status>;
  /** update multiples rows of table: "user_status" */
  update_user_status_many?: Maybe<Array<Maybe<User_Status_Mutation_Response>>>;
  /** update data of the table: "users" */
  update_users?: Maybe<Users_Mutation_Response>;
  /** update single row of the table: "users" */
  update_users_by_pk?: Maybe<Users>;
  /** update multiples rows of table: "users" */
  update_users_many?: Maybe<Array<Maybe<Users_Mutation_Response>>>;
  /** update data of the table: "venue_accommodation_details" */
  update_venue_accommodation_details?: Maybe<Venue_Accommodation_Details_Mutation_Response>;
  /** update single row of the table: "venue_accommodation_details" */
  update_venue_accommodation_details_by_pk?: Maybe<Venue_Accommodation_Details>;
  /** update multiples rows of table: "venue_accommodation_details" */
  update_venue_accommodation_details_many?: Maybe<Array<Maybe<Venue_Accommodation_Details_Mutation_Response>>>;
  /** update data of the table: "venue_beauty_salon_details" */
  update_venue_beauty_salon_details?: Maybe<Venue_Beauty_Salon_Details_Mutation_Response>;
  /** update single row of the table: "venue_beauty_salon_details" */
  update_venue_beauty_salon_details_by_pk?: Maybe<Venue_Beauty_Salon_Details>;
  /** update multiples rows of table: "venue_beauty_salon_details" */
  update_venue_beauty_salon_details_many?: Maybe<Array<Maybe<Venue_Beauty_Salon_Details_Mutation_Response>>>;
  /** update data of the table: "venue_category" */
  update_venue_category?: Maybe<Venue_Category_Mutation_Response>;
  /** update single row of the table: "venue_category" */
  update_venue_category_by_pk?: Maybe<Venue_Category>;
  /** update multiples rows of table: "venue_category" */
  update_venue_category_many?: Maybe<Array<Maybe<Venue_Category_Mutation_Response>>>;
  /** update data of the table: "venue_restaurant_details" */
  update_venue_restaurant_details?: Maybe<Venue_Restaurant_Details_Mutation_Response>;
  /** update single row of the table: "venue_restaurant_details" */
  update_venue_restaurant_details_by_pk?: Maybe<Venue_Restaurant_Details>;
  /** update multiples rows of table: "venue_restaurant_details" */
  update_venue_restaurant_details_many?: Maybe<Array<Maybe<Venue_Restaurant_Details_Mutation_Response>>>;
  /** update data of the table: "venue_schedule" */
  update_venue_schedule?: Maybe<Venue_Schedule_Mutation_Response>;
  /** update single row of the table: "venue_schedule" */
  update_venue_schedule_by_pk?: Maybe<Venue_Schedule>;
  /** update multiples rows of table: "venue_schedule" */
  update_venue_schedule_many?: Maybe<Array<Maybe<Venue_Schedule_Mutation_Response>>>;
  /** update data of the table: "venue_school_details" */
  update_venue_school_details?: Maybe<Venue_School_Details_Mutation_Response>;
  /** update single row of the table: "venue_school_details" */
  update_venue_school_details_by_pk?: Maybe<Venue_School_Details>;
  /** update multiples rows of table: "venue_school_details" */
  update_venue_school_details_many?: Maybe<Array<Maybe<Venue_School_Details_Mutation_Response>>>;
  /** update data of the table: "venue_shop_details" */
  update_venue_shop_details?: Maybe<Venue_Shop_Details_Mutation_Response>;
  /** update single row of the table: "venue_shop_details" */
  update_venue_shop_details_by_pk?: Maybe<Venue_Shop_Details>;
  /** update multiples rows of table: "venue_shop_details" */
  update_venue_shop_details_many?: Maybe<Array<Maybe<Venue_Shop_Details_Mutation_Response>>>;
  /** update data of the table: "venue_status" */
  update_venue_status?: Maybe<Venue_Status_Mutation_Response>;
  /** update single row of the table: "venue_status" */
  update_venue_status_by_pk?: Maybe<Venue_Status>;
  /** update multiples rows of table: "venue_status" */
  update_venue_status_many?: Maybe<Array<Maybe<Venue_Status_Mutation_Response>>>;
  /** update data of the table: "venues" */
  update_venues?: Maybe<Venues_Mutation_Response>;
  /** update single row of the table: "venues" */
  update_venues_by_pk?: Maybe<Venues>;
  /** update multiples rows of table: "venues" */
  update_venues_many?: Maybe<Array<Maybe<Venues_Mutation_Response>>>;
  /** update data of the table: "verification_tokens" */
  update_verification_tokens?: Maybe<Verification_Tokens_Mutation_Response>;
  /** update single row of the table: "verification_tokens" */
  update_verification_tokens_by_pk?: Maybe<Verification_Tokens>;
  /** update multiples rows of table: "verification_tokens" */
  update_verification_tokens_many?: Maybe<Array<Maybe<Verification_Tokens_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootDelete_AccountsArgs = {
  where: Accounts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Accounts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ChainsArgs = {
  where: Chains_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Chains_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Clothing_Age_GroupArgs = {
  where: Clothing_Age_Group_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Clothing_Age_Group_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Clothing_GenderArgs = {
  where: Clothing_Gender_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Clothing_Gender_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Clothing_SizeArgs = {
  where: Clothing_Size_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Clothing_Size_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Clothing_TypeArgs = {
  where: Clothing_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Clothing_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_StatusArgs = {
  where: Event_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_TagsArgs = {
  where: Event_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Tags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Event_TypeArgs = {
  where: Event_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Event_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_EventsArgs = {
  where: Events_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Events_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Events_Event_TagsArgs = {
  where: Events_Event_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Events_Event_Tags_By_PkArgs = {
  event_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Order_ItemsArgs = {
  where: Order_Items_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Order_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Order_StatusArgs = {
  where: Order_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Order_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_OrdersArgs = {
  where: Orders_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Orders_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Price_TypeArgs = {
  where: Price_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Price_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Product_StatusArgs = {
  where: Product_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Product_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Product_VariantsArgs = {
  where: Product_Variants_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Product_Variants_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_ProductsArgs = {
  where: Products_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Products_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Provider_TypeArgs = {
  where: Provider_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Provider_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_SessionsArgs = {
  where: Sessions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Sessions_By_PkArgs = {
  sessionToken: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_RoleArgs = {
  where: User_Role_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Role_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_User_StatusArgs = {
  where: User_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_User_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_Accommodation_DetailsArgs = {
  where: Venue_Accommodation_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Accommodation_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_Beauty_Salon_DetailsArgs = {
  where: Venue_Beauty_Salon_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Beauty_Salon_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_CategoryArgs = {
  where: Venue_Category_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Category_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_Restaurant_DetailsArgs = {
  where: Venue_Restaurant_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Restaurant_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_ScheduleArgs = {
  where: Venue_Schedule_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Schedule_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_School_DetailsArgs = {
  where: Venue_School_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_School_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_Shop_DetailsArgs = {
  where: Venue_Shop_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Shop_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Venue_StatusArgs = {
  where: Venue_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venue_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_VenuesArgs = {
  where: Venues_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Venues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootDelete_Verification_TokensArgs = {
  where: Verification_Tokens_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Verification_Tokens_By_PkArgs = {
  token: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootInsert_AccountsArgs = {
  objects: Array<Accounts_Insert_Input>;
  on_conflict?: InputMaybe<Accounts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Accounts_OneArgs = {
  object: Accounts_Insert_Input;
  on_conflict?: InputMaybe<Accounts_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ChainsArgs = {
  objects: Array<Chains_Insert_Input>;
  on_conflict?: InputMaybe<Chains_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Chains_OneArgs = {
  object: Chains_Insert_Input;
  on_conflict?: InputMaybe<Chains_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_Age_GroupArgs = {
  objects: Array<Clothing_Age_Group_Insert_Input>;
  on_conflict?: InputMaybe<Clothing_Age_Group_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_Age_Group_OneArgs = {
  object: Clothing_Age_Group_Insert_Input;
  on_conflict?: InputMaybe<Clothing_Age_Group_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_GenderArgs = {
  objects: Array<Clothing_Gender_Insert_Input>;
  on_conflict?: InputMaybe<Clothing_Gender_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_Gender_OneArgs = {
  object: Clothing_Gender_Insert_Input;
  on_conflict?: InputMaybe<Clothing_Gender_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_SizeArgs = {
  objects: Array<Clothing_Size_Insert_Input>;
  on_conflict?: InputMaybe<Clothing_Size_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_Size_OneArgs = {
  object: Clothing_Size_Insert_Input;
  on_conflict?: InputMaybe<Clothing_Size_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_TypeArgs = {
  objects: Array<Clothing_Type_Insert_Input>;
  on_conflict?: InputMaybe<Clothing_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Clothing_Type_OneArgs = {
  object: Clothing_Type_Insert_Input;
  on_conflict?: InputMaybe<Clothing_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_StatusArgs = {
  objects: Array<Event_Status_Insert_Input>;
  on_conflict?: InputMaybe<Event_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Status_OneArgs = {
  object: Event_Status_Insert_Input;
  on_conflict?: InputMaybe<Event_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_TagsArgs = {
  objects: Array<Event_Tags_Insert_Input>;
  on_conflict?: InputMaybe<Event_Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Tags_OneArgs = {
  object: Event_Tags_Insert_Input;
  on_conflict?: InputMaybe<Event_Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_TypeArgs = {
  objects: Array<Event_Type_Insert_Input>;
  on_conflict?: InputMaybe<Event_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Event_Type_OneArgs = {
  object: Event_Type_Insert_Input;
  on_conflict?: InputMaybe<Event_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_EventsArgs = {
  objects: Array<Events_Insert_Input>;
  on_conflict?: InputMaybe<Events_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Events_Event_TagsArgs = {
  objects: Array<Events_Event_Tags_Insert_Input>;
  on_conflict?: InputMaybe<Events_Event_Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Events_Event_Tags_OneArgs = {
  object: Events_Event_Tags_Insert_Input;
  on_conflict?: InputMaybe<Events_Event_Tags_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Events_OneArgs = {
  object: Events_Insert_Input;
  on_conflict?: InputMaybe<Events_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Order_ItemsArgs = {
  objects: Array<Order_Items_Insert_Input>;
  on_conflict?: InputMaybe<Order_Items_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Order_Items_OneArgs = {
  object: Order_Items_Insert_Input;
  on_conflict?: InputMaybe<Order_Items_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Order_StatusArgs = {
  objects: Array<Order_Status_Insert_Input>;
  on_conflict?: InputMaybe<Order_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Order_Status_OneArgs = {
  object: Order_Status_Insert_Input;
  on_conflict?: InputMaybe<Order_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_OrdersArgs = {
  objects: Array<Orders_Insert_Input>;
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Orders_OneArgs = {
  object: Orders_Insert_Input;
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Price_TypeArgs = {
  objects: Array<Price_Type_Insert_Input>;
  on_conflict?: InputMaybe<Price_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Price_Type_OneArgs = {
  object: Price_Type_Insert_Input;
  on_conflict?: InputMaybe<Price_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Product_StatusArgs = {
  objects: Array<Product_Status_Insert_Input>;
  on_conflict?: InputMaybe<Product_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Product_Status_OneArgs = {
  object: Product_Status_Insert_Input;
  on_conflict?: InputMaybe<Product_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Product_VariantsArgs = {
  objects: Array<Product_Variants_Insert_Input>;
  on_conflict?: InputMaybe<Product_Variants_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Product_Variants_OneArgs = {
  object: Product_Variants_Insert_Input;
  on_conflict?: InputMaybe<Product_Variants_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_ProductsArgs = {
  objects: Array<Products_Insert_Input>;
  on_conflict?: InputMaybe<Products_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Products_OneArgs = {
  object: Products_Insert_Input;
  on_conflict?: InputMaybe<Products_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Provider_TypeArgs = {
  objects: Array<Provider_Type_Insert_Input>;
  on_conflict?: InputMaybe<Provider_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Provider_Type_OneArgs = {
  object: Provider_Type_Insert_Input;
  on_conflict?: InputMaybe<Provider_Type_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_SessionsArgs = {
  objects: Array<Sessions_Insert_Input>;
  on_conflict?: InputMaybe<Sessions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Sessions_OneArgs = {
  object: Sessions_Insert_Input;
  on_conflict?: InputMaybe<Sessions_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_RoleArgs = {
  objects: Array<User_Role_Insert_Input>;
  on_conflict?: InputMaybe<User_Role_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Role_OneArgs = {
  object: User_Role_Insert_Input;
  on_conflict?: InputMaybe<User_Role_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_StatusArgs = {
  objects: Array<User_Status_Insert_Input>;
  on_conflict?: InputMaybe<User_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_User_Status_OneArgs = {
  object: User_Status_Insert_Input;
  on_conflict?: InputMaybe<User_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Accommodation_DetailsArgs = {
  objects: Array<Venue_Accommodation_Details_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Accommodation_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Accommodation_Details_OneArgs = {
  object: Venue_Accommodation_Details_Insert_Input;
  on_conflict?: InputMaybe<Venue_Accommodation_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Beauty_Salon_DetailsArgs = {
  objects: Array<Venue_Beauty_Salon_Details_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Beauty_Salon_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Beauty_Salon_Details_OneArgs = {
  object: Venue_Beauty_Salon_Details_Insert_Input;
  on_conflict?: InputMaybe<Venue_Beauty_Salon_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_CategoryArgs = {
  objects: Array<Venue_Category_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Category_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Category_OneArgs = {
  object: Venue_Category_Insert_Input;
  on_conflict?: InputMaybe<Venue_Category_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Restaurant_DetailsArgs = {
  objects: Array<Venue_Restaurant_Details_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Restaurant_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Restaurant_Details_OneArgs = {
  object: Venue_Restaurant_Details_Insert_Input;
  on_conflict?: InputMaybe<Venue_Restaurant_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_ScheduleArgs = {
  objects: Array<Venue_Schedule_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Schedule_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Schedule_OneArgs = {
  object: Venue_Schedule_Insert_Input;
  on_conflict?: InputMaybe<Venue_Schedule_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_School_DetailsArgs = {
  objects: Array<Venue_School_Details_Insert_Input>;
  on_conflict?: InputMaybe<Venue_School_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_School_Details_OneArgs = {
  object: Venue_School_Details_Insert_Input;
  on_conflict?: InputMaybe<Venue_School_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Shop_DetailsArgs = {
  objects: Array<Venue_Shop_Details_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Shop_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Shop_Details_OneArgs = {
  object: Venue_Shop_Details_Insert_Input;
  on_conflict?: InputMaybe<Venue_Shop_Details_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_StatusArgs = {
  objects: Array<Venue_Status_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venue_Status_OneArgs = {
  object: Venue_Status_Insert_Input;
  on_conflict?: InputMaybe<Venue_Status_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_VenuesArgs = {
  objects: Array<Venues_Insert_Input>;
  on_conflict?: InputMaybe<Venues_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Venues_OneArgs = {
  object: Venues_Insert_Input;
  on_conflict?: InputMaybe<Venues_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Verification_TokensArgs = {
  objects: Array<Verification_Tokens_Insert_Input>;
  on_conflict?: InputMaybe<Verification_Tokens_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Verification_Tokens_OneArgs = {
  object: Verification_Tokens_Insert_Input;
  on_conflict?: InputMaybe<Verification_Tokens_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_AccountsArgs = {
  _inc?: InputMaybe<Accounts_Inc_Input>;
  _set?: InputMaybe<Accounts_Set_Input>;
  where: Accounts_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Accounts_By_PkArgs = {
  _inc?: InputMaybe<Accounts_Inc_Input>;
  _set?: InputMaybe<Accounts_Set_Input>;
  pk_columns: Accounts_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Accounts_ManyArgs = {
  updates: Array<Accounts_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ChainsArgs = {
  _set?: InputMaybe<Chains_Set_Input>;
  where: Chains_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Chains_By_PkArgs = {
  _set?: InputMaybe<Chains_Set_Input>;
  pk_columns: Chains_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Chains_ManyArgs = {
  updates: Array<Chains_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Age_GroupArgs = {
  _inc?: InputMaybe<Clothing_Age_Group_Inc_Input>;
  _set?: InputMaybe<Clothing_Age_Group_Set_Input>;
  where: Clothing_Age_Group_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Age_Group_By_PkArgs = {
  _inc?: InputMaybe<Clothing_Age_Group_Inc_Input>;
  _set?: InputMaybe<Clothing_Age_Group_Set_Input>;
  pk_columns: Clothing_Age_Group_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Age_Group_ManyArgs = {
  updates: Array<Clothing_Age_Group_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_GenderArgs = {
  _inc?: InputMaybe<Clothing_Gender_Inc_Input>;
  _set?: InputMaybe<Clothing_Gender_Set_Input>;
  where: Clothing_Gender_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Gender_By_PkArgs = {
  _inc?: InputMaybe<Clothing_Gender_Inc_Input>;
  _set?: InputMaybe<Clothing_Gender_Set_Input>;
  pk_columns: Clothing_Gender_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Gender_ManyArgs = {
  updates: Array<Clothing_Gender_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_SizeArgs = {
  _inc?: InputMaybe<Clothing_Size_Inc_Input>;
  _set?: InputMaybe<Clothing_Size_Set_Input>;
  where: Clothing_Size_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Size_By_PkArgs = {
  _inc?: InputMaybe<Clothing_Size_Inc_Input>;
  _set?: InputMaybe<Clothing_Size_Set_Input>;
  pk_columns: Clothing_Size_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Size_ManyArgs = {
  updates: Array<Clothing_Size_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_TypeArgs = {
  _inc?: InputMaybe<Clothing_Type_Inc_Input>;
  _set?: InputMaybe<Clothing_Type_Set_Input>;
  where: Clothing_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Type_By_PkArgs = {
  _inc?: InputMaybe<Clothing_Type_Inc_Input>;
  _set?: InputMaybe<Clothing_Type_Set_Input>;
  pk_columns: Clothing_Type_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Clothing_Type_ManyArgs = {
  updates: Array<Clothing_Type_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_StatusArgs = {
  _set?: InputMaybe<Event_Status_Set_Input>;
  where: Event_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Status_By_PkArgs = {
  _set?: InputMaybe<Event_Status_Set_Input>;
  pk_columns: Event_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Status_ManyArgs = {
  updates: Array<Event_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_TagsArgs = {
  _set?: InputMaybe<Event_Tags_Set_Input>;
  where: Event_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Tags_By_PkArgs = {
  _set?: InputMaybe<Event_Tags_Set_Input>;
  pk_columns: Event_Tags_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Tags_ManyArgs = {
  updates: Array<Event_Tags_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Event_TypeArgs = {
  _set?: InputMaybe<Event_Type_Set_Input>;
  where: Event_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Type_By_PkArgs = {
  _set?: InputMaybe<Event_Type_Set_Input>;
  pk_columns: Event_Type_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Event_Type_ManyArgs = {
  updates: Array<Event_Type_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_EventsArgs = {
  _append?: InputMaybe<Events_Append_Input>;
  _delete_at_path?: InputMaybe<Events_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Events_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Events_Delete_Key_Input>;
  _inc?: InputMaybe<Events_Inc_Input>;
  _prepend?: InputMaybe<Events_Prepend_Input>;
  _set?: InputMaybe<Events_Set_Input>;
  where: Events_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Events_By_PkArgs = {
  _append?: InputMaybe<Events_Append_Input>;
  _delete_at_path?: InputMaybe<Events_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Events_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Events_Delete_Key_Input>;
  _inc?: InputMaybe<Events_Inc_Input>;
  _prepend?: InputMaybe<Events_Prepend_Input>;
  _set?: InputMaybe<Events_Set_Input>;
  pk_columns: Events_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Events_Event_TagsArgs = {
  _set?: InputMaybe<Events_Event_Tags_Set_Input>;
  where: Events_Event_Tags_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Events_Event_Tags_By_PkArgs = {
  _set?: InputMaybe<Events_Event_Tags_Set_Input>;
  pk_columns: Events_Event_Tags_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Events_Event_Tags_ManyArgs = {
  updates: Array<Events_Event_Tags_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Events_ManyArgs = {
  updates: Array<Events_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Order_ItemsArgs = {
  _append?: InputMaybe<Order_Items_Append_Input>;
  _delete_at_path?: InputMaybe<Order_Items_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Order_Items_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Order_Items_Delete_Key_Input>;
  _inc?: InputMaybe<Order_Items_Inc_Input>;
  _prepend?: InputMaybe<Order_Items_Prepend_Input>;
  _set?: InputMaybe<Order_Items_Set_Input>;
  where: Order_Items_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Order_Items_By_PkArgs = {
  _append?: InputMaybe<Order_Items_Append_Input>;
  _delete_at_path?: InputMaybe<Order_Items_Delete_At_Path_Input>;
  _delete_elem?: InputMaybe<Order_Items_Delete_Elem_Input>;
  _delete_key?: InputMaybe<Order_Items_Delete_Key_Input>;
  _inc?: InputMaybe<Order_Items_Inc_Input>;
  _prepend?: InputMaybe<Order_Items_Prepend_Input>;
  _set?: InputMaybe<Order_Items_Set_Input>;
  pk_columns: Order_Items_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Order_Items_ManyArgs = {
  updates: Array<Order_Items_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Order_StatusArgs = {
  _inc?: InputMaybe<Order_Status_Inc_Input>;
  _set?: InputMaybe<Order_Status_Set_Input>;
  where: Order_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Order_Status_By_PkArgs = {
  _inc?: InputMaybe<Order_Status_Inc_Input>;
  _set?: InputMaybe<Order_Status_Set_Input>;
  pk_columns: Order_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Order_Status_ManyArgs = {
  updates: Array<Order_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_OrdersArgs = {
  _inc?: InputMaybe<Orders_Inc_Input>;
  _set?: InputMaybe<Orders_Set_Input>;
  where: Orders_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Orders_By_PkArgs = {
  _inc?: InputMaybe<Orders_Inc_Input>;
  _set?: InputMaybe<Orders_Set_Input>;
  pk_columns: Orders_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Orders_ManyArgs = {
  updates: Array<Orders_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Price_TypeArgs = {
  _set?: InputMaybe<Price_Type_Set_Input>;
  where: Price_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Price_Type_By_PkArgs = {
  _set?: InputMaybe<Price_Type_Set_Input>;
  pk_columns: Price_Type_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Price_Type_ManyArgs = {
  updates: Array<Price_Type_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Product_StatusArgs = {
  _set?: InputMaybe<Product_Status_Set_Input>;
  where: Product_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Product_Status_By_PkArgs = {
  _set?: InputMaybe<Product_Status_Set_Input>;
  pk_columns: Product_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Product_Status_ManyArgs = {
  updates: Array<Product_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Product_VariantsArgs = {
  _inc?: InputMaybe<Product_Variants_Inc_Input>;
  _set?: InputMaybe<Product_Variants_Set_Input>;
  where: Product_Variants_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Product_Variants_By_PkArgs = {
  _inc?: InputMaybe<Product_Variants_Inc_Input>;
  _set?: InputMaybe<Product_Variants_Set_Input>;
  pk_columns: Product_Variants_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Product_Variants_ManyArgs = {
  updates: Array<Product_Variants_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_ProductsArgs = {
  _inc?: InputMaybe<Products_Inc_Input>;
  _set?: InputMaybe<Products_Set_Input>;
  where: Products_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Products_By_PkArgs = {
  _inc?: InputMaybe<Products_Inc_Input>;
  _set?: InputMaybe<Products_Set_Input>;
  pk_columns: Products_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Products_ManyArgs = {
  updates: Array<Products_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Provider_TypeArgs = {
  _set?: InputMaybe<Provider_Type_Set_Input>;
  where: Provider_Type_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Provider_Type_By_PkArgs = {
  _set?: InputMaybe<Provider_Type_Set_Input>;
  pk_columns: Provider_Type_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Provider_Type_ManyArgs = {
  updates: Array<Provider_Type_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_SessionsArgs = {
  _set?: InputMaybe<Sessions_Set_Input>;
  where: Sessions_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Sessions_By_PkArgs = {
  _set?: InputMaybe<Sessions_Set_Input>;
  pk_columns: Sessions_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Sessions_ManyArgs = {
  updates: Array<Sessions_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_RoleArgs = {
  _set?: InputMaybe<User_Role_Set_Input>;
  where: User_Role_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Role_By_PkArgs = {
  _set?: InputMaybe<User_Role_Set_Input>;
  pk_columns: User_Role_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Role_ManyArgs = {
  updates: Array<User_Role_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_User_StatusArgs = {
  _set?: InputMaybe<User_Status_Set_Input>;
  where: User_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_User_Status_By_PkArgs = {
  _set?: InputMaybe<User_Status_Set_Input>;
  pk_columns: User_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_User_Status_ManyArgs = {
  updates: Array<User_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_UsersArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Users_By_PkArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  pk_columns: Users_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Users_ManyArgs = {
  updates: Array<Users_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Accommodation_DetailsArgs = {
  _inc?: InputMaybe<Venue_Accommodation_Details_Inc_Input>;
  _set?: InputMaybe<Venue_Accommodation_Details_Set_Input>;
  where: Venue_Accommodation_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Accommodation_Details_By_PkArgs = {
  _inc?: InputMaybe<Venue_Accommodation_Details_Inc_Input>;
  _set?: InputMaybe<Venue_Accommodation_Details_Set_Input>;
  pk_columns: Venue_Accommodation_Details_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Accommodation_Details_ManyArgs = {
  updates: Array<Venue_Accommodation_Details_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Beauty_Salon_DetailsArgs = {
  _set?: InputMaybe<Venue_Beauty_Salon_Details_Set_Input>;
  where: Venue_Beauty_Salon_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Beauty_Salon_Details_By_PkArgs = {
  _set?: InputMaybe<Venue_Beauty_Salon_Details_Set_Input>;
  pk_columns: Venue_Beauty_Salon_Details_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Beauty_Salon_Details_ManyArgs = {
  updates: Array<Venue_Beauty_Salon_Details_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_CategoryArgs = {
  _set?: InputMaybe<Venue_Category_Set_Input>;
  where: Venue_Category_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Category_By_PkArgs = {
  _set?: InputMaybe<Venue_Category_Set_Input>;
  pk_columns: Venue_Category_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Category_ManyArgs = {
  updates: Array<Venue_Category_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Restaurant_DetailsArgs = {
  _inc?: InputMaybe<Venue_Restaurant_Details_Inc_Input>;
  _set?: InputMaybe<Venue_Restaurant_Details_Set_Input>;
  where: Venue_Restaurant_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Restaurant_Details_By_PkArgs = {
  _inc?: InputMaybe<Venue_Restaurant_Details_Inc_Input>;
  _set?: InputMaybe<Venue_Restaurant_Details_Set_Input>;
  pk_columns: Venue_Restaurant_Details_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Restaurant_Details_ManyArgs = {
  updates: Array<Venue_Restaurant_Details_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_ScheduleArgs = {
  _set?: InputMaybe<Venue_Schedule_Set_Input>;
  where: Venue_Schedule_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Schedule_By_PkArgs = {
  _set?: InputMaybe<Venue_Schedule_Set_Input>;
  pk_columns: Venue_Schedule_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Schedule_ManyArgs = {
  updates: Array<Venue_Schedule_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_School_DetailsArgs = {
  _inc?: InputMaybe<Venue_School_Details_Inc_Input>;
  _set?: InputMaybe<Venue_School_Details_Set_Input>;
  where: Venue_School_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_School_Details_By_PkArgs = {
  _inc?: InputMaybe<Venue_School_Details_Inc_Input>;
  _set?: InputMaybe<Venue_School_Details_Set_Input>;
  pk_columns: Venue_School_Details_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_School_Details_ManyArgs = {
  updates: Array<Venue_School_Details_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Shop_DetailsArgs = {
  _set?: InputMaybe<Venue_Shop_Details_Set_Input>;
  where: Venue_Shop_Details_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Shop_Details_By_PkArgs = {
  _set?: InputMaybe<Venue_Shop_Details_Set_Input>;
  pk_columns: Venue_Shop_Details_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Shop_Details_ManyArgs = {
  updates: Array<Venue_Shop_Details_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_StatusArgs = {
  _set?: InputMaybe<Venue_Status_Set_Input>;
  where: Venue_Status_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Status_By_PkArgs = {
  _set?: InputMaybe<Venue_Status_Set_Input>;
  pk_columns: Venue_Status_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venue_Status_ManyArgs = {
  updates: Array<Venue_Status_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_VenuesArgs = {
  _set?: InputMaybe<Venues_Set_Input>;
  where: Venues_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Venues_By_PkArgs = {
  _set?: InputMaybe<Venues_Set_Input>;
  pk_columns: Venues_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Venues_ManyArgs = {
  updates: Array<Venues_Updates>;
};


/** mutation root */
export type Mutation_RootUpdate_Verification_TokensArgs = {
  _set?: InputMaybe<Verification_Tokens_Set_Input>;
  where: Verification_Tokens_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Verification_Tokens_By_PkArgs = {
  _set?: InputMaybe<Verification_Tokens_Set_Input>;
  pk_columns: Verification_Tokens_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Verification_Tokens_ManyArgs = {
  updates: Array<Verification_Tokens_Updates>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

/** Individual items within an order */
export type Order_Items = {
  __typename?: 'order_items';
  created_at: Scalars['timestamptz']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  metadata?: Maybe<Scalars['jsonb']['output']>;
  name_snapshot: Scalars['String']['output'];
  /** An object relationship */
  order: Orders;
  order_id: Scalars['uuid']['output'];
  /** An object relationship */
  product?: Maybe<Products>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity: Scalars['Int']['output'];
  unit_price_minor: Scalars['Int']['output'];
  /** An object relationship */
  variant?: Maybe<Product_Variants>;
  variant_id?: Maybe<Scalars['uuid']['output']>;
};


/** Individual items within an order */
export type Order_ItemsMetadataArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};

/** aggregated selection of "order_items" */
export type Order_Items_Aggregate = {
  __typename?: 'order_items_aggregate';
  aggregate?: Maybe<Order_Items_Aggregate_Fields>;
  nodes: Array<Order_Items>;
};

export type Order_Items_Aggregate_Bool_Exp = {
  count?: InputMaybe<Order_Items_Aggregate_Bool_Exp_Count>;
};

export type Order_Items_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Order_Items_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Order_Items_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "order_items" */
export type Order_Items_Aggregate_Fields = {
  __typename?: 'order_items_aggregate_fields';
  avg?: Maybe<Order_Items_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Order_Items_Max_Fields>;
  min?: Maybe<Order_Items_Min_Fields>;
  stddev?: Maybe<Order_Items_Stddev_Fields>;
  stddev_pop?: Maybe<Order_Items_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Order_Items_Stddev_Samp_Fields>;
  sum?: Maybe<Order_Items_Sum_Fields>;
  var_pop?: Maybe<Order_Items_Var_Pop_Fields>;
  var_samp?: Maybe<Order_Items_Var_Samp_Fields>;
  variance?: Maybe<Order_Items_Variance_Fields>;
};


/** aggregate fields of "order_items" */
export type Order_Items_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Order_Items_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "order_items" */
export type Order_Items_Aggregate_Order_By = {
  avg?: InputMaybe<Order_Items_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Order_Items_Max_Order_By>;
  min?: InputMaybe<Order_Items_Min_Order_By>;
  stddev?: InputMaybe<Order_Items_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Order_Items_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Order_Items_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Order_Items_Sum_Order_By>;
  var_pop?: InputMaybe<Order_Items_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Order_Items_Var_Samp_Order_By>;
  variance?: InputMaybe<Order_Items_Variance_Order_By>;
};

/** append existing jsonb value of filtered columns with new jsonb value */
export type Order_Items_Append_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** input type for inserting array relation for remote table "order_items" */
export type Order_Items_Arr_Rel_Insert_Input = {
  data: Array<Order_Items_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Order_Items_On_Conflict>;
};

/** aggregate avg on columns */
export type Order_Items_Avg_Fields = {
  __typename?: 'order_items_avg_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "order_items" */
export type Order_Items_Avg_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "order_items". All fields are combined with a logical 'AND'. */
export type Order_Items_Bool_Exp = {
  _and?: InputMaybe<Array<Order_Items_Bool_Exp>>;
  _not?: InputMaybe<Order_Items_Bool_Exp>;
  _or?: InputMaybe<Array<Order_Items_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  currency?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  metadata?: InputMaybe<Jsonb_Comparison_Exp>;
  name_snapshot?: InputMaybe<String_Comparison_Exp>;
  order?: InputMaybe<Orders_Bool_Exp>;
  order_id?: InputMaybe<Uuid_Comparison_Exp>;
  product?: InputMaybe<Products_Bool_Exp>;
  product_id?: InputMaybe<Uuid_Comparison_Exp>;
  quantity?: InputMaybe<Int_Comparison_Exp>;
  unit_price_minor?: InputMaybe<Int_Comparison_Exp>;
  variant?: InputMaybe<Product_Variants_Bool_Exp>;
  variant_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "order_items" */
export enum Order_Items_Constraint {
  /** unique or primary key constraint on columns "id" */
  OrderItemsPkey = 'order_items_pkey'
}

/** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
export type Order_Items_Delete_At_Path_Input = {
  metadata?: InputMaybe<Array<Scalars['String']['input']>>;
};

/** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
export type Order_Items_Delete_Elem_Input = {
  metadata?: InputMaybe<Scalars['Int']['input']>;
};

/** delete key/value pair or string element. key/value pairs are matched based on their key value */
export type Order_Items_Delete_Key_Input = {
  metadata?: InputMaybe<Scalars['String']['input']>;
};

/** input type for incrementing numeric columns in table "order_items" */
export type Order_Items_Inc_Input = {
  quantity?: InputMaybe<Scalars['Int']['input']>;
  unit_price_minor?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "order_items" */
export type Order_Items_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name_snapshot?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Orders_Obj_Rel_Insert_Input>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  product?: InputMaybe<Products_Obj_Rel_Insert_Input>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  unit_price_minor?: InputMaybe<Scalars['Int']['input']>;
  variant?: InputMaybe<Product_Variants_Obj_Rel_Insert_Input>;
  variant_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Order_Items_Max_Fields = {
  __typename?: 'order_items_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name_snapshot?: Maybe<Scalars['String']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  unit_price_minor?: Maybe<Scalars['Int']['output']>;
  variant_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "order_items" */
export type Order_Items_Max_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name_snapshot?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
  variant_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Order_Items_Min_Fields = {
  __typename?: 'order_items_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  name_snapshot?: Maybe<Scalars['String']['output']>;
  order_id?: Maybe<Scalars['uuid']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  unit_price_minor?: Maybe<Scalars['Int']['output']>;
  variant_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "order_items" */
export type Order_Items_Min_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name_snapshot?: InputMaybe<Order_By>;
  order_id?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
  variant_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "order_items" */
export type Order_Items_Mutation_Response = {
  __typename?: 'order_items_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Order_Items>;
};

/** on_conflict condition type for table "order_items" */
export type Order_Items_On_Conflict = {
  constraint: Order_Items_Constraint;
  update_columns?: Array<Order_Items_Update_Column>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** Ordering options when selecting data from "order_items". */
export type Order_Items_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  metadata?: InputMaybe<Order_By>;
  name_snapshot?: InputMaybe<Order_By>;
  order?: InputMaybe<Orders_Order_By>;
  order_id?: InputMaybe<Order_By>;
  product?: InputMaybe<Products_Order_By>;
  product_id?: InputMaybe<Order_By>;
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
  variant?: InputMaybe<Product_Variants_Order_By>;
  variant_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: order_items */
export type Order_Items_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** prepend existing jsonb value of filtered columns with new jsonb value */
export type Order_Items_Prepend_Input = {
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
};

/** select columns of table "order_items" */
export enum Order_Items_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NameSnapshot = 'name_snapshot',
  /** column name */
  OrderId = 'order_id',
  /** column name */
  ProductId = 'product_id',
  /** column name */
  Quantity = 'quantity',
  /** column name */
  UnitPriceMinor = 'unit_price_minor',
  /** column name */
  VariantId = 'variant_id'
}

/** input type for updating data in table "order_items" */
export type Order_Items_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name_snapshot?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  unit_price_minor?: InputMaybe<Scalars['Int']['input']>;
  variant_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Order_Items_Stddev_Fields = {
  __typename?: 'order_items_stddev_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "order_items" */
export type Order_Items_Stddev_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Order_Items_Stddev_Pop_Fields = {
  __typename?: 'order_items_stddev_pop_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "order_items" */
export type Order_Items_Stddev_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Order_Items_Stddev_Samp_Fields = {
  __typename?: 'order_items_stddev_samp_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "order_items" */
export type Order_Items_Stddev_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "order_items" */
export type Order_Items_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Order_Items_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Order_Items_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  metadata?: InputMaybe<Scalars['jsonb']['input']>;
  name_snapshot?: InputMaybe<Scalars['String']['input']>;
  order_id?: InputMaybe<Scalars['uuid']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  quantity?: InputMaybe<Scalars['Int']['input']>;
  unit_price_minor?: InputMaybe<Scalars['Int']['input']>;
  variant_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Order_Items_Sum_Fields = {
  __typename?: 'order_items_sum_fields';
  quantity?: Maybe<Scalars['Int']['output']>;
  unit_price_minor?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "order_items" */
export type Order_Items_Sum_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** update columns of table "order_items" */
export enum Order_Items_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  Id = 'id',
  /** column name */
  Metadata = 'metadata',
  /** column name */
  NameSnapshot = 'name_snapshot',
  /** column name */
  OrderId = 'order_id',
  /** column name */
  ProductId = 'product_id',
  /** column name */
  Quantity = 'quantity',
  /** column name */
  UnitPriceMinor = 'unit_price_minor',
  /** column name */
  VariantId = 'variant_id'
}

export type Order_Items_Updates = {
  /** append existing jsonb value of filtered columns with new jsonb value */
  _append?: InputMaybe<Order_Items_Append_Input>;
  /** delete the field or element with specified path (for JSON arrays, negative integers count from the end) */
  _delete_at_path?: InputMaybe<Order_Items_Delete_At_Path_Input>;
  /** delete the array element with specified index (negative integers count from the end). throws an error if top level container is not an array */
  _delete_elem?: InputMaybe<Order_Items_Delete_Elem_Input>;
  /** delete key/value pair or string element. key/value pairs are matched based on their key value */
  _delete_key?: InputMaybe<Order_Items_Delete_Key_Input>;
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Order_Items_Inc_Input>;
  /** prepend existing jsonb value of filtered columns with new jsonb value */
  _prepend?: InputMaybe<Order_Items_Prepend_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Order_Items_Set_Input>;
  /** filter the rows which have to be updated */
  where: Order_Items_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Order_Items_Var_Pop_Fields = {
  __typename?: 'order_items_var_pop_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "order_items" */
export type Order_Items_Var_Pop_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Order_Items_Var_Samp_Fields = {
  __typename?: 'order_items_var_samp_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "order_items" */
export type Order_Items_Var_Samp_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Order_Items_Variance_Fields = {
  __typename?: 'order_items_variance_fields';
  quantity?: Maybe<Scalars['Float']['output']>;
  unit_price_minor?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "order_items" */
export type Order_Items_Variance_Order_By = {
  quantity?: InputMaybe<Order_By>;
  unit_price_minor?: InputMaybe<Order_By>;
};

/** columns and relationships of "order_status" */
export type Order_Status = {
  __typename?: 'order_status';
  label_en: Scalars['String']['output'];
  label_uk: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
  value: Scalars['String']['output'];
};

/** aggregated selection of "order_status" */
export type Order_Status_Aggregate = {
  __typename?: 'order_status_aggregate';
  aggregate?: Maybe<Order_Status_Aggregate_Fields>;
  nodes: Array<Order_Status>;
};

/** aggregate fields of "order_status" */
export type Order_Status_Aggregate_Fields = {
  __typename?: 'order_status_aggregate_fields';
  avg?: Maybe<Order_Status_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Order_Status_Max_Fields>;
  min?: Maybe<Order_Status_Min_Fields>;
  stddev?: Maybe<Order_Status_Stddev_Fields>;
  stddev_pop?: Maybe<Order_Status_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Order_Status_Stddev_Samp_Fields>;
  sum?: Maybe<Order_Status_Sum_Fields>;
  var_pop?: Maybe<Order_Status_Var_Pop_Fields>;
  var_samp?: Maybe<Order_Status_Var_Samp_Fields>;
  variance?: Maybe<Order_Status_Variance_Fields>;
};


/** aggregate fields of "order_status" */
export type Order_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Order_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Order_Status_Avg_Fields = {
  __typename?: 'order_status_avg_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "order_status". All fields are combined with a logical 'AND'. */
export type Order_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Order_Status_Bool_Exp>>;
  _not?: InputMaybe<Order_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Order_Status_Bool_Exp>>;
  label_en?: InputMaybe<String_Comparison_Exp>;
  label_uk?: InputMaybe<String_Comparison_Exp>;
  sort_order?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "order_status" */
export enum Order_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  OrderStatusPkey = 'order_status_pkey'
}

/** input type for incrementing numeric columns in table "order_status" */
export type Order_Status_Inc_Input = {
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "order_status" */
export type Order_Status_Insert_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Order_Status_Max_Fields = {
  __typename?: 'order_status_max_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Order_Status_Min_Fields = {
  __typename?: 'order_status_min_fields';
  label_en?: Maybe<Scalars['String']['output']>;
  label_uk?: Maybe<Scalars['String']['output']>;
  sort_order?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "order_status" */
export type Order_Status_Mutation_Response = {
  __typename?: 'order_status_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Order_Status>;
};

/** input type for inserting object relation for remote table "order_status" */
export type Order_Status_Obj_Rel_Insert_Input = {
  data: Order_Status_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Order_Status_On_Conflict>;
};

/** on_conflict condition type for table "order_status" */
export type Order_Status_On_Conflict = {
  constraint: Order_Status_Constraint;
  update_columns?: Array<Order_Status_Update_Column>;
  where?: InputMaybe<Order_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "order_status". */
export type Order_Status_Order_By = {
  label_en?: InputMaybe<Order_By>;
  label_uk?: InputMaybe<Order_By>;
  sort_order?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: order_status */
export type Order_Status_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "order_status" */
export enum Order_Status_Select_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "order_status" */
export type Order_Status_Set_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Order_Status_Stddev_Fields = {
  __typename?: 'order_status_stddev_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Order_Status_Stddev_Pop_Fields = {
  __typename?: 'order_status_stddev_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Order_Status_Stddev_Samp_Fields = {
  __typename?: 'order_status_stddev_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "order_status" */
export type Order_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Order_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Order_Status_Stream_Cursor_Value_Input = {
  label_en?: InputMaybe<Scalars['String']['input']>;
  label_uk?: InputMaybe<Scalars['String']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Order_Status_Sum_Fields = {
  __typename?: 'order_status_sum_fields';
  sort_order?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "order_status" */
export enum Order_Status_Update_Column {
  /** column name */
  LabelEn = 'label_en',
  /** column name */
  LabelUk = 'label_uk',
  /** column name */
  SortOrder = 'sort_order',
  /** column name */
  Value = 'value'
}

export type Order_Status_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Order_Status_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Order_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Order_Status_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Order_Status_Var_Pop_Fields = {
  __typename?: 'order_status_var_pop_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Order_Status_Var_Samp_Fields = {
  __typename?: 'order_status_var_samp_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Order_Status_Variance_Fields = {
  __typename?: 'order_status_variance_fields';
  sort_order?: Maybe<Scalars['Float']['output']>;
};

/** Customer orders with payment status */
export type Orders = {
  __typename?: 'orders';
  created_at: Scalars['timestamptz']['output'];
  currency: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  /** An array relationship */
  order_items: Array<Order_Items>;
  /** An aggregate relationship */
  order_items_aggregate: Order_Items_Aggregate;
  /** An object relationship */
  order_status: Order_Status;
  payment_intent_id?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  subtotal_minor: Scalars['Int']['output'];
  total_minor: Scalars['Int']['output'];
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user?: Maybe<Users>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};


/** Customer orders with payment status */
export type OrdersOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** Customer orders with payment status */
export type OrdersOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** aggregated selection of "orders" */
export type Orders_Aggregate = {
  __typename?: 'orders_aggregate';
  aggregate?: Maybe<Orders_Aggregate_Fields>;
  nodes: Array<Orders>;
};

/** aggregate fields of "orders" */
export type Orders_Aggregate_Fields = {
  __typename?: 'orders_aggregate_fields';
  avg?: Maybe<Orders_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Orders_Max_Fields>;
  min?: Maybe<Orders_Min_Fields>;
  stddev?: Maybe<Orders_Stddev_Fields>;
  stddev_pop?: Maybe<Orders_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Orders_Stddev_Samp_Fields>;
  sum?: Maybe<Orders_Sum_Fields>;
  var_pop?: Maybe<Orders_Var_Pop_Fields>;
  var_samp?: Maybe<Orders_Var_Samp_Fields>;
  variance?: Maybe<Orders_Variance_Fields>;
};


/** aggregate fields of "orders" */
export type Orders_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Orders_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Orders_Avg_Fields = {
  __typename?: 'orders_avg_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "orders". All fields are combined with a logical 'AND'. */
export type Orders_Bool_Exp = {
  _and?: InputMaybe<Array<Orders_Bool_Exp>>;
  _not?: InputMaybe<Orders_Bool_Exp>;
  _or?: InputMaybe<Array<Orders_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  currency?: InputMaybe<String_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  order_items?: InputMaybe<Order_Items_Bool_Exp>;
  order_items_aggregate?: InputMaybe<Order_Items_Aggregate_Bool_Exp>;
  order_status?: InputMaybe<Order_Status_Bool_Exp>;
  payment_intent_id?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  subtotal_minor?: InputMaybe<Int_Comparison_Exp>;
  total_minor?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "orders" */
export enum Orders_Constraint {
  /** unique or primary key constraint on columns "id" */
  OrdersPkey = 'orders_pkey'
}

/** input type for incrementing numeric columns in table "orders" */
export type Orders_Inc_Input = {
  subtotal_minor?: InputMaybe<Scalars['Int']['input']>;
  total_minor?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "orders" */
export type Orders_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  order_status?: InputMaybe<Order_Status_Obj_Rel_Insert_Input>;
  payment_intent_id?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal_minor?: InputMaybe<Scalars['Int']['input']>;
  total_minor?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Orders_Max_Fields = {
  __typename?: 'orders_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  payment_intent_id?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal_minor?: Maybe<Scalars['Int']['output']>;
  total_minor?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** aggregate min on columns */
export type Orders_Min_Fields = {
  __typename?: 'orders_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  payment_intent_id?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal_minor?: Maybe<Scalars['Int']['output']>;
  total_minor?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
};

/** response of any mutation on the table "orders" */
export type Orders_Mutation_Response = {
  __typename?: 'orders_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Orders>;
};

/** input type for inserting object relation for remote table "orders" */
export type Orders_Obj_Rel_Insert_Input = {
  data: Orders_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Orders_On_Conflict>;
};

/** on_conflict condition type for table "orders" */
export type Orders_On_Conflict = {
  constraint: Orders_Constraint;
  update_columns?: Array<Orders_Update_Column>;
  where?: InputMaybe<Orders_Bool_Exp>;
};

/** Ordering options when selecting data from "orders". */
export type Orders_Order_By = {
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_items_aggregate?: InputMaybe<Order_Items_Aggregate_Order_By>;
  order_status?: InputMaybe<Order_Status_Order_By>;
  payment_intent_id?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  subtotal_minor?: InputMaybe<Order_By>;
  total_minor?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: orders */
export type Orders_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "orders" */
export enum Orders_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  PaymentIntentId = 'payment_intent_id',
  /** column name */
  Status = 'status',
  /** column name */
  SubtotalMinor = 'subtotal_minor',
  /** column name */
  TotalMinor = 'total_minor',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

/** input type for updating data in table "orders" */
export type Orders_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  payment_intent_id?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal_minor?: InputMaybe<Scalars['Int']['input']>;
  total_minor?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Orders_Stddev_Fields = {
  __typename?: 'orders_stddev_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Orders_Stddev_Pop_Fields = {
  __typename?: 'orders_stddev_pop_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Orders_Stddev_Samp_Fields = {
  __typename?: 'orders_stddev_samp_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "orders" */
export type Orders_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Orders_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Orders_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  payment_intent_id?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  subtotal_minor?: InputMaybe<Scalars['Int']['input']>;
  total_minor?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Orders_Sum_Fields = {
  __typename?: 'orders_sum_fields';
  subtotal_minor?: Maybe<Scalars['Int']['output']>;
  total_minor?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "orders" */
export enum Orders_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  Email = 'email',
  /** column name */
  Id = 'id',
  /** column name */
  PaymentIntentId = 'payment_intent_id',
  /** column name */
  Status = 'status',
  /** column name */
  SubtotalMinor = 'subtotal_minor',
  /** column name */
  TotalMinor = 'total_minor',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id'
}

export type Orders_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Orders_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Orders_Set_Input>;
  /** filter the rows which have to be updated */
  where: Orders_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Orders_Var_Pop_Fields = {
  __typename?: 'orders_var_pop_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Orders_Var_Samp_Fields = {
  __typename?: 'orders_var_samp_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Orders_Variance_Fields = {
  __typename?: 'orders_variance_fields';
  subtotal_minor?: Maybe<Scalars['Float']['output']>;
  total_minor?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "price_type" */
export type Price_Type = {
  __typename?: 'price_type';
  description?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

/** aggregated selection of "price_type" */
export type Price_Type_Aggregate = {
  __typename?: 'price_type_aggregate';
  aggregate?: Maybe<Price_Type_Aggregate_Fields>;
  nodes: Array<Price_Type>;
};

/** aggregate fields of "price_type" */
export type Price_Type_Aggregate_Fields = {
  __typename?: 'price_type_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Price_Type_Max_Fields>;
  min?: Maybe<Price_Type_Min_Fields>;
};


/** aggregate fields of "price_type" */
export type Price_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Price_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "price_type". All fields are combined with a logical 'AND'. */
export type Price_Type_Bool_Exp = {
  _and?: InputMaybe<Array<Price_Type_Bool_Exp>>;
  _not?: InputMaybe<Price_Type_Bool_Exp>;
  _or?: InputMaybe<Array<Price_Type_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "price_type" */
export enum Price_Type_Constraint {
  /** unique or primary key constraint on columns "value" */
  PriceTypePkey = 'price_type_pkey'
}

export enum Price_Type_Enum {
  /** Donation-based event */
  Donation = 'DONATION',
  /** Free event with no cost */
  Free = 'FREE',
  /** Paid event with fixed ticket price */
  Paid = 'PAID',
  /** Event with suggested donation amount */
  SuggestedDonation = 'SUGGESTED_DONATION'
}

/** Boolean expression to compare columns of type "price_type_enum". All fields are combined with logical 'AND'. */
export type Price_Type_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Price_Type_Enum>;
  _in?: InputMaybe<Array<Price_Type_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Price_Type_Enum>;
  _nin?: InputMaybe<Array<Price_Type_Enum>>;
};

/** input type for inserting data into table "price_type" */
export type Price_Type_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Price_Type_Max_Fields = {
  __typename?: 'price_type_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Price_Type_Min_Fields = {
  __typename?: 'price_type_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "price_type" */
export type Price_Type_Mutation_Response = {
  __typename?: 'price_type_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Price_Type>;
};

/** input type for inserting object relation for remote table "price_type" */
export type Price_Type_Obj_Rel_Insert_Input = {
  data: Price_Type_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Price_Type_On_Conflict>;
};

/** on_conflict condition type for table "price_type" */
export type Price_Type_On_Conflict = {
  constraint: Price_Type_Constraint;
  update_columns?: Array<Price_Type_Update_Column>;
  where?: InputMaybe<Price_Type_Bool_Exp>;
};

/** Ordering options when selecting data from "price_type". */
export type Price_Type_Order_By = {
  description?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: price_type */
export type Price_Type_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "price_type" */
export enum Price_Type_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "price_type" */
export type Price_Type_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "price_type" */
export type Price_Type_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Price_Type_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Price_Type_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "price_type" */
export enum Price_Type_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type Price_Type_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Price_Type_Set_Input>;
  /** filter the rows which have to be updated */
  where: Price_Type_Bool_Exp;
};

/** columns and relationships of "product_status" */
export type Product_Status = {
  __typename?: 'product_status';
  description?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
};

/** aggregated selection of "product_status" */
export type Product_Status_Aggregate = {
  __typename?: 'product_status_aggregate';
  aggregate?: Maybe<Product_Status_Aggregate_Fields>;
  nodes: Array<Product_Status>;
};

/** aggregate fields of "product_status" */
export type Product_Status_Aggregate_Fields = {
  __typename?: 'product_status_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Product_Status_Max_Fields>;
  min?: Maybe<Product_Status_Min_Fields>;
};


/** aggregate fields of "product_status" */
export type Product_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Product_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "product_status". All fields are combined with a logical 'AND'. */
export type Product_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Product_Status_Bool_Exp>>;
  _not?: InputMaybe<Product_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Product_Status_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "product_status" */
export enum Product_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  ProductStatusPkey = 'product_status_pkey'
}

/** input type for inserting data into table "product_status" */
export type Product_Status_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Product_Status_Max_Fields = {
  __typename?: 'product_status_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Product_Status_Min_Fields = {
  __typename?: 'product_status_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "product_status" */
export type Product_Status_Mutation_Response = {
  __typename?: 'product_status_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Product_Status>;
};

/** input type for inserting object relation for remote table "product_status" */
export type Product_Status_Obj_Rel_Insert_Input = {
  data: Product_Status_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Product_Status_On_Conflict>;
};

/** on_conflict condition type for table "product_status" */
export type Product_Status_On_Conflict = {
  constraint: Product_Status_Constraint;
  update_columns?: Array<Product_Status_Update_Column>;
  where?: InputMaybe<Product_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "product_status". */
export type Product_Status_Order_By = {
  description?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: product_status */
export type Product_Status_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "product_status" */
export enum Product_Status_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "product_status" */
export type Product_Status_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "product_status" */
export type Product_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Product_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Product_Status_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "product_status" */
export enum Product_Status_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type Product_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Product_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Product_Status_Bool_Exp;
};

/** Size/gender/age variants with stock levels */
export type Product_Variants = {
  __typename?: 'product_variants';
  age_group: Scalars['String']['output'];
  /** An object relationship */
  clothing_age_group: Clothing_Age_Group;
  /** An object relationship */
  clothing_gender: Clothing_Gender;
  /** An object relationship */
  clothing_size: Clothing_Size;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  /** An array relationship */
  order_items: Array<Order_Items>;
  /** An aggregate relationship */
  order_items_aggregate: Order_Items_Aggregate;
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  product: Products;
  product_id: Scalars['uuid']['output'];
  size: Scalars['String']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  stock: Scalars['Int']['output'];
  updated_at: Scalars['timestamptz']['output'];
};


/** Size/gender/age variants with stock levels */
export type Product_VariantsOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** Size/gender/age variants with stock levels */
export type Product_VariantsOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};

/** aggregated selection of "product_variants" */
export type Product_Variants_Aggregate = {
  __typename?: 'product_variants_aggregate';
  aggregate?: Maybe<Product_Variants_Aggregate_Fields>;
  nodes: Array<Product_Variants>;
};

export type Product_Variants_Aggregate_Bool_Exp = {
  count?: InputMaybe<Product_Variants_Aggregate_Bool_Exp_Count>;
};

export type Product_Variants_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Product_Variants_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Product_Variants_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "product_variants" */
export type Product_Variants_Aggregate_Fields = {
  __typename?: 'product_variants_aggregate_fields';
  avg?: Maybe<Product_Variants_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Product_Variants_Max_Fields>;
  min?: Maybe<Product_Variants_Min_Fields>;
  stddev?: Maybe<Product_Variants_Stddev_Fields>;
  stddev_pop?: Maybe<Product_Variants_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Product_Variants_Stddev_Samp_Fields>;
  sum?: Maybe<Product_Variants_Sum_Fields>;
  var_pop?: Maybe<Product_Variants_Var_Pop_Fields>;
  var_samp?: Maybe<Product_Variants_Var_Samp_Fields>;
  variance?: Maybe<Product_Variants_Variance_Fields>;
};


/** aggregate fields of "product_variants" */
export type Product_Variants_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Product_Variants_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "product_variants" */
export type Product_Variants_Aggregate_Order_By = {
  avg?: InputMaybe<Product_Variants_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Product_Variants_Max_Order_By>;
  min?: InputMaybe<Product_Variants_Min_Order_By>;
  stddev?: InputMaybe<Product_Variants_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Product_Variants_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Product_Variants_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Product_Variants_Sum_Order_By>;
  var_pop?: InputMaybe<Product_Variants_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Product_Variants_Var_Samp_Order_By>;
  variance?: InputMaybe<Product_Variants_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "product_variants" */
export type Product_Variants_Arr_Rel_Insert_Input = {
  data: Array<Product_Variants_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Product_Variants_On_Conflict>;
};

/** aggregate avg on columns */
export type Product_Variants_Avg_Fields = {
  __typename?: 'product_variants_avg_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "product_variants" */
export type Product_Variants_Avg_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "product_variants". All fields are combined with a logical 'AND'. */
export type Product_Variants_Bool_Exp = {
  _and?: InputMaybe<Array<Product_Variants_Bool_Exp>>;
  _not?: InputMaybe<Product_Variants_Bool_Exp>;
  _or?: InputMaybe<Array<Product_Variants_Bool_Exp>>;
  age_group?: InputMaybe<String_Comparison_Exp>;
  clothing_age_group?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
  clothing_gender?: InputMaybe<Clothing_Gender_Bool_Exp>;
  clothing_size?: InputMaybe<Clothing_Size_Bool_Exp>;
  color?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  gender?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  order_items?: InputMaybe<Order_Items_Bool_Exp>;
  order_items_aggregate?: InputMaybe<Order_Items_Aggregate_Bool_Exp>;
  price_override_minor?: InputMaybe<Int_Comparison_Exp>;
  product?: InputMaybe<Products_Bool_Exp>;
  product_id?: InputMaybe<Uuid_Comparison_Exp>;
  size?: InputMaybe<String_Comparison_Exp>;
  sku?: InputMaybe<String_Comparison_Exp>;
  stock?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "product_variants" */
export enum Product_Variants_Constraint {
  /** unique or primary key constraint on columns "id" */
  ProductVariantsPkey = 'product_variants_pkey',
  /** unique or primary key constraint on columns "size", "product_id", "color", "age_group", "gender" */
  ProductVariantsProductIdGenderAgeGroupSizeColorKey = 'product_variants_product_id_gender_age_group_size_color_key'
}

/** input type for incrementing numeric columns in table "product_variants" */
export type Product_Variants_Inc_Input = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Scalars['Int']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "product_variants" */
export type Product_Variants_Insert_Input = {
  age_group?: InputMaybe<Scalars['String']['input']>;
  clothing_age_group?: InputMaybe<Clothing_Age_Group_Obj_Rel_Insert_Input>;
  clothing_gender?: InputMaybe<Clothing_Gender_Obj_Rel_Insert_Input>;
  clothing_size?: InputMaybe<Clothing_Size_Obj_Rel_Insert_Input>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  order_items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Scalars['Int']['input']>;
  product?: InputMaybe<Products_Obj_Rel_Insert_Input>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  size?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Product_Variants_Max_Fields = {
  __typename?: 'product_variants_max_fields';
  age_group?: Maybe<Scalars['String']['output']>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Int']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  size?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  stock?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "product_variants" */
export type Product_Variants_Max_Order_By = {
  age_group?: InputMaybe<Order_By>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  size?: InputMaybe<Order_By>;
  sku?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Product_Variants_Min_Fields = {
  __typename?: 'product_variants_min_fields';
  age_group?: Maybe<Scalars['String']['output']>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Int']['output']>;
  product_id?: Maybe<Scalars['uuid']['output']>;
  size?: Maybe<Scalars['String']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  stock?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "product_variants" */
export type Product_Variants_Min_Order_By = {
  age_group?: InputMaybe<Order_By>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  product_id?: InputMaybe<Order_By>;
  size?: InputMaybe<Order_By>;
  sku?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "product_variants" */
export type Product_Variants_Mutation_Response = {
  __typename?: 'product_variants_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Product_Variants>;
};

/** input type for inserting object relation for remote table "product_variants" */
export type Product_Variants_Obj_Rel_Insert_Input = {
  data: Product_Variants_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Product_Variants_On_Conflict>;
};

/** on_conflict condition type for table "product_variants" */
export type Product_Variants_On_Conflict = {
  constraint: Product_Variants_Constraint;
  update_columns?: Array<Product_Variants_Update_Column>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};

/** Ordering options when selecting data from "product_variants". */
export type Product_Variants_Order_By = {
  age_group?: InputMaybe<Order_By>;
  clothing_age_group?: InputMaybe<Clothing_Age_Group_Order_By>;
  clothing_gender?: InputMaybe<Clothing_Gender_Order_By>;
  clothing_size?: InputMaybe<Clothing_Size_Order_By>;
  color?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  gender?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  order_items_aggregate?: InputMaybe<Order_Items_Aggregate_Order_By>;
  price_override_minor?: InputMaybe<Order_By>;
  product?: InputMaybe<Products_Order_By>;
  product_id?: InputMaybe<Order_By>;
  size?: InputMaybe<Order_By>;
  sku?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: product_variants */
export type Product_Variants_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "product_variants" */
export enum Product_Variants_Select_Column {
  /** column name */
  AgeGroup = 'age_group',
  /** column name */
  Color = 'color',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Gender = 'gender',
  /** column name */
  Id = 'id',
  /** column name */
  PriceOverrideMinor = 'price_override_minor',
  /** column name */
  ProductId = 'product_id',
  /** column name */
  Size = 'size',
  /** column name */
  Sku = 'sku',
  /** column name */
  Stock = 'stock',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "product_variants" */
export type Product_Variants_Set_Input = {
  age_group?: InputMaybe<Scalars['String']['input']>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Scalars['Int']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  size?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Product_Variants_Stddev_Fields = {
  __typename?: 'product_variants_stddev_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "product_variants" */
export type Product_Variants_Stddev_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Product_Variants_Stddev_Pop_Fields = {
  __typename?: 'product_variants_stddev_pop_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "product_variants" */
export type Product_Variants_Stddev_Pop_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Product_Variants_Stddev_Samp_Fields = {
  __typename?: 'product_variants_stddev_samp_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "product_variants" */
export type Product_Variants_Stddev_Samp_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "product_variants" */
export type Product_Variants_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Product_Variants_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Product_Variants_Stream_Cursor_Value_Input = {
  age_group?: InputMaybe<Scalars['String']['input']>;
  /** Optional color variant (e.g., black, white, blue). NULL means no color option. */
  color?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Scalars['Int']['input']>;
  product_id?: InputMaybe<Scalars['uuid']['input']>;
  size?: InputMaybe<Scalars['String']['input']>;
  sku?: InputMaybe<Scalars['String']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Product_Variants_Sum_Fields = {
  __typename?: 'product_variants_sum_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Int']['output']>;
  stock?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "product_variants" */
export type Product_Variants_Sum_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** update columns of table "product_variants" */
export enum Product_Variants_Update_Column {
  /** column name */
  AgeGroup = 'age_group',
  /** column name */
  Color = 'color',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Gender = 'gender',
  /** column name */
  Id = 'id',
  /** column name */
  PriceOverrideMinor = 'price_override_minor',
  /** column name */
  ProductId = 'product_id',
  /** column name */
  Size = 'size',
  /** column name */
  Sku = 'sku',
  /** column name */
  Stock = 'stock',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Product_Variants_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Product_Variants_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Product_Variants_Set_Input>;
  /** filter the rows which have to be updated */
  where: Product_Variants_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Product_Variants_Var_Pop_Fields = {
  __typename?: 'product_variants_var_pop_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "product_variants" */
export type Product_Variants_Var_Pop_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Product_Variants_Var_Samp_Fields = {
  __typename?: 'product_variants_var_samp_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "product_variants" */
export type Product_Variants_Var_Samp_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Product_Variants_Variance_Fields = {
  __typename?: 'product_variants_variance_fields';
  /** Optional variant-specific price override */
  price_override_minor?: Maybe<Scalars['Float']['output']>;
  stock?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "product_variants" */
export type Product_Variants_Variance_Order_By = {
  /** Optional variant-specific price override */
  price_override_minor?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
};

/** Shop products available for purchase */
export type Products = {
  __typename?: 'products';
  badge?: Maybe<Scalars['String']['output']>;
  category: Scalars['String']['output'];
  clothing_type?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  clothing_type_enum?: Maybe<Clothing_Type>;
  created_at: Scalars['timestamptz']['output'];
  currency: Scalars['String']['output'];
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  id: Scalars['uuid']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  /** An array relationship */
  order_items: Array<Order_Items>;
  /** An aggregate relationship */
  order_items_aggregate: Order_Items_Aggregate;
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor: Scalars['Int']['output'];
  /** An object relationship */
  product_status: Product_Status;
  /** An array relationship */
  product_variants: Array<Product_Variants>;
  /** An aggregate relationship */
  product_variants_aggregate: Product_Variants_Aggregate;
  slug: Scalars['String']['output'];
  status: Scalars['String']['output'];
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['timestamptz']['output'];
};


/** Shop products available for purchase */
export type ProductsOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** Shop products available for purchase */
export type ProductsOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


/** Shop products available for purchase */
export type ProductsProduct_VariantsArgs = {
  distinct_on?: InputMaybe<Array<Product_Variants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Variants_Order_By>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};


/** Shop products available for purchase */
export type ProductsProduct_Variants_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Product_Variants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Variants_Order_By>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};

/** aggregated selection of "products" */
export type Products_Aggregate = {
  __typename?: 'products_aggregate';
  aggregate?: Maybe<Products_Aggregate_Fields>;
  nodes: Array<Products>;
};

/** aggregate fields of "products" */
export type Products_Aggregate_Fields = {
  __typename?: 'products_aggregate_fields';
  avg?: Maybe<Products_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Products_Max_Fields>;
  min?: Maybe<Products_Min_Fields>;
  stddev?: Maybe<Products_Stddev_Fields>;
  stddev_pop?: Maybe<Products_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Products_Stddev_Samp_Fields>;
  sum?: Maybe<Products_Sum_Fields>;
  var_pop?: Maybe<Products_Var_Pop_Fields>;
  var_samp?: Maybe<Products_Var_Samp_Fields>;
  variance?: Maybe<Products_Variance_Fields>;
};


/** aggregate fields of "products" */
export type Products_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Products_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Products_Avg_Fields = {
  __typename?: 'products_avg_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "products". All fields are combined with a logical 'AND'. */
export type Products_Bool_Exp = {
  _and?: InputMaybe<Array<Products_Bool_Exp>>;
  _not?: InputMaybe<Products_Bool_Exp>;
  _or?: InputMaybe<Array<Products_Bool_Exp>>;
  badge?: InputMaybe<String_Comparison_Exp>;
  category?: InputMaybe<String_Comparison_Exp>;
  clothing_type?: InputMaybe<String_Comparison_Exp>;
  clothing_type_enum?: InputMaybe<Clothing_Type_Bool_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  currency?: InputMaybe<String_Comparison_Exp>;
  description_en?: InputMaybe<String_Comparison_Exp>;
  description_uk?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  images?: InputMaybe<String_Array_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  order_items?: InputMaybe<Order_Items_Bool_Exp>;
  order_items_aggregate?: InputMaybe<Order_Items_Aggregate_Bool_Exp>;
  price_minor?: InputMaybe<Int_Comparison_Exp>;
  product_status?: InputMaybe<Product_Status_Bool_Exp>;
  product_variants?: InputMaybe<Product_Variants_Bool_Exp>;
  product_variants_aggregate?: InputMaybe<Product_Variants_Aggregate_Bool_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  status?: InputMaybe<String_Comparison_Exp>;
  stock?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "products" */
export enum Products_Constraint {
  /** unique or primary key constraint on columns "id" */
  ProductsPkey = 'products_pkey',
  /** unique or primary key constraint on columns "slug" */
  ProductsSlugKey = 'products_slug_key'
}

/** input type for incrementing numeric columns in table "products" */
export type Products_Inc_Input = {
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: InputMaybe<Scalars['Int']['input']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "products" */
export type Products_Insert_Input = {
  badge?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  clothing_type?: InputMaybe<Scalars['String']['input']>;
  clothing_type_enum?: InputMaybe<Clothing_Type_Obj_Rel_Insert_Input>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  order_items?: InputMaybe<Order_Items_Arr_Rel_Insert_Input>;
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: InputMaybe<Scalars['Int']['input']>;
  product_status?: InputMaybe<Product_Status_Obj_Rel_Insert_Input>;
  product_variants?: InputMaybe<Product_Variants_Arr_Rel_Insert_Input>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Products_Max_Fields = {
  __typename?: 'products_max_fields';
  badge?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  clothing_type?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Int']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Products_Min_Fields = {
  __typename?: 'products_min_fields';
  badge?: Maybe<Scalars['String']['output']>;
  category?: Maybe<Scalars['String']['output']>;
  clothing_type?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Int']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "products" */
export type Products_Mutation_Response = {
  __typename?: 'products_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Products>;
};

/** input type for inserting object relation for remote table "products" */
export type Products_Obj_Rel_Insert_Input = {
  data: Products_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Products_On_Conflict>;
};

/** on_conflict condition type for table "products" */
export type Products_On_Conflict = {
  constraint: Products_Constraint;
  update_columns?: Array<Products_Update_Column>;
  where?: InputMaybe<Products_Bool_Exp>;
};

/** Ordering options when selecting data from "products". */
export type Products_Order_By = {
  badge?: InputMaybe<Order_By>;
  category?: InputMaybe<Order_By>;
  clothing_type?: InputMaybe<Order_By>;
  clothing_type_enum?: InputMaybe<Clothing_Type_Order_By>;
  created_at?: InputMaybe<Order_By>;
  currency?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  order_items_aggregate?: InputMaybe<Order_Items_Aggregate_Order_By>;
  price_minor?: InputMaybe<Order_By>;
  product_status?: InputMaybe<Product_Status_Order_By>;
  product_variants_aggregate?: InputMaybe<Product_Variants_Aggregate_Order_By>;
  slug?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  stock?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: products */
export type Products_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "products" */
export enum Products_Select_Column {
  /** column name */
  Badge = 'badge',
  /** column name */
  Category = 'category',
  /** column name */
  ClothingType = 'clothing_type',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  Id = 'id',
  /** column name */
  Images = 'images',
  /** column name */
  Name = 'name',
  /** column name */
  PriceMinor = 'price_minor',
  /** column name */
  Slug = 'slug',
  /** column name */
  Status = 'status',
  /** column name */
  Stock = 'stock',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "products" */
export type Products_Set_Input = {
  badge?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  clothing_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Products_Stddev_Fields = {
  __typename?: 'products_stddev_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Products_Stddev_Pop_Fields = {
  __typename?: 'products_stddev_pop_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Products_Stddev_Samp_Fields = {
  __typename?: 'products_stddev_samp_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "products" */
export type Products_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Products_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Products_Stream_Cursor_Value_Input = {
  badge?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Scalars['String']['input']>;
  clothing_type?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Products_Sum_Fields = {
  __typename?: 'products_sum_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Int']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "products" */
export enum Products_Update_Column {
  /** column name */
  Badge = 'badge',
  /** column name */
  Category = 'category',
  /** column name */
  ClothingType = 'clothing_type',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Currency = 'currency',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  Id = 'id',
  /** column name */
  Images = 'images',
  /** column name */
  Name = 'name',
  /** column name */
  PriceMinor = 'price_minor',
  /** column name */
  Slug = 'slug',
  /** column name */
  Status = 'status',
  /** column name */
  Stock = 'stock',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Products_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Products_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Products_Set_Input>;
  /** filter the rows which have to be updated */
  where: Products_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Products_Var_Pop_Fields = {
  __typename?: 'products_var_pop_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Products_Var_Samp_Fields = {
  __typename?: 'products_var_samp_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Products_Variance_Fields = {
  __typename?: 'products_variance_fields';
  /** Price in minor currency units (e.g., pence for GBP) */
  price_minor?: Maybe<Scalars['Float']['output']>;
  /** Stock count for products without variants. NULL means stock is managed at variant level. */
  stock?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "provider_type" */
export type Provider_Type = {
  __typename?: 'provider_type';
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  value: Scalars['String']['output'];
};


/** columns and relationships of "provider_type" */
export type Provider_TypeAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


/** columns and relationships of "provider_type" */
export type Provider_TypeAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

/** aggregated selection of "provider_type" */
export type Provider_Type_Aggregate = {
  __typename?: 'provider_type_aggregate';
  aggregate?: Maybe<Provider_Type_Aggregate_Fields>;
  nodes: Array<Provider_Type>;
};

/** aggregate fields of "provider_type" */
export type Provider_Type_Aggregate_Fields = {
  __typename?: 'provider_type_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Provider_Type_Max_Fields>;
  min?: Maybe<Provider_Type_Min_Fields>;
};


/** aggregate fields of "provider_type" */
export type Provider_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Provider_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "provider_type". All fields are combined with a logical 'AND'. */
export type Provider_Type_Bool_Exp = {
  _and?: InputMaybe<Array<Provider_Type_Bool_Exp>>;
  _not?: InputMaybe<Provider_Type_Bool_Exp>;
  _or?: InputMaybe<Array<Provider_Type_Bool_Exp>>;
  accounts?: InputMaybe<Accounts_Bool_Exp>;
  accounts_aggregate?: InputMaybe<Accounts_Aggregate_Bool_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "provider_type" */
export enum Provider_Type_Constraint {
  /** unique or primary key constraint on columns "value" */
  ProviderTypePkey = 'provider_type_pkey'
}

/** input type for inserting data into table "provider_type" */
export type Provider_Type_Insert_Input = {
  accounts?: InputMaybe<Accounts_Arr_Rel_Insert_Input>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Provider_Type_Max_Fields = {
  __typename?: 'provider_type_max_fields';
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Provider_Type_Min_Fields = {
  __typename?: 'provider_type_min_fields';
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "provider_type" */
export type Provider_Type_Mutation_Response = {
  __typename?: 'provider_type_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Provider_Type>;
};

/** input type for inserting object relation for remote table "provider_type" */
export type Provider_Type_Obj_Rel_Insert_Input = {
  data: Provider_Type_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Provider_Type_On_Conflict>;
};

/** on_conflict condition type for table "provider_type" */
export type Provider_Type_On_Conflict = {
  constraint: Provider_Type_Constraint;
  update_columns?: Array<Provider_Type_Update_Column>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};

/** Ordering options when selecting data from "provider_type". */
export type Provider_Type_Order_By = {
  accounts_aggregate?: InputMaybe<Accounts_Aggregate_Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: provider_type */
export type Provider_Type_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "provider_type" */
export enum Provider_Type_Select_Column {
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "provider_type" */
export type Provider_Type_Set_Input = {
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "provider_type" */
export type Provider_Type_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Provider_Type_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Provider_Type_Stream_Cursor_Value_Input = {
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "provider_type" */
export enum Provider_Type_Update_Column {
  /** column name */
  Value = 'value'
}

export type Provider_Type_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Provider_Type_Set_Input>;
  /** filter the rows which have to be updated */
  where: Provider_Type_Bool_Exp;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  /** fetch data from the table: "accounts" using primary key columns */
  accounts_by_pk?: Maybe<Accounts>;
  /** An array relationship */
  chains: Array<Chains>;
  /** An aggregate relationship */
  chains_aggregate: Chains_Aggregate;
  /** fetch data from the table: "chains" using primary key columns */
  chains_by_pk?: Maybe<Chains>;
  /** fetch data from the table: "clothing_age_group" */
  clothing_age_group: Array<Clothing_Age_Group>;
  /** fetch aggregated fields from the table: "clothing_age_group" */
  clothing_age_group_aggregate: Clothing_Age_Group_Aggregate;
  /** fetch data from the table: "clothing_age_group" using primary key columns */
  clothing_age_group_by_pk?: Maybe<Clothing_Age_Group>;
  /** fetch data from the table: "clothing_gender" */
  clothing_gender: Array<Clothing_Gender>;
  /** fetch aggregated fields from the table: "clothing_gender" */
  clothing_gender_aggregate: Clothing_Gender_Aggregate;
  /** fetch data from the table: "clothing_gender" using primary key columns */
  clothing_gender_by_pk?: Maybe<Clothing_Gender>;
  /** fetch data from the table: "clothing_size" */
  clothing_size: Array<Clothing_Size>;
  /** fetch aggregated fields from the table: "clothing_size" */
  clothing_size_aggregate: Clothing_Size_Aggregate;
  /** fetch data from the table: "clothing_size" using primary key columns */
  clothing_size_by_pk?: Maybe<Clothing_Size>;
  /** fetch data from the table: "clothing_type" */
  clothing_type: Array<Clothing_Type>;
  /** fetch aggregated fields from the table: "clothing_type" */
  clothing_type_aggregate: Clothing_Type_Aggregate;
  /** fetch data from the table: "clothing_type" using primary key columns */
  clothing_type_by_pk?: Maybe<Clothing_Type>;
  /** fetch data from the table: "event_status" */
  event_status: Array<Event_Status>;
  /** fetch aggregated fields from the table: "event_status" */
  event_status_aggregate: Event_Status_Aggregate;
  /** fetch data from the table: "event_status" using primary key columns */
  event_status_by_pk?: Maybe<Event_Status>;
  /** fetch data from the table: "event_tags" */
  event_tags: Array<Event_Tags>;
  /** fetch aggregated fields from the table: "event_tags" */
  event_tags_aggregate: Event_Tags_Aggregate;
  /** fetch data from the table: "event_tags" using primary key columns */
  event_tags_by_pk?: Maybe<Event_Tags>;
  /** fetch data from the table: "event_type" */
  event_type: Array<Event_Type>;
  /** fetch aggregated fields from the table: "event_type" */
  event_type_aggregate: Event_Type_Aggregate;
  /** fetch data from the table: "event_type" using primary key columns */
  event_type_by_pk?: Maybe<Event_Type>;
  /** An array relationship */
  events: Array<Events>;
  /** An aggregate relationship */
  events_aggregate: Events_Aggregate;
  /** fetch data from the table: "events" using primary key columns */
  events_by_pk?: Maybe<Events>;
  /** An array relationship */
  events_event_tags: Array<Events_Event_Tags>;
  /** An aggregate relationship */
  events_event_tags_aggregate: Events_Event_Tags_Aggregate;
  /** fetch data from the table: "events_event_tags" using primary key columns */
  events_event_tags_by_pk?: Maybe<Events_Event_Tags>;
  /** An array relationship */
  order_items: Array<Order_Items>;
  /** An aggregate relationship */
  order_items_aggregate: Order_Items_Aggregate;
  /** fetch data from the table: "order_items" using primary key columns */
  order_items_by_pk?: Maybe<Order_Items>;
  /** fetch data from the table: "order_status" */
  order_status: Array<Order_Status>;
  /** fetch aggregated fields from the table: "order_status" */
  order_status_aggregate: Order_Status_Aggregate;
  /** fetch data from the table: "order_status" using primary key columns */
  order_status_by_pk?: Maybe<Order_Status>;
  /** fetch data from the table: "orders" */
  orders: Array<Orders>;
  /** fetch aggregated fields from the table: "orders" */
  orders_aggregate: Orders_Aggregate;
  /** fetch data from the table: "orders" using primary key columns */
  orders_by_pk?: Maybe<Orders>;
  /** fetch data from the table: "price_type" */
  price_type: Array<Price_Type>;
  /** fetch aggregated fields from the table: "price_type" */
  price_type_aggregate: Price_Type_Aggregate;
  /** fetch data from the table: "price_type" using primary key columns */
  price_type_by_pk?: Maybe<Price_Type>;
  /** fetch data from the table: "product_status" */
  product_status: Array<Product_Status>;
  /** fetch aggregated fields from the table: "product_status" */
  product_status_aggregate: Product_Status_Aggregate;
  /** fetch data from the table: "product_status" using primary key columns */
  product_status_by_pk?: Maybe<Product_Status>;
  /** An array relationship */
  product_variants: Array<Product_Variants>;
  /** An aggregate relationship */
  product_variants_aggregate: Product_Variants_Aggregate;
  /** fetch data from the table: "product_variants" using primary key columns */
  product_variants_by_pk?: Maybe<Product_Variants>;
  /** fetch data from the table: "products" */
  products: Array<Products>;
  /** fetch aggregated fields from the table: "products" */
  products_aggregate: Products_Aggregate;
  /** fetch data from the table: "products" using primary key columns */
  products_by_pk?: Maybe<Products>;
  /** fetch data from the table: "provider_type" */
  provider_type: Array<Provider_Type>;
  /** fetch aggregated fields from the table: "provider_type" */
  provider_type_aggregate: Provider_Type_Aggregate;
  /** fetch data from the table: "provider_type" using primary key columns */
  provider_type_by_pk?: Maybe<Provider_Type>;
  /** An array relationship */
  sessions: Array<Sessions>;
  /** An aggregate relationship */
  sessions_aggregate: Sessions_Aggregate;
  /** fetch data from the table: "sessions" using primary key columns */
  sessions_by_pk?: Maybe<Sessions>;
  /** fetch data from the table: "user_role" */
  user_role: Array<User_Role>;
  /** fetch aggregated fields from the table: "user_role" */
  user_role_aggregate: User_Role_Aggregate;
  /** fetch data from the table: "user_role" using primary key columns */
  user_role_by_pk?: Maybe<User_Role>;
  /** fetch data from the table: "user_status" */
  user_status: Array<User_Status>;
  /** fetch aggregated fields from the table: "user_status" */
  user_status_aggregate: User_Status_Aggregate;
  /** fetch data from the table: "user_status" using primary key columns */
  user_status_by_pk?: Maybe<User_Status>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** An array relationship */
  venue_accommodation_details: Array<Venue_Accommodation_Details>;
  /** An aggregate relationship */
  venue_accommodation_details_aggregate: Venue_Accommodation_Details_Aggregate;
  /** fetch data from the table: "venue_accommodation_details" using primary key columns */
  venue_accommodation_details_by_pk?: Maybe<Venue_Accommodation_Details>;
  /** An array relationship */
  venue_beauty_salon_details: Array<Venue_Beauty_Salon_Details>;
  /** An aggregate relationship */
  venue_beauty_salon_details_aggregate: Venue_Beauty_Salon_Details_Aggregate;
  /** fetch data from the table: "venue_beauty_salon_details" using primary key columns */
  venue_beauty_salon_details_by_pk?: Maybe<Venue_Beauty_Salon_Details>;
  /** fetch data from the table: "venue_category" */
  venue_category: Array<Venue_Category>;
  /** fetch aggregated fields from the table: "venue_category" */
  venue_category_aggregate: Venue_Category_Aggregate;
  /** fetch data from the table: "venue_category" using primary key columns */
  venue_category_by_pk?: Maybe<Venue_Category>;
  /** An array relationship */
  venue_restaurant_details: Array<Venue_Restaurant_Details>;
  /** An aggregate relationship */
  venue_restaurant_details_aggregate: Venue_Restaurant_Details_Aggregate;
  /** fetch data from the table: "venue_restaurant_details" using primary key columns */
  venue_restaurant_details_by_pk?: Maybe<Venue_Restaurant_Details>;
  /** fetch data from the table: "venue_schedule" */
  venue_schedule: Array<Venue_Schedule>;
  /** fetch aggregated fields from the table: "venue_schedule" */
  venue_schedule_aggregate: Venue_Schedule_Aggregate;
  /** fetch data from the table: "venue_schedule" using primary key columns */
  venue_schedule_by_pk?: Maybe<Venue_Schedule>;
  /** An array relationship */
  venue_school_details: Array<Venue_School_Details>;
  /** An aggregate relationship */
  venue_school_details_aggregate: Venue_School_Details_Aggregate;
  /** fetch data from the table: "venue_school_details" using primary key columns */
  venue_school_details_by_pk?: Maybe<Venue_School_Details>;
  /** An array relationship */
  venue_shop_details: Array<Venue_Shop_Details>;
  /** An aggregate relationship */
  venue_shop_details_aggregate: Venue_Shop_Details_Aggregate;
  /** fetch data from the table: "venue_shop_details" using primary key columns */
  venue_shop_details_by_pk?: Maybe<Venue_Shop_Details>;
  /** fetch data from the table: "venue_status" */
  venue_status: Array<Venue_Status>;
  /** fetch aggregated fields from the table: "venue_status" */
  venue_status_aggregate: Venue_Status_Aggregate;
  /** fetch data from the table: "venue_status" using primary key columns */
  venue_status_by_pk?: Maybe<Venue_Status>;
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
  /** fetch data from the table: "venues" using primary key columns */
  venues_by_pk?: Maybe<Venues>;
  /** fetch data from the table: "verification_tokens" */
  verification_tokens: Array<Verification_Tokens>;
  /** fetch aggregated fields from the table: "verification_tokens" */
  verification_tokens_aggregate: Verification_Tokens_Aggregate;
  /** fetch data from the table: "verification_tokens" using primary key columns */
  verification_tokens_by_pk?: Maybe<Verification_Tokens>;
};


export type Query_RootAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


export type Query_RootAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


export type Query_RootAccounts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootChainsArgs = {
  distinct_on?: InputMaybe<Array<Chains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chains_Order_By>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


export type Query_RootChains_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Chains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chains_Order_By>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


export type Query_RootChains_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootClothing_Age_GroupArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Age_Group_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Age_Group_Order_By>>;
  where?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
};


export type Query_RootClothing_Age_Group_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Age_Group_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Age_Group_Order_By>>;
  where?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
};


export type Query_RootClothing_Age_Group_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootClothing_GenderArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Gender_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Gender_Order_By>>;
  where?: InputMaybe<Clothing_Gender_Bool_Exp>;
};


export type Query_RootClothing_Gender_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Gender_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Gender_Order_By>>;
  where?: InputMaybe<Clothing_Gender_Bool_Exp>;
};


export type Query_RootClothing_Gender_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootClothing_SizeArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Size_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Size_Order_By>>;
  where?: InputMaybe<Clothing_Size_Bool_Exp>;
};


export type Query_RootClothing_Size_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Size_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Size_Order_By>>;
  where?: InputMaybe<Clothing_Size_Bool_Exp>;
};


export type Query_RootClothing_Size_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootClothing_TypeArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Type_Order_By>>;
  where?: InputMaybe<Clothing_Type_Bool_Exp>;
};


export type Query_RootClothing_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Type_Order_By>>;
  where?: InputMaybe<Clothing_Type_Bool_Exp>;
};


export type Query_RootClothing_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootEvent_StatusArgs = {
  distinct_on?: InputMaybe<Array<Event_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Status_Order_By>>;
  where?: InputMaybe<Event_Status_Bool_Exp>;
};


export type Query_RootEvent_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Status_Order_By>>;
  where?: InputMaybe<Event_Status_Bool_Exp>;
};


export type Query_RootEvent_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootEvent_TagsArgs = {
  distinct_on?: InputMaybe<Array<Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Tags_Order_By>>;
  where?: InputMaybe<Event_Tags_Bool_Exp>;
};


export type Query_RootEvent_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Tags_Order_By>>;
  where?: InputMaybe<Event_Tags_Bool_Exp>;
};


export type Query_RootEvent_Tags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvent_TypeArgs = {
  distinct_on?: InputMaybe<Array<Event_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Type_Order_By>>;
  where?: InputMaybe<Event_Type_Bool_Exp>;
};


export type Query_RootEvent_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Type_Order_By>>;
  where?: InputMaybe<Event_Type_Bool_Exp>;
};


export type Query_RootEvent_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootEventsArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


export type Query_RootEvents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


export type Query_RootEvents_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootEvents_Event_TagsArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


export type Query_RootEvents_Event_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


export type Query_RootEvents_Event_Tags_By_PkArgs = {
  event_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};


export type Query_RootOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Query_RootOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Query_RootOrder_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootOrder_StatusArgs = {
  distinct_on?: InputMaybe<Array<Order_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Status_Order_By>>;
  where?: InputMaybe<Order_Status_Bool_Exp>;
};


export type Query_RootOrder_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Status_Order_By>>;
  where?: InputMaybe<Order_Status_Bool_Exp>;
};


export type Query_RootOrder_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Query_RootOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Query_RootOrders_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootPrice_TypeArgs = {
  distinct_on?: InputMaybe<Array<Price_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Price_Type_Order_By>>;
  where?: InputMaybe<Price_Type_Bool_Exp>;
};


export type Query_RootPrice_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Price_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Price_Type_Order_By>>;
  where?: InputMaybe<Price_Type_Bool_Exp>;
};


export type Query_RootPrice_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootProduct_StatusArgs = {
  distinct_on?: InputMaybe<Array<Product_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Status_Order_By>>;
  where?: InputMaybe<Product_Status_Bool_Exp>;
};


export type Query_RootProduct_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Product_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Status_Order_By>>;
  where?: InputMaybe<Product_Status_Bool_Exp>;
};


export type Query_RootProduct_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootProduct_VariantsArgs = {
  distinct_on?: InputMaybe<Array<Product_Variants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Variants_Order_By>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};


export type Query_RootProduct_Variants_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Product_Variants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Variants_Order_By>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};


export type Query_RootProduct_Variants_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Query_RootProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Query_RootProducts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootProvider_TypeArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};


export type Query_RootProvider_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};


export type Query_RootProvider_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootSessionsArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};


export type Query_RootSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};


export type Query_RootSessions_By_PkArgs = {
  sessionToken: Scalars['String']['input'];
};


export type Query_RootUser_RoleArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};


export type Query_RootUser_Role_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};


export type Query_RootUser_Role_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootUser_StatusArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};


export type Query_RootUser_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};


export type Query_RootUser_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Query_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootVenue_Accommodation_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Accommodation_Details_Order_By>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


export type Query_RootVenue_Accommodation_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Accommodation_Details_Order_By>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


export type Query_RootVenue_Accommodation_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Query_RootVenue_Beauty_Salon_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Beauty_Salon_Details_Order_By>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


export type Query_RootVenue_Beauty_Salon_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Beauty_Salon_Details_Order_By>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


export type Query_RootVenue_Beauty_Salon_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Query_RootVenue_CategoryArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};


export type Query_RootVenue_Category_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};


export type Query_RootVenue_Category_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootVenue_Restaurant_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Restaurant_Details_Order_By>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


export type Query_RootVenue_Restaurant_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Restaurant_Details_Order_By>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


export type Query_RootVenue_Restaurant_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Query_RootVenue_ScheduleArgs = {
  distinct_on?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Schedule_Order_By>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


export type Query_RootVenue_Schedule_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Schedule_Order_By>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


export type Query_RootVenue_Schedule_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootVenue_School_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_School_Details_Order_By>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


export type Query_RootVenue_School_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_School_Details_Order_By>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


export type Query_RootVenue_School_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Query_RootVenue_Shop_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Shop_Details_Order_By>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};


export type Query_RootVenue_Shop_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Shop_Details_Order_By>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};


export type Query_RootVenue_Shop_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Query_RootVenue_StatusArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};


export type Query_RootVenue_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};


export type Query_RootVenue_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Query_RootVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


export type Query_RootVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


export type Query_RootVenues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Query_RootVerification_TokensArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};


export type Query_RootVerification_Tokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};


export type Query_RootVerification_Tokens_By_PkArgs = {
  token: Scalars['String']['input'];
};

/** columns and relationships of "sessions" */
export type Sessions = {
  __typename?: 'sessions';
  expires: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  sessionToken: Scalars['String']['output'];
  /** An object relationship */
  user: Users;
  userId: Scalars['uuid']['output'];
};

/** aggregated selection of "sessions" */
export type Sessions_Aggregate = {
  __typename?: 'sessions_aggregate';
  aggregate?: Maybe<Sessions_Aggregate_Fields>;
  nodes: Array<Sessions>;
};

export type Sessions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Sessions_Aggregate_Bool_Exp_Count>;
};

export type Sessions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Sessions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Sessions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "sessions" */
export type Sessions_Aggregate_Fields = {
  __typename?: 'sessions_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Sessions_Max_Fields>;
  min?: Maybe<Sessions_Min_Fields>;
};


/** aggregate fields of "sessions" */
export type Sessions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Sessions_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "sessions" */
export type Sessions_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Sessions_Max_Order_By>;
  min?: InputMaybe<Sessions_Min_Order_By>;
};

/** input type for inserting array relation for remote table "sessions" */
export type Sessions_Arr_Rel_Insert_Input = {
  data: Array<Sessions_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Sessions_On_Conflict>;
};

/** Boolean expression to filter rows from the table "sessions". All fields are combined with a logical 'AND'. */
export type Sessions_Bool_Exp = {
  _and?: InputMaybe<Array<Sessions_Bool_Exp>>;
  _not?: InputMaybe<Sessions_Bool_Exp>;
  _or?: InputMaybe<Array<Sessions_Bool_Exp>>;
  expires?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  sessionToken?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "sessions" */
export enum Sessions_Constraint {
  /** unique or primary key constraint on columns "sessionToken" */
  SessionsPkey = 'sessions_pkey'
}

/** input type for inserting data into table "sessions" */
export type Sessions_Insert_Input = {
  expires?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  sessionToken?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Sessions_Max_Fields = {
  __typename?: 'sessions_max_fields';
  expires?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  sessionToken?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "sessions" */
export type Sessions_Max_Order_By = {
  expires?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  sessionToken?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Sessions_Min_Fields = {
  __typename?: 'sessions_min_fields';
  expires?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  sessionToken?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "sessions" */
export type Sessions_Min_Order_By = {
  expires?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  sessionToken?: InputMaybe<Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "sessions" */
export type Sessions_Mutation_Response = {
  __typename?: 'sessions_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Sessions>;
};

/** on_conflict condition type for table "sessions" */
export type Sessions_On_Conflict = {
  constraint: Sessions_Constraint;
  update_columns?: Array<Sessions_Update_Column>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

/** Ordering options when selecting data from "sessions". */
export type Sessions_Order_By = {
  expires?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  sessionToken?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  userId?: InputMaybe<Order_By>;
};

/** primary key columns input for table: sessions */
export type Sessions_Pk_Columns_Input = {
  sessionToken: Scalars['String']['input'];
};

/** select columns of table "sessions" */
export enum Sessions_Select_Column {
  /** column name */
  Expires = 'expires',
  /** column name */
  Id = 'id',
  /** column name */
  SessionToken = 'sessionToken',
  /** column name */
  UserId = 'userId'
}

/** input type for updating data in table "sessions" */
export type Sessions_Set_Input = {
  expires?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  sessionToken?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "sessions" */
export type Sessions_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Sessions_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Sessions_Stream_Cursor_Value_Input = {
  expires?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  sessionToken?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "sessions" */
export enum Sessions_Update_Column {
  /** column name */
  Expires = 'expires',
  /** column name */
  Id = 'id',
  /** column name */
  SessionToken = 'sessionToken',
  /** column name */
  UserId = 'userId'
}

export type Sessions_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Sessions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Sessions_Bool_Exp;
};

export type St_D_Within_Geography_Input = {
  distance: Scalars['Float']['input'];
  from: Scalars['geography']['input'];
  use_spheroid?: InputMaybe<Scalars['Boolean']['input']>;
};

export type St_D_Within_Input = {
  distance: Scalars['Float']['input'];
  from: Scalars['geometry']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  /** fetch data from the table: "accounts" using primary key columns */
  accounts_by_pk?: Maybe<Accounts>;
  /** fetch data from the table in a streaming manner: "accounts" */
  accounts_stream: Array<Accounts>;
  /** An array relationship */
  chains: Array<Chains>;
  /** An aggregate relationship */
  chains_aggregate: Chains_Aggregate;
  /** fetch data from the table: "chains" using primary key columns */
  chains_by_pk?: Maybe<Chains>;
  /** fetch data from the table in a streaming manner: "chains" */
  chains_stream: Array<Chains>;
  /** fetch data from the table: "clothing_age_group" */
  clothing_age_group: Array<Clothing_Age_Group>;
  /** fetch aggregated fields from the table: "clothing_age_group" */
  clothing_age_group_aggregate: Clothing_Age_Group_Aggregate;
  /** fetch data from the table: "clothing_age_group" using primary key columns */
  clothing_age_group_by_pk?: Maybe<Clothing_Age_Group>;
  /** fetch data from the table in a streaming manner: "clothing_age_group" */
  clothing_age_group_stream: Array<Clothing_Age_Group>;
  /** fetch data from the table: "clothing_gender" */
  clothing_gender: Array<Clothing_Gender>;
  /** fetch aggregated fields from the table: "clothing_gender" */
  clothing_gender_aggregate: Clothing_Gender_Aggregate;
  /** fetch data from the table: "clothing_gender" using primary key columns */
  clothing_gender_by_pk?: Maybe<Clothing_Gender>;
  /** fetch data from the table in a streaming manner: "clothing_gender" */
  clothing_gender_stream: Array<Clothing_Gender>;
  /** fetch data from the table: "clothing_size" */
  clothing_size: Array<Clothing_Size>;
  /** fetch aggregated fields from the table: "clothing_size" */
  clothing_size_aggregate: Clothing_Size_Aggregate;
  /** fetch data from the table: "clothing_size" using primary key columns */
  clothing_size_by_pk?: Maybe<Clothing_Size>;
  /** fetch data from the table in a streaming manner: "clothing_size" */
  clothing_size_stream: Array<Clothing_Size>;
  /** fetch data from the table: "clothing_type" */
  clothing_type: Array<Clothing_Type>;
  /** fetch aggregated fields from the table: "clothing_type" */
  clothing_type_aggregate: Clothing_Type_Aggregate;
  /** fetch data from the table: "clothing_type" using primary key columns */
  clothing_type_by_pk?: Maybe<Clothing_Type>;
  /** fetch data from the table in a streaming manner: "clothing_type" */
  clothing_type_stream: Array<Clothing_Type>;
  /** fetch data from the table: "event_status" */
  event_status: Array<Event_Status>;
  /** fetch aggregated fields from the table: "event_status" */
  event_status_aggregate: Event_Status_Aggregate;
  /** fetch data from the table: "event_status" using primary key columns */
  event_status_by_pk?: Maybe<Event_Status>;
  /** fetch data from the table in a streaming manner: "event_status" */
  event_status_stream: Array<Event_Status>;
  /** fetch data from the table: "event_tags" */
  event_tags: Array<Event_Tags>;
  /** fetch aggregated fields from the table: "event_tags" */
  event_tags_aggregate: Event_Tags_Aggregate;
  /** fetch data from the table: "event_tags" using primary key columns */
  event_tags_by_pk?: Maybe<Event_Tags>;
  /** fetch data from the table in a streaming manner: "event_tags" */
  event_tags_stream: Array<Event_Tags>;
  /** fetch data from the table: "event_type" */
  event_type: Array<Event_Type>;
  /** fetch aggregated fields from the table: "event_type" */
  event_type_aggregate: Event_Type_Aggregate;
  /** fetch data from the table: "event_type" using primary key columns */
  event_type_by_pk?: Maybe<Event_Type>;
  /** fetch data from the table in a streaming manner: "event_type" */
  event_type_stream: Array<Event_Type>;
  /** An array relationship */
  events: Array<Events>;
  /** An aggregate relationship */
  events_aggregate: Events_Aggregate;
  /** fetch data from the table: "events" using primary key columns */
  events_by_pk?: Maybe<Events>;
  /** An array relationship */
  events_event_tags: Array<Events_Event_Tags>;
  /** An aggregate relationship */
  events_event_tags_aggregate: Events_Event_Tags_Aggregate;
  /** fetch data from the table: "events_event_tags" using primary key columns */
  events_event_tags_by_pk?: Maybe<Events_Event_Tags>;
  /** fetch data from the table in a streaming manner: "events_event_tags" */
  events_event_tags_stream: Array<Events_Event_Tags>;
  /** fetch data from the table in a streaming manner: "events" */
  events_stream: Array<Events>;
  /** An array relationship */
  order_items: Array<Order_Items>;
  /** An aggregate relationship */
  order_items_aggregate: Order_Items_Aggregate;
  /** fetch data from the table: "order_items" using primary key columns */
  order_items_by_pk?: Maybe<Order_Items>;
  /** fetch data from the table in a streaming manner: "order_items" */
  order_items_stream: Array<Order_Items>;
  /** fetch data from the table: "order_status" */
  order_status: Array<Order_Status>;
  /** fetch aggregated fields from the table: "order_status" */
  order_status_aggregate: Order_Status_Aggregate;
  /** fetch data from the table: "order_status" using primary key columns */
  order_status_by_pk?: Maybe<Order_Status>;
  /** fetch data from the table in a streaming manner: "order_status" */
  order_status_stream: Array<Order_Status>;
  /** fetch data from the table: "orders" */
  orders: Array<Orders>;
  /** fetch aggregated fields from the table: "orders" */
  orders_aggregate: Orders_Aggregate;
  /** fetch data from the table: "orders" using primary key columns */
  orders_by_pk?: Maybe<Orders>;
  /** fetch data from the table in a streaming manner: "orders" */
  orders_stream: Array<Orders>;
  /** fetch data from the table: "price_type" */
  price_type: Array<Price_Type>;
  /** fetch aggregated fields from the table: "price_type" */
  price_type_aggregate: Price_Type_Aggregate;
  /** fetch data from the table: "price_type" using primary key columns */
  price_type_by_pk?: Maybe<Price_Type>;
  /** fetch data from the table in a streaming manner: "price_type" */
  price_type_stream: Array<Price_Type>;
  /** fetch data from the table: "product_status" */
  product_status: Array<Product_Status>;
  /** fetch aggregated fields from the table: "product_status" */
  product_status_aggregate: Product_Status_Aggregate;
  /** fetch data from the table: "product_status" using primary key columns */
  product_status_by_pk?: Maybe<Product_Status>;
  /** fetch data from the table in a streaming manner: "product_status" */
  product_status_stream: Array<Product_Status>;
  /** An array relationship */
  product_variants: Array<Product_Variants>;
  /** An aggregate relationship */
  product_variants_aggregate: Product_Variants_Aggregate;
  /** fetch data from the table: "product_variants" using primary key columns */
  product_variants_by_pk?: Maybe<Product_Variants>;
  /** fetch data from the table in a streaming manner: "product_variants" */
  product_variants_stream: Array<Product_Variants>;
  /** fetch data from the table: "products" */
  products: Array<Products>;
  /** fetch aggregated fields from the table: "products" */
  products_aggregate: Products_Aggregate;
  /** fetch data from the table: "products" using primary key columns */
  products_by_pk?: Maybe<Products>;
  /** fetch data from the table in a streaming manner: "products" */
  products_stream: Array<Products>;
  /** fetch data from the table: "provider_type" */
  provider_type: Array<Provider_Type>;
  /** fetch aggregated fields from the table: "provider_type" */
  provider_type_aggregate: Provider_Type_Aggregate;
  /** fetch data from the table: "provider_type" using primary key columns */
  provider_type_by_pk?: Maybe<Provider_Type>;
  /** fetch data from the table in a streaming manner: "provider_type" */
  provider_type_stream: Array<Provider_Type>;
  /** An array relationship */
  sessions: Array<Sessions>;
  /** An aggregate relationship */
  sessions_aggregate: Sessions_Aggregate;
  /** fetch data from the table: "sessions" using primary key columns */
  sessions_by_pk?: Maybe<Sessions>;
  /** fetch data from the table in a streaming manner: "sessions" */
  sessions_stream: Array<Sessions>;
  /** fetch data from the table: "user_role" */
  user_role: Array<User_Role>;
  /** fetch aggregated fields from the table: "user_role" */
  user_role_aggregate: User_Role_Aggregate;
  /** fetch data from the table: "user_role" using primary key columns */
  user_role_by_pk?: Maybe<User_Role>;
  /** fetch data from the table in a streaming manner: "user_role" */
  user_role_stream: Array<User_Role>;
  /** fetch data from the table: "user_status" */
  user_status: Array<User_Status>;
  /** fetch aggregated fields from the table: "user_status" */
  user_status_aggregate: User_Status_Aggregate;
  /** fetch data from the table: "user_status" using primary key columns */
  user_status_by_pk?: Maybe<User_Status>;
  /** fetch data from the table in a streaming manner: "user_status" */
  user_status_stream: Array<User_Status>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  /** fetch data from the table: "users" using primary key columns */
  users_by_pk?: Maybe<Users>;
  /** fetch data from the table in a streaming manner: "users" */
  users_stream: Array<Users>;
  /** An array relationship */
  venue_accommodation_details: Array<Venue_Accommodation_Details>;
  /** An aggregate relationship */
  venue_accommodation_details_aggregate: Venue_Accommodation_Details_Aggregate;
  /** fetch data from the table: "venue_accommodation_details" using primary key columns */
  venue_accommodation_details_by_pk?: Maybe<Venue_Accommodation_Details>;
  /** fetch data from the table in a streaming manner: "venue_accommodation_details" */
  venue_accommodation_details_stream: Array<Venue_Accommodation_Details>;
  /** An array relationship */
  venue_beauty_salon_details: Array<Venue_Beauty_Salon_Details>;
  /** An aggregate relationship */
  venue_beauty_salon_details_aggregate: Venue_Beauty_Salon_Details_Aggregate;
  /** fetch data from the table: "venue_beauty_salon_details" using primary key columns */
  venue_beauty_salon_details_by_pk?: Maybe<Venue_Beauty_Salon_Details>;
  /** fetch data from the table in a streaming manner: "venue_beauty_salon_details" */
  venue_beauty_salon_details_stream: Array<Venue_Beauty_Salon_Details>;
  /** fetch data from the table: "venue_category" */
  venue_category: Array<Venue_Category>;
  /** fetch aggregated fields from the table: "venue_category" */
  venue_category_aggregate: Venue_Category_Aggregate;
  /** fetch data from the table: "venue_category" using primary key columns */
  venue_category_by_pk?: Maybe<Venue_Category>;
  /** fetch data from the table in a streaming manner: "venue_category" */
  venue_category_stream: Array<Venue_Category>;
  /** An array relationship */
  venue_restaurant_details: Array<Venue_Restaurant_Details>;
  /** An aggregate relationship */
  venue_restaurant_details_aggregate: Venue_Restaurant_Details_Aggregate;
  /** fetch data from the table: "venue_restaurant_details" using primary key columns */
  venue_restaurant_details_by_pk?: Maybe<Venue_Restaurant_Details>;
  /** fetch data from the table in a streaming manner: "venue_restaurant_details" */
  venue_restaurant_details_stream: Array<Venue_Restaurant_Details>;
  /** fetch data from the table: "venue_schedule" */
  venue_schedule: Array<Venue_Schedule>;
  /** fetch aggregated fields from the table: "venue_schedule" */
  venue_schedule_aggregate: Venue_Schedule_Aggregate;
  /** fetch data from the table: "venue_schedule" using primary key columns */
  venue_schedule_by_pk?: Maybe<Venue_Schedule>;
  /** fetch data from the table in a streaming manner: "venue_schedule" */
  venue_schedule_stream: Array<Venue_Schedule>;
  /** An array relationship */
  venue_school_details: Array<Venue_School_Details>;
  /** An aggregate relationship */
  venue_school_details_aggregate: Venue_School_Details_Aggregate;
  /** fetch data from the table: "venue_school_details" using primary key columns */
  venue_school_details_by_pk?: Maybe<Venue_School_Details>;
  /** fetch data from the table in a streaming manner: "venue_school_details" */
  venue_school_details_stream: Array<Venue_School_Details>;
  /** An array relationship */
  venue_shop_details: Array<Venue_Shop_Details>;
  /** An aggregate relationship */
  venue_shop_details_aggregate: Venue_Shop_Details_Aggregate;
  /** fetch data from the table: "venue_shop_details" using primary key columns */
  venue_shop_details_by_pk?: Maybe<Venue_Shop_Details>;
  /** fetch data from the table in a streaming manner: "venue_shop_details" */
  venue_shop_details_stream: Array<Venue_Shop_Details>;
  /** fetch data from the table: "venue_status" */
  venue_status: Array<Venue_Status>;
  /** fetch aggregated fields from the table: "venue_status" */
  venue_status_aggregate: Venue_Status_Aggregate;
  /** fetch data from the table: "venue_status" using primary key columns */
  venue_status_by_pk?: Maybe<Venue_Status>;
  /** fetch data from the table in a streaming manner: "venue_status" */
  venue_status_stream: Array<Venue_Status>;
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
  /** fetch data from the table: "venues" using primary key columns */
  venues_by_pk?: Maybe<Venues>;
  /** fetch data from the table in a streaming manner: "venues" */
  venues_stream: Array<Venues>;
  /** fetch data from the table: "verification_tokens" */
  verification_tokens: Array<Verification_Tokens>;
  /** fetch aggregated fields from the table: "verification_tokens" */
  verification_tokens_aggregate: Verification_Tokens_Aggregate;
  /** fetch data from the table: "verification_tokens" using primary key columns */
  verification_tokens_by_pk?: Maybe<Verification_Tokens>;
  /** fetch data from the table in a streaming manner: "verification_tokens" */
  verification_tokens_stream: Array<Verification_Tokens>;
};


export type Subscription_RootAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


export type Subscription_RootAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


export type Subscription_RootAccounts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootAccounts_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Accounts_Stream_Cursor_Input>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


export type Subscription_RootChainsArgs = {
  distinct_on?: InputMaybe<Array<Chains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chains_Order_By>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


export type Subscription_RootChains_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Chains_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Chains_Order_By>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


export type Subscription_RootChains_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootChains_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Chains_Stream_Cursor_Input>>;
  where?: InputMaybe<Chains_Bool_Exp>;
};


export type Subscription_RootClothing_Age_GroupArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Age_Group_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Age_Group_Order_By>>;
  where?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
};


export type Subscription_RootClothing_Age_Group_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Age_Group_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Age_Group_Order_By>>;
  where?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
};


export type Subscription_RootClothing_Age_Group_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootClothing_Age_Group_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Clothing_Age_Group_Stream_Cursor_Input>>;
  where?: InputMaybe<Clothing_Age_Group_Bool_Exp>;
};


export type Subscription_RootClothing_GenderArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Gender_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Gender_Order_By>>;
  where?: InputMaybe<Clothing_Gender_Bool_Exp>;
};


export type Subscription_RootClothing_Gender_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Gender_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Gender_Order_By>>;
  where?: InputMaybe<Clothing_Gender_Bool_Exp>;
};


export type Subscription_RootClothing_Gender_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootClothing_Gender_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Clothing_Gender_Stream_Cursor_Input>>;
  where?: InputMaybe<Clothing_Gender_Bool_Exp>;
};


export type Subscription_RootClothing_SizeArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Size_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Size_Order_By>>;
  where?: InputMaybe<Clothing_Size_Bool_Exp>;
};


export type Subscription_RootClothing_Size_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Size_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Size_Order_By>>;
  where?: InputMaybe<Clothing_Size_Bool_Exp>;
};


export type Subscription_RootClothing_Size_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootClothing_Size_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Clothing_Size_Stream_Cursor_Input>>;
  where?: InputMaybe<Clothing_Size_Bool_Exp>;
};


export type Subscription_RootClothing_TypeArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Type_Order_By>>;
  where?: InputMaybe<Clothing_Type_Bool_Exp>;
};


export type Subscription_RootClothing_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Clothing_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Clothing_Type_Order_By>>;
  where?: InputMaybe<Clothing_Type_Bool_Exp>;
};


export type Subscription_RootClothing_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootClothing_Type_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Clothing_Type_Stream_Cursor_Input>>;
  where?: InputMaybe<Clothing_Type_Bool_Exp>;
};


export type Subscription_RootEvent_StatusArgs = {
  distinct_on?: InputMaybe<Array<Event_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Status_Order_By>>;
  where?: InputMaybe<Event_Status_Bool_Exp>;
};


export type Subscription_RootEvent_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Status_Order_By>>;
  where?: InputMaybe<Event_Status_Bool_Exp>;
};


export type Subscription_RootEvent_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootEvent_Status_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Status_Bool_Exp>;
};


export type Subscription_RootEvent_TagsArgs = {
  distinct_on?: InputMaybe<Array<Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Tags_Order_By>>;
  where?: InputMaybe<Event_Tags_Bool_Exp>;
};


export type Subscription_RootEvent_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Tags_Order_By>>;
  where?: InputMaybe<Event_Tags_Bool_Exp>;
};


export type Subscription_RootEvent_Tags_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvent_Tags_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Tags_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Tags_Bool_Exp>;
};


export type Subscription_RootEvent_TypeArgs = {
  distinct_on?: InputMaybe<Array<Event_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Type_Order_By>>;
  where?: InputMaybe<Event_Type_Bool_Exp>;
};


export type Subscription_RootEvent_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Event_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Event_Type_Order_By>>;
  where?: InputMaybe<Event_Type_Bool_Exp>;
};


export type Subscription_RootEvent_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootEvent_Type_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Event_Type_Stream_Cursor_Input>>;
  where?: InputMaybe<Event_Type_Bool_Exp>;
};


export type Subscription_RootEventsArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


export type Subscription_RootEvents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


export type Subscription_RootEvents_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootEvents_Event_TagsArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


export type Subscription_RootEvents_Event_Tags_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Event_Tags_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Event_Tags_Order_By>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


export type Subscription_RootEvents_Event_Tags_By_PkArgs = {
  event_id: Scalars['uuid']['input'];
  tag_id: Scalars['uuid']['input'];
};


export type Subscription_RootEvents_Event_Tags_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Events_Event_Tags_Stream_Cursor_Input>>;
  where?: InputMaybe<Events_Event_Tags_Bool_Exp>;
};


export type Subscription_RootEvents_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Events_Stream_Cursor_Input>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


export type Subscription_RootOrder_ItemsArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Subscription_RootOrder_Items_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Items_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Items_Order_By>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Subscription_RootOrder_Items_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootOrder_Items_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Order_Items_Stream_Cursor_Input>>;
  where?: InputMaybe<Order_Items_Bool_Exp>;
};


export type Subscription_RootOrder_StatusArgs = {
  distinct_on?: InputMaybe<Array<Order_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Status_Order_By>>;
  where?: InputMaybe<Order_Status_Bool_Exp>;
};


export type Subscription_RootOrder_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Order_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Order_Status_Order_By>>;
  where?: InputMaybe<Order_Status_Bool_Exp>;
};


export type Subscription_RootOrder_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootOrder_Status_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Order_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<Order_Status_Bool_Exp>;
};


export type Subscription_RootOrdersArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Subscription_RootOrders_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Orders_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Orders_Order_By>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Subscription_RootOrders_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootOrders_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Orders_Stream_Cursor_Input>>;
  where?: InputMaybe<Orders_Bool_Exp>;
};


export type Subscription_RootPrice_TypeArgs = {
  distinct_on?: InputMaybe<Array<Price_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Price_Type_Order_By>>;
  where?: InputMaybe<Price_Type_Bool_Exp>;
};


export type Subscription_RootPrice_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Price_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Price_Type_Order_By>>;
  where?: InputMaybe<Price_Type_Bool_Exp>;
};


export type Subscription_RootPrice_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootPrice_Type_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Price_Type_Stream_Cursor_Input>>;
  where?: InputMaybe<Price_Type_Bool_Exp>;
};


export type Subscription_RootProduct_StatusArgs = {
  distinct_on?: InputMaybe<Array<Product_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Status_Order_By>>;
  where?: InputMaybe<Product_Status_Bool_Exp>;
};


export type Subscription_RootProduct_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Product_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Status_Order_By>>;
  where?: InputMaybe<Product_Status_Bool_Exp>;
};


export type Subscription_RootProduct_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootProduct_Status_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Product_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<Product_Status_Bool_Exp>;
};


export type Subscription_RootProduct_VariantsArgs = {
  distinct_on?: InputMaybe<Array<Product_Variants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Variants_Order_By>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};


export type Subscription_RootProduct_Variants_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Product_Variants_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Product_Variants_Order_By>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};


export type Subscription_RootProduct_Variants_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootProduct_Variants_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Product_Variants_Stream_Cursor_Input>>;
  where?: InputMaybe<Product_Variants_Bool_Exp>;
};


export type Subscription_RootProductsArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Subscription_RootProducts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Products_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Subscription_RootProducts_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootProducts_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Products_Stream_Cursor_Input>>;
  where?: InputMaybe<Products_Bool_Exp>;
};


export type Subscription_RootProvider_TypeArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};


export type Subscription_RootProvider_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};


export type Subscription_RootProvider_Type_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootProvider_Type_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Provider_Type_Stream_Cursor_Input>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};


export type Subscription_RootSessionsArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};


export type Subscription_RootSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};


export type Subscription_RootSessions_By_PkArgs = {
  sessionToken: Scalars['String']['input'];
};


export type Subscription_RootSessions_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Sessions_Stream_Cursor_Input>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};


export type Subscription_RootUser_RoleArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};


export type Subscription_RootUser_Role_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};


export type Subscription_RootUser_Role_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootUser_Role_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Role_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};


export type Subscription_RootUser_StatusArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};


export type Subscription_RootUser_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};


export type Subscription_RootUser_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootUser_Status_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};


export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


export type Subscription_RootVenue_Accommodation_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Accommodation_Details_Order_By>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Accommodation_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Accommodation_Details_Order_By>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Accommodation_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Accommodation_Details_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Accommodation_Details_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Beauty_Salon_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Beauty_Salon_Details_Order_By>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Beauty_Salon_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Beauty_Salon_Details_Order_By>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Beauty_Salon_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Beauty_Salon_Details_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Beauty_Salon_Details_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


export type Subscription_RootVenue_CategoryArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};


export type Subscription_RootVenue_Category_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};


export type Subscription_RootVenue_Category_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootVenue_Category_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Category_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};


export type Subscription_RootVenue_Restaurant_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Restaurant_Details_Order_By>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Restaurant_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Restaurant_Details_Order_By>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Restaurant_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Restaurant_Details_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Restaurant_Details_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


export type Subscription_RootVenue_ScheduleArgs = {
  distinct_on?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Schedule_Order_By>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


export type Subscription_RootVenue_Schedule_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Schedule_Order_By>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


export type Subscription_RootVenue_Schedule_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Schedule_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Schedule_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


export type Subscription_RootVenue_School_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_School_Details_Order_By>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


export type Subscription_RootVenue_School_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_School_Details_Order_By>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


export type Subscription_RootVenue_School_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_School_Details_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_School_Details_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Shop_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Shop_Details_Order_By>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Shop_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Shop_Details_Order_By>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};


export type Subscription_RootVenue_Shop_Details_By_PkArgs = {
  venue_id: Scalars['uuid']['input'];
};


export type Subscription_RootVenue_Shop_Details_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Shop_Details_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};


export type Subscription_RootVenue_StatusArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};


export type Subscription_RootVenue_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};


export type Subscription_RootVenue_Status_By_PkArgs = {
  value: Scalars['String']['input'];
};


export type Subscription_RootVenue_Status_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venue_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};


export type Subscription_RootVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


export type Subscription_RootVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


export type Subscription_RootVenues_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootVenues_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Venues_Stream_Cursor_Input>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


export type Subscription_RootVerification_TokensArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};


export type Subscription_RootVerification_Tokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};


export type Subscription_RootVerification_Tokens_By_PkArgs = {
  token: Scalars['String']['input'];
};


export type Subscription_RootVerification_Tokens_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Verification_Tokens_Stream_Cursor_Input>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

/** Boolean expression to compare columns of type "time". All fields are combined with logical 'AND'. */
export type Time_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['time']['input']>;
  _gt?: InputMaybe<Scalars['time']['input']>;
  _gte?: InputMaybe<Scalars['time']['input']>;
  _in?: InputMaybe<Array<Scalars['time']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['time']['input']>;
  _lte?: InputMaybe<Scalars['time']['input']>;
  _neq?: InputMaybe<Scalars['time']['input']>;
  _nin?: InputMaybe<Array<Scalars['time']['input']>>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** columns and relationships of "user_role" */
export type User_Role = {
  __typename?: 'user_role';
  description?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  value: Scalars['String']['output'];
};


/** columns and relationships of "user_role" */
export type User_RoleUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


/** columns and relationships of "user_role" */
export type User_RoleUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** aggregated selection of "user_role" */
export type User_Role_Aggregate = {
  __typename?: 'user_role_aggregate';
  aggregate?: Maybe<User_Role_Aggregate_Fields>;
  nodes: Array<User_Role>;
};

/** aggregate fields of "user_role" */
export type User_Role_Aggregate_Fields = {
  __typename?: 'user_role_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Role_Max_Fields>;
  min?: Maybe<User_Role_Min_Fields>;
};


/** aggregate fields of "user_role" */
export type User_Role_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Role_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "user_role". All fields are combined with a logical 'AND'. */
export type User_Role_Bool_Exp = {
  _and?: InputMaybe<Array<User_Role_Bool_Exp>>;
  _not?: InputMaybe<User_Role_Bool_Exp>;
  _or?: InputMaybe<Array<User_Role_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  users?: InputMaybe<Users_Bool_Exp>;
  users_aggregate?: InputMaybe<Users_Aggregate_Bool_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_role" */
export enum User_Role_Constraint {
  /** unique or primary key constraint on columns "value" */
  UserRolePkey = 'user_role_pkey'
}

export enum User_Role_Enum {
  /** Administrator with full access */
  Admin = 'admin',
  /** Regular user with standard access */
  User = 'user'
}

/** Boolean expression to compare columns of type "user_role_enum". All fields are combined with logical 'AND'. */
export type User_Role_Enum_Comparison_Exp = {
  _eq?: InputMaybe<User_Role_Enum>;
  _in?: InputMaybe<Array<User_Role_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<User_Role_Enum>;
  _nin?: InputMaybe<Array<User_Role_Enum>>;
};

/** input type for inserting data into table "user_role" */
export type User_Role_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  users?: InputMaybe<Users_Arr_Rel_Insert_Input>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type User_Role_Max_Fields = {
  __typename?: 'user_role_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type User_Role_Min_Fields = {
  __typename?: 'user_role_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "user_role" */
export type User_Role_Mutation_Response = {
  __typename?: 'user_role_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Role>;
};

/** input type for inserting object relation for remote table "user_role" */
export type User_Role_Obj_Rel_Insert_Input = {
  data: User_Role_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Role_On_Conflict>;
};

/** on_conflict condition type for table "user_role" */
export type User_Role_On_Conflict = {
  constraint: User_Role_Constraint;
  update_columns?: Array<User_Role_Update_Column>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};

/** Ordering options when selecting data from "user_role". */
export type User_Role_Order_By = {
  description?: InputMaybe<Order_By>;
  users_aggregate?: InputMaybe<Users_Aggregate_Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_role */
export type User_Role_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "user_role" */
export enum User_Role_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "user_role" */
export type User_Role_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "user_role" */
export type User_Role_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Role_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Role_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "user_role" */
export enum User_Role_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type User_Role_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Role_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Role_Bool_Exp;
};

/** columns and relationships of "user_status" */
export type User_Status = {
  __typename?: 'user_status';
  description?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  value: Scalars['String']['output'];
};


/** columns and relationships of "user_status" */
export type User_StatusUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};


/** columns and relationships of "user_status" */
export type User_StatusUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** aggregated selection of "user_status" */
export type User_Status_Aggregate = {
  __typename?: 'user_status_aggregate';
  aggregate?: Maybe<User_Status_Aggregate_Fields>;
  nodes: Array<User_Status>;
};

/** aggregate fields of "user_status" */
export type User_Status_Aggregate_Fields = {
  __typename?: 'user_status_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<User_Status_Max_Fields>;
  min?: Maybe<User_Status_Min_Fields>;
};


/** aggregate fields of "user_status" */
export type User_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "user_status". All fields are combined with a logical 'AND'. */
export type User_Status_Bool_Exp = {
  _and?: InputMaybe<Array<User_Status_Bool_Exp>>;
  _not?: InputMaybe<User_Status_Bool_Exp>;
  _or?: InputMaybe<Array<User_Status_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  users?: InputMaybe<Users_Bool_Exp>;
  users_aggregate?: InputMaybe<Users_Aggregate_Bool_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_status" */
export enum User_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  UserStatusPkey = 'user_status_pkey'
}

export enum User_Status_Enum {
  /** Currently active and able to log in */
  Active = 'active',
  /** Inactive but can be reactivated */
  Inactive = 'inactive'
}

/** Boolean expression to compare columns of type "user_status_enum". All fields are combined with logical 'AND'. */
export type User_Status_Enum_Comparison_Exp = {
  _eq?: InputMaybe<User_Status_Enum>;
  _in?: InputMaybe<Array<User_Status_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<User_Status_Enum>;
  _nin?: InputMaybe<Array<User_Status_Enum>>;
};

/** input type for inserting data into table "user_status" */
export type User_Status_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  users?: InputMaybe<Users_Arr_Rel_Insert_Input>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type User_Status_Max_Fields = {
  __typename?: 'user_status_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type User_Status_Min_Fields = {
  __typename?: 'user_status_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "user_status" */
export type User_Status_Mutation_Response = {
  __typename?: 'user_status_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Status>;
};

/** input type for inserting object relation for remote table "user_status" */
export type User_Status_Obj_Rel_Insert_Input = {
  data: User_Status_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Status_On_Conflict>;
};

/** on_conflict condition type for table "user_status" */
export type User_Status_On_Conflict = {
  constraint: User_Status_Constraint;
  update_columns?: Array<User_Status_Update_Column>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "user_status". */
export type User_Status_Order_By = {
  description?: InputMaybe<Order_By>;
  users_aggregate?: InputMaybe<Users_Aggregate_Order_By>;
  value?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_status */
export type User_Status_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "user_status" */
export enum User_Status_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "user_status" */
export type User_Status_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "user_status" */
export type User_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Status_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "user_status" */
export enum User_Status_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type User_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Status_Bool_Exp;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: 'users';
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  city?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  emailVerified?: Maybe<Scalars['timestamptz']['output']>;
  /** An array relationship */
  events: Array<Events>;
  /** An aggregate relationship */
  events_aggregate: Events_Aggregate;
  events_created: Scalars['Int']['output'];
  id: Scalars['uuid']['output'];
  image?: Maybe<Scalars['String']['output']>;
  is_verified_contributor: Scalars['Boolean']['output'];
  last_activity_at?: Maybe<Scalars['timestamp']['output']>;
  level: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  owned_events: Array<Events>;
  /** An aggregate relationship */
  owned_events_aggregate: Events_Aggregate;
  points: Scalars['Int']['output'];
  reviews_created: Scalars['Int']['output'];
  role: User_Role_Enum;
  /** An array relationship */
  sessions: Array<Sessions>;
  /** An aggregate relationship */
  sessions_aggregate: Sessions_Aggregate;
  status: User_Status_Enum;
  thank_you_count: Scalars['Int']['output'];
  /** An object relationship */
  user_role: User_Role;
  /** An object relationship */
  user_status: User_Status;
  venues_created: Scalars['Int']['output'];
};


/** columns and relationships of "users" */
export type UsersAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersEventsArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersEvents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersOwned_EventsArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersOwned_Events_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersSessionsArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};


/** columns and relationships of "users" */
export type UsersSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: 'users_aggregate';
  aggregate?: Maybe<Users_Aggregate_Fields>;
  nodes: Array<Users>;
};

export type Users_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Users_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Users_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Users_Aggregate_Bool_Exp_Count>;
};

export type Users_Aggregate_Bool_Exp_Bool_And = {
  arguments: Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Users_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Users_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: 'users_aggregate_fields';
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Users_Max_Fields>;
  min?: Maybe<Users_Min_Fields>;
  stddev?: Maybe<Users_Stddev_Fields>;
  stddev_pop?: Maybe<Users_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Users_Stddev_Samp_Fields>;
  sum?: Maybe<Users_Sum_Fields>;
  var_pop?: Maybe<Users_Var_Pop_Fields>;
  var_samp?: Maybe<Users_Var_Samp_Fields>;
  variance?: Maybe<Users_Variance_Fields>;
};


/** aggregate fields of "users" */
export type Users_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "users" */
export type Users_Aggregate_Order_By = {
  avg?: InputMaybe<Users_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Users_Max_Order_By>;
  min?: InputMaybe<Users_Min_Order_By>;
  stddev?: InputMaybe<Users_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Users_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Users_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Users_Sum_Order_By>;
  var_pop?: InputMaybe<Users_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Users_Var_Samp_Order_By>;
  variance?: InputMaybe<Users_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "users" */
export type Users_Arr_Rel_Insert_Input = {
  data: Array<Users_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** aggregate avg on columns */
export type Users_Avg_Fields = {
  __typename?: 'users_avg_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "users" */
export type Users_Avg_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "users". All fields are combined with a logical 'AND'. */
export type Users_Bool_Exp = {
  _and?: InputMaybe<Array<Users_Bool_Exp>>;
  _not?: InputMaybe<Users_Bool_Exp>;
  _or?: InputMaybe<Array<Users_Bool_Exp>>;
  accounts?: InputMaybe<Accounts_Bool_Exp>;
  accounts_aggregate?: InputMaybe<Accounts_Aggregate_Bool_Exp>;
  city?: InputMaybe<String_Comparison_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  emailVerified?: InputMaybe<Timestamptz_Comparison_Exp>;
  events?: InputMaybe<Events_Bool_Exp>;
  events_aggregate?: InputMaybe<Events_Aggregate_Bool_Exp>;
  events_created?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_verified_contributor?: InputMaybe<Boolean_Comparison_Exp>;
  last_activity_at?: InputMaybe<Timestamp_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  owned_events?: InputMaybe<Events_Bool_Exp>;
  owned_events_aggregate?: InputMaybe<Events_Aggregate_Bool_Exp>;
  points?: InputMaybe<Int_Comparison_Exp>;
  reviews_created?: InputMaybe<Int_Comparison_Exp>;
  role?: InputMaybe<User_Role_Enum_Comparison_Exp>;
  sessions?: InputMaybe<Sessions_Bool_Exp>;
  sessions_aggregate?: InputMaybe<Sessions_Aggregate_Bool_Exp>;
  status?: InputMaybe<User_Status_Enum_Comparison_Exp>;
  thank_you_count?: InputMaybe<Int_Comparison_Exp>;
  user_role?: InputMaybe<User_Role_Bool_Exp>;
  user_status?: InputMaybe<User_Status_Bool_Exp>;
  venues_created?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = 'users_email_key',
  /** unique or primary key constraint on columns "id" */
  UsersPkey = 'users_pkey'
}

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  events_created?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  reviews_created?: InputMaybe<Scalars['Int']['input']>;
  thank_you_count?: InputMaybe<Scalars['Int']['input']>;
  venues_created?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  accounts?: InputMaybe<Accounts_Arr_Rel_Insert_Input>;
  city?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['timestamptz']['input']>;
  events?: InputMaybe<Events_Arr_Rel_Insert_Input>;
  events_created?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_verified_contributor?: InputMaybe<Scalars['Boolean']['input']>;
  last_activity_at?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owned_events?: InputMaybe<Events_Arr_Rel_Insert_Input>;
  points?: InputMaybe<Scalars['Int']['input']>;
  reviews_created?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<User_Role_Enum>;
  sessions?: InputMaybe<Sessions_Arr_Rel_Insert_Input>;
  status?: InputMaybe<User_Status_Enum>;
  thank_you_count?: InputMaybe<Scalars['Int']['input']>;
  user_role?: InputMaybe<User_Role_Obj_Rel_Insert_Input>;
  user_status?: InputMaybe<User_Status_Obj_Rel_Insert_Input>;
  venues_created?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: 'users_max_fields';
  city?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['timestamptz']['output']>;
  events_created?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  last_activity_at?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  points?: Maybe<Scalars['Int']['output']>;
  reviews_created?: Maybe<Scalars['Int']['output']>;
  thank_you_count?: Maybe<Scalars['Int']['output']>;
  venues_created?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "users" */
export type Users_Max_Order_By = {
  city?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  emailVerified?: InputMaybe<Order_By>;
  events_created?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  last_activity_at?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: 'users_min_fields';
  city?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  emailVerified?: Maybe<Scalars['timestamptz']['output']>;
  events_created?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  image?: Maybe<Scalars['String']['output']>;
  last_activity_at?: Maybe<Scalars['timestamp']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  points?: Maybe<Scalars['Int']['output']>;
  reviews_created?: Maybe<Scalars['Int']['output']>;
  thank_you_count?: Maybe<Scalars['Int']['output']>;
  venues_created?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "users" */
export type Users_Min_Order_By = {
  city?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  emailVerified?: InputMaybe<Order_By>;
  events_created?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  last_activity_at?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: 'users_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Users>;
};

/** input type for inserting object relation for remote table "users" */
export type Users_Obj_Rel_Insert_Input = {
  data: Users_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** on_conflict condition type for table "users" */
export type Users_On_Conflict = {
  constraint: Users_Constraint;
  update_columns?: Array<Users_Update_Column>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** Ordering options when selecting data from "users". */
export type Users_Order_By = {
  accounts_aggregate?: InputMaybe<Accounts_Aggregate_Order_By>;
  city?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  emailVerified?: InputMaybe<Order_By>;
  events_aggregate?: InputMaybe<Events_Aggregate_Order_By>;
  events_created?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_verified_contributor?: InputMaybe<Order_By>;
  last_activity_at?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owned_events_aggregate?: InputMaybe<Events_Aggregate_Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  role?: InputMaybe<Order_By>;
  sessions_aggregate?: InputMaybe<Sessions_Aggregate_Order_By>;
  status?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  user_role?: InputMaybe<User_Role_Order_By>;
  user_status?: InputMaybe<User_Status_Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** primary key columns input for table: users */
export type Users_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  City = 'city',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'emailVerified',
  /** column name */
  EventsCreated = 'events_created',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  IsVerifiedContributor = 'is_verified_contributor',
  /** column name */
  LastActivityAt = 'last_activity_at',
  /** column name */
  Level = 'level',
  /** column name */
  Name = 'name',
  /** column name */
  Points = 'points',
  /** column name */
  ReviewsCreated = 'reviews_created',
  /** column name */
  Role = 'role',
  /** column name */
  Status = 'status',
  /** column name */
  ThankYouCount = 'thank_you_count',
  /** column name */
  VenuesCreated = 'venues_created'
}

/** select "users_aggregate_bool_exp_bool_and_arguments_columns" columns of table "users" */
export enum Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsVerifiedContributor = 'is_verified_contributor'
}

/** select "users_aggregate_bool_exp_bool_or_arguments_columns" columns of table "users" */
export enum Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsVerifiedContributor = 'is_verified_contributor'
}

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  city?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['timestamptz']['input']>;
  events_created?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_verified_contributor?: InputMaybe<Scalars['Boolean']['input']>;
  last_activity_at?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  reviews_created?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<User_Role_Enum>;
  status?: InputMaybe<User_Status_Enum>;
  thank_you_count?: InputMaybe<Scalars['Int']['input']>;
  venues_created?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: 'users_stddev_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "users" */
export type Users_Stddev_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Users_Stddev_Pop_Fields = {
  __typename?: 'users_stddev_pop_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "users" */
export type Users_Stddev_Pop_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Users_Stddev_Samp_Fields = {
  __typename?: 'users_stddev_samp_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "users" */
export type Users_Stddev_Samp_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "users" */
export type Users_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Users_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Users_Stream_Cursor_Value_Input = {
  city?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  emailVerified?: InputMaybe<Scalars['timestamptz']['input']>;
  events_created?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  is_verified_contributor?: InputMaybe<Scalars['Boolean']['input']>;
  last_activity_at?: InputMaybe<Scalars['timestamp']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  points?: InputMaybe<Scalars['Int']['input']>;
  reviews_created?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<User_Role_Enum>;
  status?: InputMaybe<User_Status_Enum>;
  thank_you_count?: InputMaybe<Scalars['Int']['input']>;
  venues_created?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: 'users_sum_fields';
  events_created?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['Int']['output']>;
  points?: Maybe<Scalars['Int']['output']>;
  reviews_created?: Maybe<Scalars['Int']['output']>;
  thank_you_count?: Maybe<Scalars['Int']['output']>;
  venues_created?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "users" */
export type Users_Sum_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  City = 'city',
  /** column name */
  Email = 'email',
  /** column name */
  EmailVerified = 'emailVerified',
  /** column name */
  EventsCreated = 'events_created',
  /** column name */
  Id = 'id',
  /** column name */
  Image = 'image',
  /** column name */
  IsVerifiedContributor = 'is_verified_contributor',
  /** column name */
  LastActivityAt = 'last_activity_at',
  /** column name */
  Level = 'level',
  /** column name */
  Name = 'name',
  /** column name */
  Points = 'points',
  /** column name */
  ReviewsCreated = 'reviews_created',
  /** column name */
  Role = 'role',
  /** column name */
  Status = 'status',
  /** column name */
  ThankYouCount = 'thank_you_count',
  /** column name */
  VenuesCreated = 'venues_created'
}

export type Users_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Users_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Users_Set_Input>;
  /** filter the rows which have to be updated */
  where: Users_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Users_Var_Pop_Fields = {
  __typename?: 'users_var_pop_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "users" */
export type Users_Var_Pop_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Users_Var_Samp_Fields = {
  __typename?: 'users_var_samp_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "users" */
export type Users_Var_Samp_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Users_Variance_Fields = {
  __typename?: 'users_variance_fields';
  events_created?: Maybe<Scalars['Float']['output']>;
  level?: Maybe<Scalars['Float']['output']>;
  points?: Maybe<Scalars['Float']['output']>;
  reviews_created?: Maybe<Scalars['Float']['output']>;
  thank_you_count?: Maybe<Scalars['Float']['output']>;
  venues_created?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "users" */
export type Users_Variance_Order_By = {
  events_created?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

/** columns and relationships of "venue_accommodation_details" */
export type Venue_Accommodation_Details = {
  __typename?: 'venue_accommodation_details';
  amenities?: Maybe<Array<Scalars['String']['output']>>;
  bathrooms?: Maybe<Scalars['Int']['output']>;
  bedrooms?: Maybe<Scalars['Int']['output']>;
  check_in_time?: Maybe<Scalars['time']['output']>;
  check_out_time?: Maybe<Scalars['time']['output']>;
  max_guests?: Maybe<Scalars['Int']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  venue: Venues;
  venue_id: Scalars['uuid']['output'];
};

/** aggregated selection of "venue_accommodation_details" */
export type Venue_Accommodation_Details_Aggregate = {
  __typename?: 'venue_accommodation_details_aggregate';
  aggregate?: Maybe<Venue_Accommodation_Details_Aggregate_Fields>;
  nodes: Array<Venue_Accommodation_Details>;
};

export type Venue_Accommodation_Details_Aggregate_Bool_Exp = {
  count?: InputMaybe<Venue_Accommodation_Details_Aggregate_Bool_Exp_Count>;
};

export type Venue_Accommodation_Details_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venue_accommodation_details" */
export type Venue_Accommodation_Details_Aggregate_Fields = {
  __typename?: 'venue_accommodation_details_aggregate_fields';
  avg?: Maybe<Venue_Accommodation_Details_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Accommodation_Details_Max_Fields>;
  min?: Maybe<Venue_Accommodation_Details_Min_Fields>;
  stddev?: Maybe<Venue_Accommodation_Details_Stddev_Fields>;
  stddev_pop?: Maybe<Venue_Accommodation_Details_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Venue_Accommodation_Details_Stddev_Samp_Fields>;
  sum?: Maybe<Venue_Accommodation_Details_Sum_Fields>;
  var_pop?: Maybe<Venue_Accommodation_Details_Var_Pop_Fields>;
  var_samp?: Maybe<Venue_Accommodation_Details_Var_Samp_Fields>;
  variance?: Maybe<Venue_Accommodation_Details_Variance_Fields>;
};


/** aggregate fields of "venue_accommodation_details" */
export type Venue_Accommodation_Details_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Aggregate_Order_By = {
  avg?: InputMaybe<Venue_Accommodation_Details_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venue_Accommodation_Details_Max_Order_By>;
  min?: InputMaybe<Venue_Accommodation_Details_Min_Order_By>;
  stddev?: InputMaybe<Venue_Accommodation_Details_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Venue_Accommodation_Details_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Venue_Accommodation_Details_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Venue_Accommodation_Details_Sum_Order_By>;
  var_pop?: InputMaybe<Venue_Accommodation_Details_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Venue_Accommodation_Details_Var_Samp_Order_By>;
  variance?: InputMaybe<Venue_Accommodation_Details_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Arr_Rel_Insert_Input = {
  data: Array<Venue_Accommodation_Details_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Accommodation_Details_On_Conflict>;
};

/** aggregate avg on columns */
export type Venue_Accommodation_Details_Avg_Fields = {
  __typename?: 'venue_accommodation_details_avg_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Avg_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "venue_accommodation_details". All fields are combined with a logical 'AND'. */
export type Venue_Accommodation_Details_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Accommodation_Details_Bool_Exp>>;
  _not?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Accommodation_Details_Bool_Exp>>;
  amenities?: InputMaybe<String_Array_Comparison_Exp>;
  bathrooms?: InputMaybe<Int_Comparison_Exp>;
  bedrooms?: InputMaybe<Int_Comparison_Exp>;
  check_in_time?: InputMaybe<Time_Comparison_Exp>;
  check_out_time?: InputMaybe<Time_Comparison_Exp>;
  max_guests?: InputMaybe<Int_Comparison_Exp>;
  minimum_stay_nights?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue_accommodation_details" */
export enum Venue_Accommodation_Details_Constraint {
  /** unique or primary key constraint on columns "venue_id" */
  VenueAccommodationDetailsPkey = 'venue_accommodation_details_pkey'
}

/** input type for incrementing numeric columns in table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Inc_Input = {
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  max_guests?: InputMaybe<Scalars['Int']['input']>;
  minimum_stay_nights?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Insert_Input = {
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  check_in_time?: InputMaybe<Scalars['time']['input']>;
  check_out_time?: InputMaybe<Scalars['time']['input']>;
  max_guests?: InputMaybe<Scalars['Int']['input']>;
  minimum_stay_nights?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Venue_Accommodation_Details_Max_Fields = {
  __typename?: 'venue_accommodation_details_max_fields';
  amenities?: Maybe<Array<Scalars['String']['output']>>;
  bathrooms?: Maybe<Scalars['Int']['output']>;
  bedrooms?: Maybe<Scalars['Int']['output']>;
  max_guests?: Maybe<Scalars['Int']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Max_Order_By = {
  amenities?: InputMaybe<Order_By>;
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venue_Accommodation_Details_Min_Fields = {
  __typename?: 'venue_accommodation_details_min_fields';
  amenities?: Maybe<Array<Scalars['String']['output']>>;
  bathrooms?: Maybe<Scalars['Int']['output']>;
  bedrooms?: Maybe<Scalars['Int']['output']>;
  max_guests?: Maybe<Scalars['Int']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Min_Order_By = {
  amenities?: InputMaybe<Order_By>;
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Mutation_Response = {
  __typename?: 'venue_accommodation_details_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Accommodation_Details>;
};

/** input type for inserting object relation for remote table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Obj_Rel_Insert_Input = {
  data: Venue_Accommodation_Details_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Accommodation_Details_On_Conflict>;
};

/** on_conflict condition type for table "venue_accommodation_details" */
export type Venue_Accommodation_Details_On_Conflict = {
  constraint: Venue_Accommodation_Details_Constraint;
  update_columns?: Array<Venue_Accommodation_Details_Update_Column>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_accommodation_details". */
export type Venue_Accommodation_Details_Order_By = {
  amenities?: InputMaybe<Order_By>;
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  check_in_time?: InputMaybe<Order_By>;
  check_out_time?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue_accommodation_details */
export type Venue_Accommodation_Details_Pk_Columns_Input = {
  venue_id: Scalars['uuid']['input'];
};

/** select columns of table "venue_accommodation_details" */
export enum Venue_Accommodation_Details_Select_Column {
  /** column name */
  Amenities = 'amenities',
  /** column name */
  Bathrooms = 'bathrooms',
  /** column name */
  Bedrooms = 'bedrooms',
  /** column name */
  CheckInTime = 'check_in_time',
  /** column name */
  CheckOutTime = 'check_out_time',
  /** column name */
  MaxGuests = 'max_guests',
  /** column name */
  MinimumStayNights = 'minimum_stay_nights',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

/** input type for updating data in table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Set_Input = {
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  check_in_time?: InputMaybe<Scalars['time']['input']>;
  check_out_time?: InputMaybe<Scalars['time']['input']>;
  max_guests?: InputMaybe<Scalars['Int']['input']>;
  minimum_stay_nights?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Venue_Accommodation_Details_Stddev_Fields = {
  __typename?: 'venue_accommodation_details_stddev_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Stddev_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Venue_Accommodation_Details_Stddev_Pop_Fields = {
  __typename?: 'venue_accommodation_details_stddev_pop_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Stddev_Pop_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Venue_Accommodation_Details_Stddev_Samp_Fields = {
  __typename?: 'venue_accommodation_details_stddev_samp_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Stddev_Samp_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Accommodation_Details_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Accommodation_Details_Stream_Cursor_Value_Input = {
  amenities?: InputMaybe<Array<Scalars['String']['input']>>;
  bathrooms?: InputMaybe<Scalars['Int']['input']>;
  bedrooms?: InputMaybe<Scalars['Int']['input']>;
  check_in_time?: InputMaybe<Scalars['time']['input']>;
  check_out_time?: InputMaybe<Scalars['time']['input']>;
  max_guests?: InputMaybe<Scalars['Int']['input']>;
  minimum_stay_nights?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Venue_Accommodation_Details_Sum_Fields = {
  __typename?: 'venue_accommodation_details_sum_fields';
  bathrooms?: Maybe<Scalars['Int']['output']>;
  bedrooms?: Maybe<Scalars['Int']['output']>;
  max_guests?: Maybe<Scalars['Int']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Sum_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** update columns of table "venue_accommodation_details" */
export enum Venue_Accommodation_Details_Update_Column {
  /** column name */
  Amenities = 'amenities',
  /** column name */
  Bathrooms = 'bathrooms',
  /** column name */
  Bedrooms = 'bedrooms',
  /** column name */
  CheckInTime = 'check_in_time',
  /** column name */
  CheckOutTime = 'check_out_time',
  /** column name */
  MaxGuests = 'max_guests',
  /** column name */
  MinimumStayNights = 'minimum_stay_nights',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

export type Venue_Accommodation_Details_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Venue_Accommodation_Details_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Accommodation_Details_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Accommodation_Details_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Venue_Accommodation_Details_Var_Pop_Fields = {
  __typename?: 'venue_accommodation_details_var_pop_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Var_Pop_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Venue_Accommodation_Details_Var_Samp_Fields = {
  __typename?: 'venue_accommodation_details_var_samp_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Var_Samp_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Venue_Accommodation_Details_Variance_Fields = {
  __typename?: 'venue_accommodation_details_variance_fields';
  bathrooms?: Maybe<Scalars['Float']['output']>;
  bedrooms?: Maybe<Scalars['Float']['output']>;
  max_guests?: Maybe<Scalars['Float']['output']>;
  minimum_stay_nights?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "venue_accommodation_details" */
export type Venue_Accommodation_Details_Variance_Order_By = {
  bathrooms?: InputMaybe<Order_By>;
  bedrooms?: InputMaybe<Order_By>;
  max_guests?: InputMaybe<Order_By>;
  minimum_stay_nights?: InputMaybe<Order_By>;
};

/** columns and relationships of "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details = {
  __typename?: 'venue_beauty_salon_details';
  appointment_required?: Maybe<Scalars['Boolean']['output']>;
  services?: Maybe<Array<Scalars['String']['output']>>;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  venue: Venues;
  venue_id: Scalars['uuid']['output'];
  walk_ins_accepted?: Maybe<Scalars['Boolean']['output']>;
};

/** aggregated selection of "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Aggregate = {
  __typename?: 'venue_beauty_salon_details_aggregate';
  aggregate?: Maybe<Venue_Beauty_Salon_Details_Aggregate_Fields>;
  nodes: Array<Venue_Beauty_Salon_Details>;
};

export type Venue_Beauty_Salon_Details_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Count>;
};

export type Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_And = {
  arguments: Venue_Beauty_Salon_Details_Select_Column_Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Venue_Beauty_Salon_Details_Select_Column_Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Aggregate_Fields = {
  __typename?: 'venue_beauty_salon_details_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Beauty_Salon_Details_Max_Fields>;
  min?: Maybe<Venue_Beauty_Salon_Details_Min_Fields>;
};


/** aggregate fields of "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venue_Beauty_Salon_Details_Max_Order_By>;
  min?: InputMaybe<Venue_Beauty_Salon_Details_Min_Order_By>;
};

/** input type for inserting array relation for remote table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Arr_Rel_Insert_Input = {
  data: Array<Venue_Beauty_Salon_Details_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Beauty_Salon_Details_On_Conflict>;
};

/** Boolean expression to filter rows from the table "venue_beauty_salon_details". All fields are combined with a logical 'AND'. */
export type Venue_Beauty_Salon_Details_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Beauty_Salon_Details_Bool_Exp>>;
  _not?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Beauty_Salon_Details_Bool_Exp>>;
  appointment_required?: InputMaybe<Boolean_Comparison_Exp>;
  services?: InputMaybe<String_Array_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
  walk_ins_accepted?: InputMaybe<Boolean_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue_beauty_salon_details" */
export enum Venue_Beauty_Salon_Details_Constraint {
  /** unique or primary key constraint on columns "venue_id" */
  VenueBeautySalonDetailsPkey = 'venue_beauty_salon_details_pkey'
}

/** input type for inserting data into table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Insert_Input = {
  appointment_required?: InputMaybe<Scalars['Boolean']['input']>;
  services?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
  walk_ins_accepted?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate max on columns */
export type Venue_Beauty_Salon_Details_Max_Fields = {
  __typename?: 'venue_beauty_salon_details_max_fields';
  services?: Maybe<Array<Scalars['String']['output']>>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Max_Order_By = {
  services?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venue_Beauty_Salon_Details_Min_Fields = {
  __typename?: 'venue_beauty_salon_details_min_fields';
  services?: Maybe<Array<Scalars['String']['output']>>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Min_Order_By = {
  services?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Mutation_Response = {
  __typename?: 'venue_beauty_salon_details_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Beauty_Salon_Details>;
};

/** input type for inserting object relation for remote table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Obj_Rel_Insert_Input = {
  data: Venue_Beauty_Salon_Details_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Beauty_Salon_Details_On_Conflict>;
};

/** on_conflict condition type for table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_On_Conflict = {
  constraint: Venue_Beauty_Salon_Details_Constraint;
  update_columns?: Array<Venue_Beauty_Salon_Details_Update_Column>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_beauty_salon_details". */
export type Venue_Beauty_Salon_Details_Order_By = {
  appointment_required?: InputMaybe<Order_By>;
  services?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
  walk_ins_accepted?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue_beauty_salon_details */
export type Venue_Beauty_Salon_Details_Pk_Columns_Input = {
  venue_id: Scalars['uuid']['input'];
};

/** select columns of table "venue_beauty_salon_details" */
export enum Venue_Beauty_Salon_Details_Select_Column {
  /** column name */
  AppointmentRequired = 'appointment_required',
  /** column name */
  Services = 'services',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id',
  /** column name */
  WalkInsAccepted = 'walk_ins_accepted'
}

/** select "venue_beauty_salon_details_aggregate_bool_exp_bool_and_arguments_columns" columns of table "venue_beauty_salon_details" */
export enum Venue_Beauty_Salon_Details_Select_Column_Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  AppointmentRequired = 'appointment_required',
  /** column name */
  WalkInsAccepted = 'walk_ins_accepted'
}

/** select "venue_beauty_salon_details_aggregate_bool_exp_bool_or_arguments_columns" columns of table "venue_beauty_salon_details" */
export enum Venue_Beauty_Salon_Details_Select_Column_Venue_Beauty_Salon_Details_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  AppointmentRequired = 'appointment_required',
  /** column name */
  WalkInsAccepted = 'walk_ins_accepted'
}

/** input type for updating data in table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Set_Input = {
  appointment_required?: InputMaybe<Scalars['Boolean']['input']>;
  services?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
  walk_ins_accepted?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Streaming cursor of the table "venue_beauty_salon_details" */
export type Venue_Beauty_Salon_Details_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Beauty_Salon_Details_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Beauty_Salon_Details_Stream_Cursor_Value_Input = {
  appointment_required?: InputMaybe<Scalars['Boolean']['input']>;
  services?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
  walk_ins_accepted?: InputMaybe<Scalars['Boolean']['input']>;
};

/** update columns of table "venue_beauty_salon_details" */
export enum Venue_Beauty_Salon_Details_Update_Column {
  /** column name */
  AppointmentRequired = 'appointment_required',
  /** column name */
  Services = 'services',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id',
  /** column name */
  WalkInsAccepted = 'walk_ins_accepted'
}

export type Venue_Beauty_Salon_Details_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Beauty_Salon_Details_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Beauty_Salon_Details_Bool_Exp;
};

/** columns and relationships of "venue_category" */
export type Venue_Category = {
  __typename?: 'venue_category';
  value: Scalars['String']['output'];
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
};


/** columns and relationships of "venue_category" */
export type Venue_CategoryVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


/** columns and relationships of "venue_category" */
export type Venue_CategoryVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** aggregated selection of "venue_category" */
export type Venue_Category_Aggregate = {
  __typename?: 'venue_category_aggregate';
  aggregate?: Maybe<Venue_Category_Aggregate_Fields>;
  nodes: Array<Venue_Category>;
};

/** aggregate fields of "venue_category" */
export type Venue_Category_Aggregate_Fields = {
  __typename?: 'venue_category_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Category_Max_Fields>;
  min?: Maybe<Venue_Category_Min_Fields>;
};


/** aggregate fields of "venue_category" */
export type Venue_Category_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Category_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "venue_category". All fields are combined with a logical 'AND'. */
export type Venue_Category_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Category_Bool_Exp>>;
  _not?: InputMaybe<Venue_Category_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Category_Bool_Exp>>;
  value?: InputMaybe<String_Comparison_Exp>;
  venues?: InputMaybe<Venues_Bool_Exp>;
  venues_aggregate?: InputMaybe<Venues_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "venue_category" */
export enum Venue_Category_Constraint {
  /** unique or primary key constraint on columns "value" */
  VenueCategoryPkey = 'venue_category_pkey'
}

export enum Venue_Category_Enum {
  Accommodation = 'ACCOMMODATION',
  BeautySalon = 'BEAUTY_SALON',
  Cafe = 'CAFE',
  Catering = 'CATERING',
  Church = 'CHURCH',
  Club = 'CLUB',
  CulturalCentre = 'CULTURAL_CENTRE',
  Delivery = 'DELIVERY',
  GroceryStore = 'GROCERY_STORE',
  LegalService = 'LEGAL_SERVICE',
  Library = 'LIBRARY',
  Medical = 'MEDICAL',
  Organization = 'ORGANIZATION',
  Restaurant = 'RESTAURANT',
  School = 'SCHOOL',
  Shop = 'SHOP'
}

/** Boolean expression to compare columns of type "venue_category_enum". All fields are combined with logical 'AND'. */
export type Venue_Category_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Venue_Category_Enum>;
  _in?: InputMaybe<Array<Venue_Category_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Venue_Category_Enum>;
  _nin?: InputMaybe<Array<Venue_Category_Enum>>;
};

/** input type for inserting data into table "venue_category" */
export type Venue_Category_Insert_Input = {
  value?: InputMaybe<Scalars['String']['input']>;
  venues?: InputMaybe<Venues_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Venue_Category_Max_Fields = {
  __typename?: 'venue_category_max_fields';
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Venue_Category_Min_Fields = {
  __typename?: 'venue_category_min_fields';
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "venue_category" */
export type Venue_Category_Mutation_Response = {
  __typename?: 'venue_category_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Category>;
};

/** input type for inserting object relation for remote table "venue_category" */
export type Venue_Category_Obj_Rel_Insert_Input = {
  data: Venue_Category_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Category_On_Conflict>;
};

/** on_conflict condition type for table "venue_category" */
export type Venue_Category_On_Conflict = {
  constraint: Venue_Category_Constraint;
  update_columns?: Array<Venue_Category_Update_Column>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_category". */
export type Venue_Category_Order_By = {
  value?: InputMaybe<Order_By>;
  venues_aggregate?: InputMaybe<Venues_Aggregate_Order_By>;
};

/** primary key columns input for table: venue_category */
export type Venue_Category_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "venue_category" */
export enum Venue_Category_Select_Column {
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "venue_category" */
export type Venue_Category_Set_Input = {
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "venue_category" */
export type Venue_Category_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Category_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Category_Stream_Cursor_Value_Input = {
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "venue_category" */
export enum Venue_Category_Update_Column {
  /** column name */
  Value = 'value'
}

export type Venue_Category_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Category_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Category_Bool_Exp;
};

/** columns and relationships of "venue_restaurant_details" */
export type Venue_Restaurant_Details = {
  __typename?: 'venue_restaurant_details';
  cuisine_types?: Maybe<Array<Scalars['String']['output']>>;
  features?: Maybe<Array<Scalars['String']['output']>>;
  price_range?: Maybe<Scalars['String']['output']>;
  seating_capacity?: Maybe<Scalars['Int']['output']>;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  venue: Venues;
  venue_id: Scalars['uuid']['output'];
};

/** aggregated selection of "venue_restaurant_details" */
export type Venue_Restaurant_Details_Aggregate = {
  __typename?: 'venue_restaurant_details_aggregate';
  aggregate?: Maybe<Venue_Restaurant_Details_Aggregate_Fields>;
  nodes: Array<Venue_Restaurant_Details>;
};

export type Venue_Restaurant_Details_Aggregate_Bool_Exp = {
  count?: InputMaybe<Venue_Restaurant_Details_Aggregate_Bool_Exp_Count>;
};

export type Venue_Restaurant_Details_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venue_restaurant_details" */
export type Venue_Restaurant_Details_Aggregate_Fields = {
  __typename?: 'venue_restaurant_details_aggregate_fields';
  avg?: Maybe<Venue_Restaurant_Details_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Restaurant_Details_Max_Fields>;
  min?: Maybe<Venue_Restaurant_Details_Min_Fields>;
  stddev?: Maybe<Venue_Restaurant_Details_Stddev_Fields>;
  stddev_pop?: Maybe<Venue_Restaurant_Details_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Venue_Restaurant_Details_Stddev_Samp_Fields>;
  sum?: Maybe<Venue_Restaurant_Details_Sum_Fields>;
  var_pop?: Maybe<Venue_Restaurant_Details_Var_Pop_Fields>;
  var_samp?: Maybe<Venue_Restaurant_Details_Var_Samp_Fields>;
  variance?: Maybe<Venue_Restaurant_Details_Variance_Fields>;
};


/** aggregate fields of "venue_restaurant_details" */
export type Venue_Restaurant_Details_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Aggregate_Order_By = {
  avg?: InputMaybe<Venue_Restaurant_Details_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venue_Restaurant_Details_Max_Order_By>;
  min?: InputMaybe<Venue_Restaurant_Details_Min_Order_By>;
  stddev?: InputMaybe<Venue_Restaurant_Details_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Venue_Restaurant_Details_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Venue_Restaurant_Details_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Venue_Restaurant_Details_Sum_Order_By>;
  var_pop?: InputMaybe<Venue_Restaurant_Details_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Venue_Restaurant_Details_Var_Samp_Order_By>;
  variance?: InputMaybe<Venue_Restaurant_Details_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Arr_Rel_Insert_Input = {
  data: Array<Venue_Restaurant_Details_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Restaurant_Details_On_Conflict>;
};

/** aggregate avg on columns */
export type Venue_Restaurant_Details_Avg_Fields = {
  __typename?: 'venue_restaurant_details_avg_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Avg_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "venue_restaurant_details". All fields are combined with a logical 'AND'. */
export type Venue_Restaurant_Details_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Restaurant_Details_Bool_Exp>>;
  _not?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Restaurant_Details_Bool_Exp>>;
  cuisine_types?: InputMaybe<String_Array_Comparison_Exp>;
  features?: InputMaybe<String_Array_Comparison_Exp>;
  price_range?: InputMaybe<String_Comparison_Exp>;
  seating_capacity?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue_restaurant_details" */
export enum Venue_Restaurant_Details_Constraint {
  /** unique or primary key constraint on columns "venue_id" */
  VenueRestaurantDetailsPkey = 'venue_restaurant_details_pkey'
}

/** input type for incrementing numeric columns in table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Inc_Input = {
  seating_capacity?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Insert_Input = {
  cuisine_types?: InputMaybe<Array<Scalars['String']['input']>>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  price_range?: InputMaybe<Scalars['String']['input']>;
  seating_capacity?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Venue_Restaurant_Details_Max_Fields = {
  __typename?: 'venue_restaurant_details_max_fields';
  cuisine_types?: Maybe<Array<Scalars['String']['output']>>;
  features?: Maybe<Array<Scalars['String']['output']>>;
  price_range?: Maybe<Scalars['String']['output']>;
  seating_capacity?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Max_Order_By = {
  cuisine_types?: InputMaybe<Order_By>;
  features?: InputMaybe<Order_By>;
  price_range?: InputMaybe<Order_By>;
  seating_capacity?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venue_Restaurant_Details_Min_Fields = {
  __typename?: 'venue_restaurant_details_min_fields';
  cuisine_types?: Maybe<Array<Scalars['String']['output']>>;
  features?: Maybe<Array<Scalars['String']['output']>>;
  price_range?: Maybe<Scalars['String']['output']>;
  seating_capacity?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Min_Order_By = {
  cuisine_types?: InputMaybe<Order_By>;
  features?: InputMaybe<Order_By>;
  price_range?: InputMaybe<Order_By>;
  seating_capacity?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Mutation_Response = {
  __typename?: 'venue_restaurant_details_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Restaurant_Details>;
};

/** input type for inserting object relation for remote table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Obj_Rel_Insert_Input = {
  data: Venue_Restaurant_Details_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Restaurant_Details_On_Conflict>;
};

/** on_conflict condition type for table "venue_restaurant_details" */
export type Venue_Restaurant_Details_On_Conflict = {
  constraint: Venue_Restaurant_Details_Constraint;
  update_columns?: Array<Venue_Restaurant_Details_Update_Column>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_restaurant_details". */
export type Venue_Restaurant_Details_Order_By = {
  cuisine_types?: InputMaybe<Order_By>;
  features?: InputMaybe<Order_By>;
  price_range?: InputMaybe<Order_By>;
  seating_capacity?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue_restaurant_details */
export type Venue_Restaurant_Details_Pk_Columns_Input = {
  venue_id: Scalars['uuid']['input'];
};

/** select columns of table "venue_restaurant_details" */
export enum Venue_Restaurant_Details_Select_Column {
  /** column name */
  CuisineTypes = 'cuisine_types',
  /** column name */
  Features = 'features',
  /** column name */
  PriceRange = 'price_range',
  /** column name */
  SeatingCapacity = 'seating_capacity',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

/** input type for updating data in table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Set_Input = {
  cuisine_types?: InputMaybe<Array<Scalars['String']['input']>>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  price_range?: InputMaybe<Scalars['String']['input']>;
  seating_capacity?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Venue_Restaurant_Details_Stddev_Fields = {
  __typename?: 'venue_restaurant_details_stddev_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Stddev_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Venue_Restaurant_Details_Stddev_Pop_Fields = {
  __typename?: 'venue_restaurant_details_stddev_pop_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Stddev_Pop_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Venue_Restaurant_Details_Stddev_Samp_Fields = {
  __typename?: 'venue_restaurant_details_stddev_samp_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Stddev_Samp_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Restaurant_Details_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Restaurant_Details_Stream_Cursor_Value_Input = {
  cuisine_types?: InputMaybe<Array<Scalars['String']['input']>>;
  features?: InputMaybe<Array<Scalars['String']['input']>>;
  price_range?: InputMaybe<Scalars['String']['input']>;
  seating_capacity?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Venue_Restaurant_Details_Sum_Fields = {
  __typename?: 'venue_restaurant_details_sum_fields';
  seating_capacity?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Sum_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** update columns of table "venue_restaurant_details" */
export enum Venue_Restaurant_Details_Update_Column {
  /** column name */
  CuisineTypes = 'cuisine_types',
  /** column name */
  Features = 'features',
  /** column name */
  PriceRange = 'price_range',
  /** column name */
  SeatingCapacity = 'seating_capacity',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

export type Venue_Restaurant_Details_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Venue_Restaurant_Details_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Restaurant_Details_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Restaurant_Details_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Venue_Restaurant_Details_Var_Pop_Fields = {
  __typename?: 'venue_restaurant_details_var_pop_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Var_Pop_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Venue_Restaurant_Details_Var_Samp_Fields = {
  __typename?: 'venue_restaurant_details_var_samp_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Var_Samp_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Venue_Restaurant_Details_Variance_Fields = {
  __typename?: 'venue_restaurant_details_variance_fields';
  seating_capacity?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "venue_restaurant_details" */
export type Venue_Restaurant_Details_Variance_Order_By = {
  seating_capacity?: InputMaybe<Order_By>;
};

/** columns and relationships of "venue_schedule" */
export type Venue_Schedule = {
  __typename?: 'venue_schedule';
  close_time: Scalars['time']['output'];
  day_of_week: Scalars['String']['output'];
  id: Scalars['uuid']['output'];
  open_time: Scalars['time']['output'];
  updated_at: Scalars['timestamp']['output'];
  /** An object relationship */
  venue: Venues;
  venue_id: Scalars['uuid']['output'];
};

/** aggregated selection of "venue_schedule" */
export type Venue_Schedule_Aggregate = {
  __typename?: 'venue_schedule_aggregate';
  aggregate?: Maybe<Venue_Schedule_Aggregate_Fields>;
  nodes: Array<Venue_Schedule>;
};

export type Venue_Schedule_Aggregate_Bool_Exp = {
  count?: InputMaybe<Venue_Schedule_Aggregate_Bool_Exp_Count>;
};

export type Venue_Schedule_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Schedule_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venue_schedule" */
export type Venue_Schedule_Aggregate_Fields = {
  __typename?: 'venue_schedule_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Schedule_Max_Fields>;
  min?: Maybe<Venue_Schedule_Min_Fields>;
};


/** aggregate fields of "venue_schedule" */
export type Venue_Schedule_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venue_schedule" */
export type Venue_Schedule_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venue_Schedule_Max_Order_By>;
  min?: InputMaybe<Venue_Schedule_Min_Order_By>;
};

/** input type for inserting array relation for remote table "venue_schedule" */
export type Venue_Schedule_Arr_Rel_Insert_Input = {
  data: Array<Venue_Schedule_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Schedule_On_Conflict>;
};

/** Boolean expression to filter rows from the table "venue_schedule". All fields are combined with a logical 'AND'. */
export type Venue_Schedule_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Schedule_Bool_Exp>>;
  _not?: InputMaybe<Venue_Schedule_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Schedule_Bool_Exp>>;
  close_time?: InputMaybe<Time_Comparison_Exp>;
  day_of_week?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  open_time?: InputMaybe<Time_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue_schedule" */
export enum Venue_Schedule_Constraint {
  /** unique or primary key constraint on columns "id" */
  VenueSchedulePkey = 'venue_schedule_pkey',
  /** unique or primary key constraint on columns "id", "venue_id", "day_of_week" */
  VenueScheduleVenueIdDayOfWeekKey = 'venue_schedule_venue_id_day_of_week_key'
}

/** input type for inserting data into table "venue_schedule" */
export type Venue_Schedule_Insert_Input = {
  close_time?: InputMaybe<Scalars['time']['input']>;
  day_of_week?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  open_time?: InputMaybe<Scalars['time']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Venue_Schedule_Max_Fields = {
  __typename?: 'venue_schedule_max_fields';
  day_of_week?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "venue_schedule" */
export type Venue_Schedule_Max_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venue_Schedule_Min_Fields = {
  __typename?: 'venue_schedule_min_fields';
  day_of_week?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "venue_schedule" */
export type Venue_Schedule_Min_Order_By = {
  day_of_week?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venue_schedule" */
export type Venue_Schedule_Mutation_Response = {
  __typename?: 'venue_schedule_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Schedule>;
};

/** on_conflict condition type for table "venue_schedule" */
export type Venue_Schedule_On_Conflict = {
  constraint: Venue_Schedule_Constraint;
  update_columns?: Array<Venue_Schedule_Update_Column>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_schedule". */
export type Venue_Schedule_Order_By = {
  close_time?: InputMaybe<Order_By>;
  day_of_week?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  open_time?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue_schedule */
export type Venue_Schedule_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "venue_schedule" */
export enum Venue_Schedule_Select_Column {
  /** column name */
  CloseTime = 'close_time',
  /** column name */
  DayOfWeek = 'day_of_week',
  /** column name */
  Id = 'id',
  /** column name */
  OpenTime = 'open_time',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

/** input type for updating data in table "venue_schedule" */
export type Venue_Schedule_Set_Input = {
  close_time?: InputMaybe<Scalars['time']['input']>;
  day_of_week?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  open_time?: InputMaybe<Scalars['time']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "venue_schedule" */
export type Venue_Schedule_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Schedule_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Schedule_Stream_Cursor_Value_Input = {
  close_time?: InputMaybe<Scalars['time']['input']>;
  day_of_week?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  open_time?: InputMaybe<Scalars['time']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "venue_schedule" */
export enum Venue_Schedule_Update_Column {
  /** column name */
  CloseTime = 'close_time',
  /** column name */
  DayOfWeek = 'day_of_week',
  /** column name */
  Id = 'id',
  /** column name */
  OpenTime = 'open_time',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

export type Venue_Schedule_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Schedule_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Schedule_Bool_Exp;
};

/** columns and relationships of "venue_school_details" */
export type Venue_School_Details = {
  __typename?: 'venue_school_details';
  age_groups?: Maybe<Array<Scalars['String']['output']>>;
  class_size_max?: Maybe<Scalars['Int']['output']>;
  languages_taught?: Maybe<Array<Scalars['String']['output']>>;
  online_classes_available?: Maybe<Scalars['Boolean']['output']>;
  subjects?: Maybe<Array<Scalars['String']['output']>>;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  venue: Venues;
  venue_id: Scalars['uuid']['output'];
};

/** aggregated selection of "venue_school_details" */
export type Venue_School_Details_Aggregate = {
  __typename?: 'venue_school_details_aggregate';
  aggregate?: Maybe<Venue_School_Details_Aggregate_Fields>;
  nodes: Array<Venue_School_Details>;
};

export type Venue_School_Details_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Venue_School_Details_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Venue_School_Details_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Venue_School_Details_Aggregate_Bool_Exp_Count>;
};

export type Venue_School_Details_Aggregate_Bool_Exp_Bool_And = {
  arguments: Venue_School_Details_Select_Column_Venue_School_Details_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_School_Details_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Venue_School_Details_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Venue_School_Details_Select_Column_Venue_School_Details_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_School_Details_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Venue_School_Details_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_School_Details_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venue_school_details" */
export type Venue_School_Details_Aggregate_Fields = {
  __typename?: 'venue_school_details_aggregate_fields';
  avg?: Maybe<Venue_School_Details_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_School_Details_Max_Fields>;
  min?: Maybe<Venue_School_Details_Min_Fields>;
  stddev?: Maybe<Venue_School_Details_Stddev_Fields>;
  stddev_pop?: Maybe<Venue_School_Details_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Venue_School_Details_Stddev_Samp_Fields>;
  sum?: Maybe<Venue_School_Details_Sum_Fields>;
  var_pop?: Maybe<Venue_School_Details_Var_Pop_Fields>;
  var_samp?: Maybe<Venue_School_Details_Var_Samp_Fields>;
  variance?: Maybe<Venue_School_Details_Variance_Fields>;
};


/** aggregate fields of "venue_school_details" */
export type Venue_School_Details_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venue_school_details" */
export type Venue_School_Details_Aggregate_Order_By = {
  avg?: InputMaybe<Venue_School_Details_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venue_School_Details_Max_Order_By>;
  min?: InputMaybe<Venue_School_Details_Min_Order_By>;
  stddev?: InputMaybe<Venue_School_Details_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Venue_School_Details_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Venue_School_Details_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Venue_School_Details_Sum_Order_By>;
  var_pop?: InputMaybe<Venue_School_Details_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Venue_School_Details_Var_Samp_Order_By>;
  variance?: InputMaybe<Venue_School_Details_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "venue_school_details" */
export type Venue_School_Details_Arr_Rel_Insert_Input = {
  data: Array<Venue_School_Details_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_School_Details_On_Conflict>;
};

/** aggregate avg on columns */
export type Venue_School_Details_Avg_Fields = {
  __typename?: 'venue_school_details_avg_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "venue_school_details" */
export type Venue_School_Details_Avg_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "venue_school_details". All fields are combined with a logical 'AND'. */
export type Venue_School_Details_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_School_Details_Bool_Exp>>;
  _not?: InputMaybe<Venue_School_Details_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_School_Details_Bool_Exp>>;
  age_groups?: InputMaybe<String_Array_Comparison_Exp>;
  class_size_max?: InputMaybe<Int_Comparison_Exp>;
  languages_taught?: InputMaybe<String_Array_Comparison_Exp>;
  online_classes_available?: InputMaybe<Boolean_Comparison_Exp>;
  subjects?: InputMaybe<String_Array_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue_school_details" */
export enum Venue_School_Details_Constraint {
  /** unique or primary key constraint on columns "venue_id" */
  VenueSchoolDetailsPkey = 'venue_school_details_pkey'
}

/** input type for incrementing numeric columns in table "venue_school_details" */
export type Venue_School_Details_Inc_Input = {
  class_size_max?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "venue_school_details" */
export type Venue_School_Details_Insert_Input = {
  age_groups?: InputMaybe<Array<Scalars['String']['input']>>;
  class_size_max?: InputMaybe<Scalars['Int']['input']>;
  languages_taught?: InputMaybe<Array<Scalars['String']['input']>>;
  online_classes_available?: InputMaybe<Scalars['Boolean']['input']>;
  subjects?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Venue_School_Details_Max_Fields = {
  __typename?: 'venue_school_details_max_fields';
  age_groups?: Maybe<Array<Scalars['String']['output']>>;
  class_size_max?: Maybe<Scalars['Int']['output']>;
  languages_taught?: Maybe<Array<Scalars['String']['output']>>;
  subjects?: Maybe<Array<Scalars['String']['output']>>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "venue_school_details" */
export type Venue_School_Details_Max_Order_By = {
  age_groups?: InputMaybe<Order_By>;
  class_size_max?: InputMaybe<Order_By>;
  languages_taught?: InputMaybe<Order_By>;
  subjects?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venue_School_Details_Min_Fields = {
  __typename?: 'venue_school_details_min_fields';
  age_groups?: Maybe<Array<Scalars['String']['output']>>;
  class_size_max?: Maybe<Scalars['Int']['output']>;
  languages_taught?: Maybe<Array<Scalars['String']['output']>>;
  subjects?: Maybe<Array<Scalars['String']['output']>>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "venue_school_details" */
export type Venue_School_Details_Min_Order_By = {
  age_groups?: InputMaybe<Order_By>;
  class_size_max?: InputMaybe<Order_By>;
  languages_taught?: InputMaybe<Order_By>;
  subjects?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venue_school_details" */
export type Venue_School_Details_Mutation_Response = {
  __typename?: 'venue_school_details_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_School_Details>;
};

/** input type for inserting object relation for remote table "venue_school_details" */
export type Venue_School_Details_Obj_Rel_Insert_Input = {
  data: Venue_School_Details_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_School_Details_On_Conflict>;
};

/** on_conflict condition type for table "venue_school_details" */
export type Venue_School_Details_On_Conflict = {
  constraint: Venue_School_Details_Constraint;
  update_columns?: Array<Venue_School_Details_Update_Column>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_school_details". */
export type Venue_School_Details_Order_By = {
  age_groups?: InputMaybe<Order_By>;
  class_size_max?: InputMaybe<Order_By>;
  languages_taught?: InputMaybe<Order_By>;
  online_classes_available?: InputMaybe<Order_By>;
  subjects?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue_school_details */
export type Venue_School_Details_Pk_Columns_Input = {
  venue_id: Scalars['uuid']['input'];
};

/** select columns of table "venue_school_details" */
export enum Venue_School_Details_Select_Column {
  /** column name */
  AgeGroups = 'age_groups',
  /** column name */
  ClassSizeMax = 'class_size_max',
  /** column name */
  LanguagesTaught = 'languages_taught',
  /** column name */
  OnlineClassesAvailable = 'online_classes_available',
  /** column name */
  Subjects = 'subjects',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

/** select "venue_school_details_aggregate_bool_exp_bool_and_arguments_columns" columns of table "venue_school_details" */
export enum Venue_School_Details_Select_Column_Venue_School_Details_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  OnlineClassesAvailable = 'online_classes_available'
}

/** select "venue_school_details_aggregate_bool_exp_bool_or_arguments_columns" columns of table "venue_school_details" */
export enum Venue_School_Details_Select_Column_Venue_School_Details_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  OnlineClassesAvailable = 'online_classes_available'
}

/** input type for updating data in table "venue_school_details" */
export type Venue_School_Details_Set_Input = {
  age_groups?: InputMaybe<Array<Scalars['String']['input']>>;
  class_size_max?: InputMaybe<Scalars['Int']['input']>;
  languages_taught?: InputMaybe<Array<Scalars['String']['input']>>;
  online_classes_available?: InputMaybe<Scalars['Boolean']['input']>;
  subjects?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate stddev on columns */
export type Venue_School_Details_Stddev_Fields = {
  __typename?: 'venue_school_details_stddev_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "venue_school_details" */
export type Venue_School_Details_Stddev_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Venue_School_Details_Stddev_Pop_Fields = {
  __typename?: 'venue_school_details_stddev_pop_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "venue_school_details" */
export type Venue_School_Details_Stddev_Pop_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Venue_School_Details_Stddev_Samp_Fields = {
  __typename?: 'venue_school_details_stddev_samp_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "venue_school_details" */
export type Venue_School_Details_Stddev_Samp_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "venue_school_details" */
export type Venue_School_Details_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_School_Details_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_School_Details_Stream_Cursor_Value_Input = {
  age_groups?: InputMaybe<Array<Scalars['String']['input']>>;
  class_size_max?: InputMaybe<Scalars['Int']['input']>;
  languages_taught?: InputMaybe<Array<Scalars['String']['input']>>;
  online_classes_available?: InputMaybe<Scalars['Boolean']['input']>;
  subjects?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate sum on columns */
export type Venue_School_Details_Sum_Fields = {
  __typename?: 'venue_school_details_sum_fields';
  class_size_max?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "venue_school_details" */
export type Venue_School_Details_Sum_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** update columns of table "venue_school_details" */
export enum Venue_School_Details_Update_Column {
  /** column name */
  AgeGroups = 'age_groups',
  /** column name */
  ClassSizeMax = 'class_size_max',
  /** column name */
  LanguagesTaught = 'languages_taught',
  /** column name */
  OnlineClassesAvailable = 'online_classes_available',
  /** column name */
  Subjects = 'subjects',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

export type Venue_School_Details_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Venue_School_Details_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_School_Details_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_School_Details_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Venue_School_Details_Var_Pop_Fields = {
  __typename?: 'venue_school_details_var_pop_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "venue_school_details" */
export type Venue_School_Details_Var_Pop_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Venue_School_Details_Var_Samp_Fields = {
  __typename?: 'venue_school_details_var_samp_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "venue_school_details" */
export type Venue_School_Details_Var_Samp_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Venue_School_Details_Variance_Fields = {
  __typename?: 'venue_school_details_variance_fields';
  class_size_max?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "venue_school_details" */
export type Venue_School_Details_Variance_Order_By = {
  class_size_max?: InputMaybe<Order_By>;
};

/** columns and relationships of "venue_shop_details" */
export type Venue_Shop_Details = {
  __typename?: 'venue_shop_details';
  payment_methods?: Maybe<Array<Scalars['String']['output']>>;
  product_categories?: Maybe<Array<Scalars['String']['output']>>;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  venue: Venues;
  venue_id: Scalars['uuid']['output'];
};

/** aggregated selection of "venue_shop_details" */
export type Venue_Shop_Details_Aggregate = {
  __typename?: 'venue_shop_details_aggregate';
  aggregate?: Maybe<Venue_Shop_Details_Aggregate_Fields>;
  nodes: Array<Venue_Shop_Details>;
};

export type Venue_Shop_Details_Aggregate_Bool_Exp = {
  count?: InputMaybe<Venue_Shop_Details_Aggregate_Bool_Exp_Count>;
};

export type Venue_Shop_Details_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venue_shop_details" */
export type Venue_Shop_Details_Aggregate_Fields = {
  __typename?: 'venue_shop_details_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Shop_Details_Max_Fields>;
  min?: Maybe<Venue_Shop_Details_Min_Fields>;
};


/** aggregate fields of "venue_shop_details" */
export type Venue_Shop_Details_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venue_shop_details" */
export type Venue_Shop_Details_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venue_Shop_Details_Max_Order_By>;
  min?: InputMaybe<Venue_Shop_Details_Min_Order_By>;
};

/** input type for inserting array relation for remote table "venue_shop_details" */
export type Venue_Shop_Details_Arr_Rel_Insert_Input = {
  data: Array<Venue_Shop_Details_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Shop_Details_On_Conflict>;
};

/** Boolean expression to filter rows from the table "venue_shop_details". All fields are combined with a logical 'AND'. */
export type Venue_Shop_Details_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Shop_Details_Bool_Exp>>;
  _not?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Shop_Details_Bool_Exp>>;
  payment_methods?: InputMaybe<String_Array_Comparison_Exp>;
  product_categories?: InputMaybe<String_Array_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  venue?: InputMaybe<Venues_Bool_Exp>;
  venue_id?: InputMaybe<Uuid_Comparison_Exp>;
};

/** unique or primary key constraints on table "venue_shop_details" */
export enum Venue_Shop_Details_Constraint {
  /** unique or primary key constraint on columns "venue_id" */
  VenueShopDetailsPkey = 'venue_shop_details_pkey'
}

/** input type for inserting data into table "venue_shop_details" */
export type Venue_Shop_Details_Insert_Input = {
  payment_methods?: InputMaybe<Array<Scalars['String']['input']>>;
  product_categories?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue?: InputMaybe<Venues_Obj_Rel_Insert_Input>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** aggregate max on columns */
export type Venue_Shop_Details_Max_Fields = {
  __typename?: 'venue_shop_details_max_fields';
  payment_methods?: Maybe<Array<Scalars['String']['output']>>;
  product_categories?: Maybe<Array<Scalars['String']['output']>>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by max() on columns of table "venue_shop_details" */
export type Venue_Shop_Details_Max_Order_By = {
  payment_methods?: InputMaybe<Order_By>;
  product_categories?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venue_Shop_Details_Min_Fields = {
  __typename?: 'venue_shop_details_min_fields';
  payment_methods?: Maybe<Array<Scalars['String']['output']>>;
  product_categories?: Maybe<Array<Scalars['String']['output']>>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  venue_id?: Maybe<Scalars['uuid']['output']>;
};

/** order by min() on columns of table "venue_shop_details" */
export type Venue_Shop_Details_Min_Order_By = {
  payment_methods?: InputMaybe<Order_By>;
  product_categories?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venue_shop_details" */
export type Venue_Shop_Details_Mutation_Response = {
  __typename?: 'venue_shop_details_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Shop_Details>;
};

/** input type for inserting object relation for remote table "venue_shop_details" */
export type Venue_Shop_Details_Obj_Rel_Insert_Input = {
  data: Venue_Shop_Details_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Shop_Details_On_Conflict>;
};

/** on_conflict condition type for table "venue_shop_details" */
export type Venue_Shop_Details_On_Conflict = {
  constraint: Venue_Shop_Details_Constraint;
  update_columns?: Array<Venue_Shop_Details_Update_Column>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_shop_details". */
export type Venue_Shop_Details_Order_By = {
  payment_methods?: InputMaybe<Order_By>;
  product_categories?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  venue?: InputMaybe<Venues_Order_By>;
  venue_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venue_shop_details */
export type Venue_Shop_Details_Pk_Columns_Input = {
  venue_id: Scalars['uuid']['input'];
};

/** select columns of table "venue_shop_details" */
export enum Venue_Shop_Details_Select_Column {
  /** column name */
  PaymentMethods = 'payment_methods',
  /** column name */
  ProductCategories = 'product_categories',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

/** input type for updating data in table "venue_shop_details" */
export type Venue_Shop_Details_Set_Input = {
  payment_methods?: InputMaybe<Array<Scalars['String']['input']>>;
  product_categories?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** Streaming cursor of the table "venue_shop_details" */
export type Venue_Shop_Details_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Shop_Details_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Shop_Details_Stream_Cursor_Value_Input = {
  payment_methods?: InputMaybe<Array<Scalars['String']['input']>>;
  product_categories?: InputMaybe<Array<Scalars['String']['input']>>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  venue_id?: InputMaybe<Scalars['uuid']['input']>;
};

/** update columns of table "venue_shop_details" */
export enum Venue_Shop_Details_Update_Column {
  /** column name */
  PaymentMethods = 'payment_methods',
  /** column name */
  ProductCategories = 'product_categories',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  VenueId = 'venue_id'
}

export type Venue_Shop_Details_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Shop_Details_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Shop_Details_Bool_Exp;
};

/** columns and relationships of "venue_status" */
export type Venue_Status = {
  __typename?: 'venue_status';
  description?: Maybe<Scalars['String']['output']>;
  value: Scalars['String']['output'];
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
};


/** columns and relationships of "venue_status" */
export type Venue_StatusVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};


/** columns and relationships of "venue_status" */
export type Venue_StatusVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** aggregated selection of "venue_status" */
export type Venue_Status_Aggregate = {
  __typename?: 'venue_status_aggregate';
  aggregate?: Maybe<Venue_Status_Aggregate_Fields>;
  nodes: Array<Venue_Status>;
};

/** aggregate fields of "venue_status" */
export type Venue_Status_Aggregate_Fields = {
  __typename?: 'venue_status_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venue_Status_Max_Fields>;
  min?: Maybe<Venue_Status_Min_Fields>;
};


/** aggregate fields of "venue_status" */
export type Venue_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "venue_status". All fields are combined with a logical 'AND'. */
export type Venue_Status_Bool_Exp = {
  _and?: InputMaybe<Array<Venue_Status_Bool_Exp>>;
  _not?: InputMaybe<Venue_Status_Bool_Exp>;
  _or?: InputMaybe<Array<Venue_Status_Bool_Exp>>;
  description?: InputMaybe<String_Comparison_Exp>;
  value?: InputMaybe<String_Comparison_Exp>;
  venues?: InputMaybe<Venues_Bool_Exp>;
  venues_aggregate?: InputMaybe<Venues_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "venue_status" */
export enum Venue_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  VenueStatusPkey = 'venue_status_pkey'
}

export enum Venue_Status_Enum {
  /** Verified and visible to the public */
  Active = 'ACTIVE',
  /** No longer active but kept for reference */
  Archived = 'ARCHIVED',
  /** Temporarily hidden from public view */
  Hidden = 'HIDDEN',
  /** Submitted but not yet reviewed */
  Pending = 'PENDING',
  /** Rejected by moderator/admin */
  Rejected = 'REJECTED'
}

/** Boolean expression to compare columns of type "venue_status_enum". All fields are combined with logical 'AND'. */
export type Venue_Status_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Venue_Status_Enum>;
  _in?: InputMaybe<Array<Venue_Status_Enum>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Venue_Status_Enum>;
  _nin?: InputMaybe<Array<Venue_Status_Enum>>;
};

/** input type for inserting data into table "venue_status" */
export type Venue_Status_Insert_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
  venues?: InputMaybe<Venues_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Venue_Status_Max_Fields = {
  __typename?: 'venue_status_max_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Venue_Status_Min_Fields = {
  __typename?: 'venue_status_min_fields';
  description?: Maybe<Scalars['String']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "venue_status" */
export type Venue_Status_Mutation_Response = {
  __typename?: 'venue_status_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venue_Status>;
};

/** input type for inserting object relation for remote table "venue_status" */
export type Venue_Status_Obj_Rel_Insert_Input = {
  data: Venue_Status_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venue_Status_On_Conflict>;
};

/** on_conflict condition type for table "venue_status" */
export type Venue_Status_On_Conflict = {
  constraint: Venue_Status_Constraint;
  update_columns?: Array<Venue_Status_Update_Column>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};

/** Ordering options when selecting data from "venue_status". */
export type Venue_Status_Order_By = {
  description?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
  venues_aggregate?: InputMaybe<Venues_Aggregate_Order_By>;
};

/** primary key columns input for table: venue_status */
export type Venue_Status_Pk_Columns_Input = {
  value: Scalars['String']['input'];
};

/** select columns of table "venue_status" */
export enum Venue_Status_Select_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

/** input type for updating data in table "venue_status" */
export type Venue_Status_Set_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "venue_status" */
export type Venue_Status_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venue_Status_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venue_Status_Stream_Cursor_Value_Input = {
  description?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "venue_status" */
export enum Venue_Status_Update_Column {
  /** column name */
  Description = 'description',
  /** column name */
  Value = 'value'
}

export type Venue_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Status_Bool_Exp;
};

/** columns and relationships of "venues" */
export type Venues = {
  __typename?: 'venues';
  address?: Maybe<Scalars['String']['output']>;
  area?: Maybe<Scalars['String']['output']>;
  category: Venue_Category_Enum;
  /** An object relationship */
  chain?: Maybe<Chains>;
  chain_id?: Maybe<Scalars['uuid']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['timestamptz']['output'];
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Scalars['String']['output']>>;
  /** An array relationship */
  events: Array<Events>;
  /** An aggregate relationship */
  events_aggregate: Events_Aggregate;
  geo?: Maybe<Scalars['geography']['output']>;
  id: Scalars['uuid']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  /** An object relationship */
  owner?: Maybe<Users>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  phone_numbers?: Maybe<Array<Scalars['String']['output']>>;
  postcode?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  social_links: Scalars['json']['output'];
  status: Venue_Status_Enum;
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user?: Maybe<Users>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  /** An object relationship */
  venue_accommodation_detail?: Maybe<Venue_Accommodation_Details>;
  /** An array relationship */
  venue_accommodation_details: Array<Venue_Accommodation_Details>;
  /** An aggregate relationship */
  venue_accommodation_details_aggregate: Venue_Accommodation_Details_Aggregate;
  /** An object relationship */
  venue_beauty_salon_detail?: Maybe<Venue_Beauty_Salon_Details>;
  /** An array relationship */
  venue_beauty_salon_details: Array<Venue_Beauty_Salon_Details>;
  /** An aggregate relationship */
  venue_beauty_salon_details_aggregate: Venue_Beauty_Salon_Details_Aggregate;
  /** An object relationship */
  venue_category: Venue_Category;
  /** An object relationship */
  venue_restaurant_detail?: Maybe<Venue_Restaurant_Details>;
  /** An array relationship */
  venue_restaurant_details: Array<Venue_Restaurant_Details>;
  /** An aggregate relationship */
  venue_restaurant_details_aggregate: Venue_Restaurant_Details_Aggregate;
  /** An array relationship */
  venue_schedules: Array<Venue_Schedule>;
  /** An aggregate relationship */
  venue_schedules_aggregate: Venue_Schedule_Aggregate;
  /** An object relationship */
  venue_school_detail?: Maybe<Venue_School_Details>;
  /** An array relationship */
  venue_school_details: Array<Venue_School_Details>;
  /** An aggregate relationship */
  venue_school_details_aggregate: Venue_School_Details_Aggregate;
  /** An object relationship */
  venue_shop_detail?: Maybe<Venue_Shop_Details>;
  /** An array relationship */
  venue_shop_details: Array<Venue_Shop_Details>;
  /** An aggregate relationship */
  venue_shop_details_aggregate: Venue_Shop_Details_Aggregate;
  /** An object relationship */
  venue_status: Venue_Status;
  website?: Maybe<Scalars['String']['output']>;
};


/** columns and relationships of "venues" */
export type VenuesEventsArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesEvents_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Events_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By>>;
  where?: InputMaybe<Events_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesSocial_LinksArgs = {
  path?: InputMaybe<Scalars['String']['input']>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Accommodation_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Accommodation_Details_Order_By>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Accommodation_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Accommodation_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Accommodation_Details_Order_By>>;
  where?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Beauty_Salon_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Beauty_Salon_Details_Order_By>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Beauty_Salon_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Beauty_Salon_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Beauty_Salon_Details_Order_By>>;
  where?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Restaurant_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Restaurant_Details_Order_By>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Restaurant_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Restaurant_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Restaurant_Details_Order_By>>;
  where?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_SchedulesArgs = {
  distinct_on?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Schedule_Order_By>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Schedules_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Schedule_Order_By>>;
  where?: InputMaybe<Venue_Schedule_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_School_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_School_Details_Order_By>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_School_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_School_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_School_Details_Order_By>>;
  where?: InputMaybe<Venue_School_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Shop_DetailsArgs = {
  distinct_on?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Shop_Details_Order_By>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};


/** columns and relationships of "venues" */
export type VenuesVenue_Shop_Details_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Shop_Details_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venue_Shop_Details_Order_By>>;
  where?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
};

/** aggregated selection of "venues" */
export type Venues_Aggregate = {
  __typename?: 'venues_aggregate';
  aggregate?: Maybe<Venues_Aggregate_Fields>;
  nodes: Array<Venues>;
};

export type Venues_Aggregate_Bool_Exp = {
  count?: InputMaybe<Venues_Aggregate_Bool_Exp_Count>;
};

export type Venues_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venues_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Venues_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venues" */
export type Venues_Aggregate_Fields = {
  __typename?: 'venues_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Venues_Max_Fields>;
  min?: Maybe<Venues_Min_Fields>;
};


/** aggregate fields of "venues" */
export type Venues_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venues_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "venues" */
export type Venues_Aggregate_Order_By = {
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Venues_Max_Order_By>;
  min?: InputMaybe<Venues_Min_Order_By>;
};

/** input type for inserting array relation for remote table "venues" */
export type Venues_Arr_Rel_Insert_Input = {
  data: Array<Venues_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Venues_On_Conflict>;
};

/** Boolean expression to filter rows from the table "venues". All fields are combined with a logical 'AND'. */
export type Venues_Bool_Exp = {
  _and?: InputMaybe<Array<Venues_Bool_Exp>>;
  _not?: InputMaybe<Venues_Bool_Exp>;
  _or?: InputMaybe<Array<Venues_Bool_Exp>>;
  address?: InputMaybe<String_Comparison_Exp>;
  area?: InputMaybe<String_Comparison_Exp>;
  category?: InputMaybe<Venue_Category_Enum_Comparison_Exp>;
  chain?: InputMaybe<Chains_Bool_Exp>;
  chain_id?: InputMaybe<Uuid_Comparison_Exp>;
  city?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description_en?: InputMaybe<String_Comparison_Exp>;
  description_uk?: InputMaybe<String_Comparison_Exp>;
  emails?: InputMaybe<String_Array_Comparison_Exp>;
  events?: InputMaybe<Events_Bool_Exp>;
  events_aggregate?: InputMaybe<Events_Aggregate_Bool_Exp>;
  geo?: InputMaybe<Geography_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  images?: InputMaybe<String_Array_Comparison_Exp>;
  logo?: InputMaybe<String_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  owner?: InputMaybe<Users_Bool_Exp>;
  owner_id?: InputMaybe<Uuid_Comparison_Exp>;
  phone_numbers?: InputMaybe<String_Array_Comparison_Exp>;
  postcode?: InputMaybe<String_Comparison_Exp>;
  slug?: InputMaybe<String_Comparison_Exp>;
  social_links?: InputMaybe<Json_Comparison_Exp>;
  status?: InputMaybe<Venue_Status_Enum_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  user_id?: InputMaybe<Uuid_Comparison_Exp>;
  venue_accommodation_detail?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
  venue_accommodation_details?: InputMaybe<Venue_Accommodation_Details_Bool_Exp>;
  venue_accommodation_details_aggregate?: InputMaybe<Venue_Accommodation_Details_Aggregate_Bool_Exp>;
  venue_beauty_salon_detail?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
  venue_beauty_salon_details?: InputMaybe<Venue_Beauty_Salon_Details_Bool_Exp>;
  venue_beauty_salon_details_aggregate?: InputMaybe<Venue_Beauty_Salon_Details_Aggregate_Bool_Exp>;
  venue_category?: InputMaybe<Venue_Category_Bool_Exp>;
  venue_restaurant_detail?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
  venue_restaurant_details?: InputMaybe<Venue_Restaurant_Details_Bool_Exp>;
  venue_restaurant_details_aggregate?: InputMaybe<Venue_Restaurant_Details_Aggregate_Bool_Exp>;
  venue_schedules?: InputMaybe<Venue_Schedule_Bool_Exp>;
  venue_schedules_aggregate?: InputMaybe<Venue_Schedule_Aggregate_Bool_Exp>;
  venue_school_detail?: InputMaybe<Venue_School_Details_Bool_Exp>;
  venue_school_details?: InputMaybe<Venue_School_Details_Bool_Exp>;
  venue_school_details_aggregate?: InputMaybe<Venue_School_Details_Aggregate_Bool_Exp>;
  venue_shop_detail?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
  venue_shop_details?: InputMaybe<Venue_Shop_Details_Bool_Exp>;
  venue_shop_details_aggregate?: InputMaybe<Venue_Shop_Details_Aggregate_Bool_Exp>;
  venue_status?: InputMaybe<Venue_Status_Bool_Exp>;
  website?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "venues" */
export enum Venues_Constraint {
  /** unique or primary key constraint on columns "id" */
  VenuePkey = 'venue_pkey',
  /** unique or primary key constraint on columns "slug" */
  VenueSlugKey = 'venue_slug_key'
}

/** input type for inserting data into table "venues" */
export type Venues_Insert_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  area?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Venue_Category_Enum>;
  chain?: InputMaybe<Chains_Obj_Rel_Insert_Input>;
  chain_id?: InputMaybe<Scalars['uuid']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  events?: InputMaybe<Events_Arr_Rel_Insert_Input>;
  geo?: InputMaybe<Scalars['geography']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  phone_numbers?: InputMaybe<Array<Scalars['String']['input']>>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['json']['input']>;
  status?: InputMaybe<Venue_Status_Enum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  venue_accommodation_detail?: InputMaybe<Venue_Accommodation_Details_Obj_Rel_Insert_Input>;
  venue_accommodation_details?: InputMaybe<Venue_Accommodation_Details_Arr_Rel_Insert_Input>;
  venue_beauty_salon_detail?: InputMaybe<Venue_Beauty_Salon_Details_Obj_Rel_Insert_Input>;
  venue_beauty_salon_details?: InputMaybe<Venue_Beauty_Salon_Details_Arr_Rel_Insert_Input>;
  venue_category?: InputMaybe<Venue_Category_Obj_Rel_Insert_Input>;
  venue_restaurant_detail?: InputMaybe<Venue_Restaurant_Details_Obj_Rel_Insert_Input>;
  venue_restaurant_details?: InputMaybe<Venue_Restaurant_Details_Arr_Rel_Insert_Input>;
  venue_schedules?: InputMaybe<Venue_Schedule_Arr_Rel_Insert_Input>;
  venue_school_detail?: InputMaybe<Venue_School_Details_Obj_Rel_Insert_Input>;
  venue_school_details?: InputMaybe<Venue_School_Details_Arr_Rel_Insert_Input>;
  venue_shop_detail?: InputMaybe<Venue_Shop_Details_Obj_Rel_Insert_Input>;
  venue_shop_details?: InputMaybe<Venue_Shop_Details_Arr_Rel_Insert_Input>;
  venue_status?: InputMaybe<Venue_Status_Obj_Rel_Insert_Input>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Venues_Max_Fields = {
  __typename?: 'venues_max_fields';
  address?: Maybe<Scalars['String']['output']>;
  area?: Maybe<Scalars['String']['output']>;
  chain_id?: Maybe<Scalars['uuid']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['uuid']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  phone_numbers?: Maybe<Array<Scalars['String']['output']>>;
  postcode?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

/** order by max() on columns of table "venues" */
export type Venues_Max_Order_By = {
  address?: InputMaybe<Order_By>;
  area?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  phone_numbers?: InputMaybe<Order_By>;
  postcode?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Venues_Min_Fields = {
  __typename?: 'venues_min_fields';
  address?: Maybe<Scalars['String']['output']>;
  area?: Maybe<Scalars['String']['output']>;
  chain_id?: Maybe<Scalars['uuid']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  description_en?: Maybe<Scalars['String']['output']>;
  description_uk?: Maybe<Scalars['String']['output']>;
  emails?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['uuid']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  owner_id?: Maybe<Scalars['uuid']['output']>;
  phone_numbers?: Maybe<Array<Scalars['String']['output']>>;
  postcode?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['uuid']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

/** order by min() on columns of table "venues" */
export type Venues_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  area?: InputMaybe<Order_By>;
  chain_id?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owner_id?: InputMaybe<Order_By>;
  phone_numbers?: InputMaybe<Order_By>;
  postcode?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
  website?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "venues" */
export type Venues_Mutation_Response = {
  __typename?: 'venues_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Venues>;
};

/** input type for inserting object relation for remote table "venues" */
export type Venues_Obj_Rel_Insert_Input = {
  data: Venues_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Venues_On_Conflict>;
};

/** on_conflict condition type for table "venues" */
export type Venues_On_Conflict = {
  constraint: Venues_Constraint;
  update_columns?: Array<Venues_Update_Column>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** Ordering options when selecting data from "venues". */
export type Venues_Order_By = {
  address?: InputMaybe<Order_By>;
  area?: InputMaybe<Order_By>;
  category?: InputMaybe<Order_By>;
  chain?: InputMaybe<Chains_Order_By>;
  chain_id?: InputMaybe<Order_By>;
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
  events_aggregate?: InputMaybe<Events_Aggregate_Order_By>;
  geo?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  images?: InputMaybe<Order_By>;
  logo?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  owner?: InputMaybe<Users_Order_By>;
  owner_id?: InputMaybe<Order_By>;
  phone_numbers?: InputMaybe<Order_By>;
  postcode?: InputMaybe<Order_By>;
  slug?: InputMaybe<Order_By>;
  social_links?: InputMaybe<Order_By>;
  status?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Users_Order_By>;
  user_id?: InputMaybe<Order_By>;
  venue_accommodation_detail?: InputMaybe<Venue_Accommodation_Details_Order_By>;
  venue_accommodation_details_aggregate?: InputMaybe<Venue_Accommodation_Details_Aggregate_Order_By>;
  venue_beauty_salon_detail?: InputMaybe<Venue_Beauty_Salon_Details_Order_By>;
  venue_beauty_salon_details_aggregate?: InputMaybe<Venue_Beauty_Salon_Details_Aggregate_Order_By>;
  venue_category?: InputMaybe<Venue_Category_Order_By>;
  venue_restaurant_detail?: InputMaybe<Venue_Restaurant_Details_Order_By>;
  venue_restaurant_details_aggregate?: InputMaybe<Venue_Restaurant_Details_Aggregate_Order_By>;
  venue_schedules_aggregate?: InputMaybe<Venue_Schedule_Aggregate_Order_By>;
  venue_school_detail?: InputMaybe<Venue_School_Details_Order_By>;
  venue_school_details_aggregate?: InputMaybe<Venue_School_Details_Aggregate_Order_By>;
  venue_shop_detail?: InputMaybe<Venue_Shop_Details_Order_By>;
  venue_shop_details_aggregate?: InputMaybe<Venue_Shop_Details_Aggregate_Order_By>;
  venue_status?: InputMaybe<Venue_Status_Order_By>;
  website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venues */
export type Venues_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "venues" */
export enum Venues_Select_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Area = 'area',
  /** column name */
  Category = 'category',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  Emails = 'emails',
  /** column name */
  Geo = 'geo',
  /** column name */
  Id = 'id',
  /** column name */
  Images = 'images',
  /** column name */
  Logo = 'logo',
  /** column name */
  Name = 'name',
  /** column name */
  OwnerId = 'owner_id',
  /** column name */
  PhoneNumbers = 'phone_numbers',
  /** column name */
  Postcode = 'postcode',
  /** column name */
  Slug = 'slug',
  /** column name */
  SocialLinks = 'social_links',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  Website = 'website'
}

/** input type for updating data in table "venues" */
export type Venues_Set_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  area?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Venue_Category_Enum>;
  chain_id?: InputMaybe<Scalars['uuid']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  geo?: InputMaybe<Scalars['geography']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  phone_numbers?: InputMaybe<Array<Scalars['String']['input']>>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['json']['input']>;
  status?: InputMaybe<Venue_Status_Enum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "venues" */
export type Venues_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Venues_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Venues_Stream_Cursor_Value_Input = {
  address?: InputMaybe<Scalars['String']['input']>;
  area?: InputMaybe<Scalars['String']['input']>;
  category?: InputMaybe<Venue_Category_Enum>;
  chain_id?: InputMaybe<Scalars['uuid']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  description_en?: InputMaybe<Scalars['String']['input']>;
  description_uk?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Array<Scalars['String']['input']>>;
  geo?: InputMaybe<Scalars['geography']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  logo?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  owner_id?: InputMaybe<Scalars['uuid']['input']>;
  phone_numbers?: InputMaybe<Array<Scalars['String']['input']>>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  social_links?: InputMaybe<Scalars['json']['input']>;
  status?: InputMaybe<Venue_Status_Enum>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['uuid']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "venues" */
export enum Venues_Update_Column {
  /** column name */
  Address = 'address',
  /** column name */
  Area = 'area',
  /** column name */
  Category = 'category',
  /** column name */
  ChainId = 'chain_id',
  /** column name */
  City = 'city',
  /** column name */
  Country = 'country',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  DescriptionEn = 'description_en',
  /** column name */
  DescriptionUk = 'description_uk',
  /** column name */
  Emails = 'emails',
  /** column name */
  Geo = 'geo',
  /** column name */
  Id = 'id',
  /** column name */
  Images = 'images',
  /** column name */
  Logo = 'logo',
  /** column name */
  Name = 'name',
  /** column name */
  OwnerId = 'owner_id',
  /** column name */
  PhoneNumbers = 'phone_numbers',
  /** column name */
  Postcode = 'postcode',
  /** column name */
  Slug = 'slug',
  /** column name */
  SocialLinks = 'social_links',
  /** column name */
  Status = 'status',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
  /** column name */
  Website = 'website'
}

export type Venues_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venues_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venues_Bool_Exp;
};

/** columns and relationships of "verification_tokens" */
export type Verification_Tokens = {
  __typename?: 'verification_tokens';
  expires: Scalars['timestamptz']['output'];
  identifier: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

/** aggregated selection of "verification_tokens" */
export type Verification_Tokens_Aggregate = {
  __typename?: 'verification_tokens_aggregate';
  aggregate?: Maybe<Verification_Tokens_Aggregate_Fields>;
  nodes: Array<Verification_Tokens>;
};

/** aggregate fields of "verification_tokens" */
export type Verification_Tokens_Aggregate_Fields = {
  __typename?: 'verification_tokens_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Verification_Tokens_Max_Fields>;
  min?: Maybe<Verification_Tokens_Min_Fields>;
};


/** aggregate fields of "verification_tokens" */
export type Verification_Tokens_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "verification_tokens". All fields are combined with a logical 'AND'. */
export type Verification_Tokens_Bool_Exp = {
  _and?: InputMaybe<Array<Verification_Tokens_Bool_Exp>>;
  _not?: InputMaybe<Verification_Tokens_Bool_Exp>;
  _or?: InputMaybe<Array<Verification_Tokens_Bool_Exp>>;
  expires?: InputMaybe<Timestamptz_Comparison_Exp>;
  identifier?: InputMaybe<String_Comparison_Exp>;
  token?: InputMaybe<String_Comparison_Exp>;
};

/** unique or primary key constraints on table "verification_tokens" */
export enum Verification_Tokens_Constraint {
  /** unique or primary key constraint on columns "token" */
  VerificationTokensPkey = 'verification_tokens_pkey'
}

/** input type for inserting data into table "verification_tokens" */
export type Verification_Tokens_Insert_Input = {
  expires?: InputMaybe<Scalars['timestamptz']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate max on columns */
export type Verification_Tokens_Max_Fields = {
  __typename?: 'verification_tokens_max_fields';
  expires?: Maybe<Scalars['timestamptz']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Verification_Tokens_Min_Fields = {
  __typename?: 'verification_tokens_min_fields';
  expires?: Maybe<Scalars['timestamptz']['output']>;
  identifier?: Maybe<Scalars['String']['output']>;
  token?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "verification_tokens" */
export type Verification_Tokens_Mutation_Response = {
  __typename?: 'verification_tokens_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Verification_Tokens>;
};

/** on_conflict condition type for table "verification_tokens" */
export type Verification_Tokens_On_Conflict = {
  constraint: Verification_Tokens_Constraint;
  update_columns?: Array<Verification_Tokens_Update_Column>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

/** Ordering options when selecting data from "verification_tokens". */
export type Verification_Tokens_Order_By = {
  expires?: InputMaybe<Order_By>;
  identifier?: InputMaybe<Order_By>;
  token?: InputMaybe<Order_By>;
};

/** primary key columns input for table: verification_tokens */
export type Verification_Tokens_Pk_Columns_Input = {
  token: Scalars['String']['input'];
};

/** select columns of table "verification_tokens" */
export enum Verification_Tokens_Select_Column {
  /** column name */
  Expires = 'expires',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  Token = 'token'
}

/** input type for updating data in table "verification_tokens" */
export type Verification_Tokens_Set_Input = {
  expires?: InputMaybe<Scalars['timestamptz']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};

/** Streaming cursor of the table "verification_tokens" */
export type Verification_Tokens_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Verification_Tokens_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Verification_Tokens_Stream_Cursor_Value_Input = {
  expires?: InputMaybe<Scalars['timestamptz']['input']>;
  identifier?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};

/** update columns of table "verification_tokens" */
export enum Verification_Tokens_Update_Column {
  /** column name */
  Expires = 'expires',
  /** column name */
  Identifier = 'identifier',
  /** column name */
  Token = 'token'
}

export type Verification_Tokens_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Verification_Tokens_Set_Input>;
  /** filter the rows which have to be updated */
  where: Verification_Tokens_Bool_Exp;
};

export type GetUserProfileQueryVariables = Exact<{
  id: Scalars['uuid']['input'];
}>;


export type GetUserProfileQuery = { __typename?: 'query_root', users_by_pk?: { __typename?: 'users', id: UUID, name?: string | null, email: string, role: User_Role_Enum, status: User_Status_Enum, image?: string | null, points: number, venues_created: number, events_created: number, level: number } | null };

export type EventFieldsFragment = { __typename?: 'events', id: UUID, title_en: string, title_uk: string, slug: string, description_en?: string | null, description_uk?: string | null, type: Event_Type_Enum, price_type: Price_Type_Enum, price_amount?: Numeric | null, price_currency?: string | null, start_date: Timestamp, end_date?: Timestamp | null, is_online: boolean, external_url?: string | null, custom_location_address?: string | null, custom_location_name?: string | null, area?: string | null, city?: string | null, country?: string | null, geo?: Geography | null, images?: Array<string> | null, registration_url?: string | null, registration_required: boolean, capacity?: number | null, age_restriction?: string | null, language?: Array<string> | null, accessibility_info?: string | null, social_links?: Json | null, status: Event_Status_Enum, created_at: Timestamp, is_recurring: boolean, recurrence_rule?: string | null, organizer_name?: string | null, organizer_phone_number?: string | null, organizer_email?: string | null, owner_id?: UUID | null, venue_id?: UUID | null, user_id: UUID, venue?: { __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null, logo?: string | null, category: Venue_Category_Enum, geo?: Geography | null } | null };

export type GetPublicEventsQueryVariables = Exact<{
  where: Events_Bool_Exp;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By> | Events_Order_By>;
}>;


export type GetPublicEventsQuery = { __typename?: 'query_root', events: Array<{ __typename?: 'events', id: UUID, title_en: string, title_uk: string, slug: string, description_en?: string | null, description_uk?: string | null, type: Event_Type_Enum, price_type: Price_Type_Enum, price_amount?: Numeric | null, price_currency?: string | null, start_date: Timestamp, end_date?: Timestamp | null, is_online: boolean, external_url?: string | null, custom_location_address?: string | null, custom_location_name?: string | null, area?: string | null, city?: string | null, country?: string | null, geo?: Geography | null, images?: Array<string> | null, registration_url?: string | null, registration_required: boolean, capacity?: number | null, age_restriction?: string | null, language?: Array<string> | null, accessibility_info?: string | null, social_links?: Json | null, status: Event_Status_Enum, created_at: Timestamp, is_recurring: boolean, recurrence_rule?: string | null, organizer_name?: string | null, organizer_phone_number?: string | null, organizer_email?: string | null, owner_id?: UUID | null, venue_id?: UUID | null, user_id: UUID, venue?: { __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null, logo?: string | null, category: Venue_Category_Enum, geo?: Geography | null } | null }>, events_aggregate: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null }, total: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null } };

export type ProductVariantFieldsFragment = { __typename?: 'product_variants', id: UUID, gender: string, age_group: string, size: string, color?: string | null, stock: number, sku?: string | null, price_override_minor?: number | null };

export type ProductFieldsFragment = { __typename?: 'products', id: UUID, name: string, slug: string, description_en?: string | null, description_uk?: string | null, category: string, clothing_type?: string | null, price_minor: number, currency: string, images?: Array<string> | null, badge?: string | null, status: string, stock?: number | null, created_at: Timestamp, updated_at: Timestamp, product_variants: Array<{ __typename?: 'product_variants', id: UUID, gender: string, age_group: string, size: string, color?: string | null, stock: number, sku?: string | null, price_override_minor?: number | null }> };

export type GetPublicProductsQueryVariables = Exact<{
  where: Products_Bool_Exp;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Products_Order_By> | Products_Order_By>;
}>;


export type GetPublicProductsQuery = { __typename?: 'query_root', products: Array<{ __typename?: 'products', id: UUID, name: string, slug: string, description_en?: string | null, description_uk?: string | null, category: string, clothing_type?: string | null, price_minor: number, currency: string, images?: Array<string> | null, badge?: string | null, status: string, stock?: number | null, created_at: Timestamp, updated_at: Timestamp, product_variants: Array<{ __typename?: 'product_variants', id: UUID, gender: string, age_group: string, size: string, color?: string | null, stock: number, sku?: string | null, price_override_minor?: number | null }> }>, products_aggregate: { __typename?: 'products_aggregate', aggregate?: { __typename?: 'products_aggregate_fields', count: number } | null } };

export type GetProductBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetProductBySlugQuery = { __typename?: 'query_root', products: Array<{ __typename?: 'products', id: UUID, name: string, slug: string, description_en?: string | null, description_uk?: string | null, category: string, clothing_type?: string | null, price_minor: number, currency: string, images?: Array<string> | null, badge?: string | null, status: string, stock?: number | null, created_at: Timestamp, updated_at: Timestamp, product_variants: Array<{ __typename?: 'product_variants', id: UUID, gender: string, age_group: string, size: string, color?: string | null, stock: number, sku?: string | null, price_override_minor?: number | null }> }> };

export type GetUserEventsQueryVariables = Exact<{
  where: Events_Bool_Exp;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Events_Order_By> | Events_Order_By>;
}>;


export type GetUserEventsQuery = { __typename?: 'query_root', events: Array<{ __typename?: 'events', updated_at: Timestamp, id: UUID, title_en: string, title_uk: string, slug: string, description_en?: string | null, description_uk?: string | null, type: Event_Type_Enum, price_type: Price_Type_Enum, price_amount?: Numeric | null, price_currency?: string | null, start_date: Timestamp, end_date?: Timestamp | null, is_online: boolean, external_url?: string | null, custom_location_address?: string | null, custom_location_name?: string | null, area?: string | null, city?: string | null, country?: string | null, geo?: Geography | null, images?: Array<string> | null, registration_url?: string | null, registration_required: boolean, capacity?: number | null, age_restriction?: string | null, language?: Array<string> | null, accessibility_info?: string | null, social_links?: Json | null, status: Event_Status_Enum, created_at: Timestamp, is_recurring: boolean, recurrence_rule?: string | null, organizer_name?: string | null, organizer_phone_number?: string | null, organizer_email?: string | null, owner_id?: UUID | null, venue_id?: UUID | null, user_id: UUID, venue?: { __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null, logo?: string | null, category: Venue_Category_Enum, geo?: Geography | null } | null }>, events_aggregate: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null } };

export type UpdateEventStatusMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  status: Event_Status_Enum;
}>;


export type UpdateEventStatusMutation = { __typename?: 'mutation_root', update_events_by_pk?: { __typename?: 'events', id: UUID, status: Event_Status_Enum, updated_at: Timestamp } | null };

export type ChainFieldsFragment = { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json };

export type ChainWithVenuesFragment = { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } };

export type ChainWithChainsFragment = { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chains: Array<{ __typename?: 'chains', id: UUID, name: string, slug: string, country?: string | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } }>, chains_aggregate: { __typename?: 'chains_aggregate', aggregate?: { __typename?: 'chains_aggregate_fields', count: number } | null } };

export type VenueFieldsFragment = { __typename?: 'venues', id: UUID, name: string, address?: string | null, city?: string | null, country?: string | null, logo?: string | null, images?: Array<string> | null, description_uk?: string | null, description_en?: string | null, geo?: Geography | null, category: Venue_Category_Enum, emails?: Array<string> | null, website?: string | null, phone_numbers?: Array<string> | null, social_links: Json, slug: string, status: Venue_Status_Enum, owner_id?: UUID | null, user_id?: UUID | null, updated_at: Timestamp, venue_schedules: Array<{ __typename?: 'venue_schedule', id: UUID, open_time: Time, close_time: Time, day_of_week: string }>, venue_accommodation_details: Array<{ __typename?: 'venue_accommodation_details', bedrooms?: number | null, bathrooms?: number | null, max_guests?: number | null, check_in_time?: Time | null, check_out_time?: Time | null, minimum_stay_nights?: number | null, amenities?: Array<string> | null }>, venue_beauty_salon_details: Array<{ __typename?: 'venue_beauty_salon_details', services?: Array<string> | null, appointment_required?: boolean | null, walk_ins_accepted?: boolean | null }>, venue_restaurant_details: Array<{ __typename?: 'venue_restaurant_details', cuisine_types?: Array<string> | null, seating_capacity?: number | null, price_range?: string | null, features?: Array<string> | null }>, venue_school_details: Array<{ __typename?: 'venue_school_details', subjects?: Array<string> | null, languages_taught?: Array<string> | null, age_groups?: Array<string> | null, class_size_max?: number | null, online_classes_available?: boolean | null }>, venue_shop_details: Array<{ __typename?: 'venue_shop_details', product_categories?: Array<string> | null, payment_methods?: Array<string> | null }>, events_aggregate: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null }, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chains: Array<{ __typename?: 'chains', id: UUID, name: string, slug: string, country?: string | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } }>, chains_aggregate: { __typename?: 'chains_aggregate', aggregate?: { __typename?: 'chains_aggregate_fields', count: number } | null } } | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } } | null };

export type GetPublicVenuesQueryVariables = Exact<{
  where: Venues_Bool_Exp;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By> | Venues_Order_By>;
}>;


export type GetPublicVenuesQuery = { __typename?: 'query_root', venues: Array<{ __typename?: 'venues', id: UUID, name: string, address?: string | null, city?: string | null, country?: string | null, logo?: string | null, images?: Array<string> | null, description_uk?: string | null, description_en?: string | null, geo?: Geography | null, category: Venue_Category_Enum, emails?: Array<string> | null, website?: string | null, phone_numbers?: Array<string> | null, social_links: Json, slug: string, status: Venue_Status_Enum, owner_id?: UUID | null, user_id?: UUID | null, updated_at: Timestamp, venue_schedules: Array<{ __typename?: 'venue_schedule', id: UUID, open_time: Time, close_time: Time, day_of_week: string }>, venue_accommodation_details: Array<{ __typename?: 'venue_accommodation_details', bedrooms?: number | null, bathrooms?: number | null, max_guests?: number | null, check_in_time?: Time | null, check_out_time?: Time | null, minimum_stay_nights?: number | null, amenities?: Array<string> | null }>, venue_beauty_salon_details: Array<{ __typename?: 'venue_beauty_salon_details', services?: Array<string> | null, appointment_required?: boolean | null, walk_ins_accepted?: boolean | null }>, venue_restaurant_details: Array<{ __typename?: 'venue_restaurant_details', cuisine_types?: Array<string> | null, seating_capacity?: number | null, price_range?: string | null, features?: Array<string> | null }>, venue_school_details: Array<{ __typename?: 'venue_school_details', subjects?: Array<string> | null, languages_taught?: Array<string> | null, age_groups?: Array<string> | null, class_size_max?: number | null, online_classes_available?: boolean | null }>, venue_shop_details: Array<{ __typename?: 'venue_shop_details', product_categories?: Array<string> | null, payment_methods?: Array<string> | null }>, events_aggregate: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null }, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chains: Array<{ __typename?: 'chains', id: UUID, name: string, slug: string, country?: string | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } }>, chains_aggregate: { __typename?: 'chains_aggregate', aggregate?: { __typename?: 'chains_aggregate_fields', count: number } | null } } | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } } | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null }, total: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } };

export type GetUserVenuesQueryVariables = Exact<{
  where: Venues_Bool_Exp;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Venues_Order_By> | Venues_Order_By>;
}>;


export type GetUserVenuesQuery = { __typename?: 'query_root', venues: Array<{ __typename?: 'venues', postcode?: string | null, created_at: Timestamp, id: UUID, name: string, address?: string | null, city?: string | null, country?: string | null, logo?: string | null, images?: Array<string> | null, description_uk?: string | null, description_en?: string | null, geo?: Geography | null, category: Venue_Category_Enum, emails?: Array<string> | null, website?: string | null, phone_numbers?: Array<string> | null, social_links: Json, slug: string, status: Venue_Status_Enum, owner_id?: UUID | null, user_id?: UUID | null, updated_at: Timestamp, venue_schedules: Array<{ __typename?: 'venue_schedule', id: UUID, open_time: Time, close_time: Time, day_of_week: string }>, venue_accommodation_details: Array<{ __typename?: 'venue_accommodation_details', bedrooms?: number | null, bathrooms?: number | null, max_guests?: number | null, check_in_time?: Time | null, check_out_time?: Time | null, minimum_stay_nights?: number | null, amenities?: Array<string> | null }>, venue_beauty_salon_details: Array<{ __typename?: 'venue_beauty_salon_details', services?: Array<string> | null, appointment_required?: boolean | null, walk_ins_accepted?: boolean | null }>, venue_restaurant_details: Array<{ __typename?: 'venue_restaurant_details', cuisine_types?: Array<string> | null, seating_capacity?: number | null, price_range?: string | null, features?: Array<string> | null }>, venue_school_details: Array<{ __typename?: 'venue_school_details', subjects?: Array<string> | null, languages_taught?: Array<string> | null, age_groups?: Array<string> | null, class_size_max?: number | null, online_classes_available?: boolean | null }>, venue_shop_details: Array<{ __typename?: 'venue_shop_details', product_categories?: Array<string> | null, payment_methods?: Array<string> | null }>, events_aggregate: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null }, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chains: Array<{ __typename?: 'chains', id: UUID, name: string, slug: string, country?: string | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } }>, chains_aggregate: { __typename?: 'chains_aggregate', aggregate?: { __typename?: 'chains_aggregate_fields', count: number } | null } } | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } } | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } };

export type GetAdminVenuesQueryVariables = Exact<{
  where: Venues_Bool_Exp;
}>;


export type GetAdminVenuesQuery = { __typename?: 'query_root', venues: Array<{ __typename?: 'venues', created_at: Timestamp, id: UUID, name: string, address?: string | null, city?: string | null, country?: string | null, logo?: string | null, images?: Array<string> | null, description_uk?: string | null, description_en?: string | null, geo?: Geography | null, category: Venue_Category_Enum, emails?: Array<string> | null, website?: string | null, phone_numbers?: Array<string> | null, social_links: Json, slug: string, status: Venue_Status_Enum, owner_id?: UUID | null, user_id?: UUID | null, updated_at: Timestamp, venue_schedules: Array<{ __typename?: 'venue_schedule', id: UUID, open_time: Time, close_time: Time, day_of_week: string }>, venue_accommodation_details: Array<{ __typename?: 'venue_accommodation_details', bedrooms?: number | null, bathrooms?: number | null, max_guests?: number | null, check_in_time?: Time | null, check_out_time?: Time | null, minimum_stay_nights?: number | null, amenities?: Array<string> | null }>, venue_beauty_salon_details: Array<{ __typename?: 'venue_beauty_salon_details', services?: Array<string> | null, appointment_required?: boolean | null, walk_ins_accepted?: boolean | null }>, venue_restaurant_details: Array<{ __typename?: 'venue_restaurant_details', cuisine_types?: Array<string> | null, seating_capacity?: number | null, price_range?: string | null, features?: Array<string> | null }>, venue_school_details: Array<{ __typename?: 'venue_school_details', subjects?: Array<string> | null, languages_taught?: Array<string> | null, age_groups?: Array<string> | null, class_size_max?: number | null, online_classes_available?: boolean | null }>, venue_shop_details: Array<{ __typename?: 'venue_shop_details', product_categories?: Array<string> | null, payment_methods?: Array<string> | null }>, events_aggregate: { __typename?: 'events_aggregate', aggregate?: { __typename?: 'events_aggregate_fields', count: number } | null }, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chain?: { __typename?: 'chains', id: UUID, name: string, slug: string, logo?: string | null, country?: string | null, description_uk?: string | null, description_en?: string | null, phone_numbers?: Array<string> | null, emails?: Array<string> | null, website?: string | null, social_links: Json, chains: Array<{ __typename?: 'chains', id: UUID, name: string, slug: string, country?: string | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } }>, chains_aggregate: { __typename?: 'chains_aggregate', aggregate?: { __typename?: 'chains_aggregate_fields', count: number } | null } } | null, venues: Array<{ __typename?: 'venues', id: UUID, name: string, slug: string, city?: string | null, country?: string | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } } | null }>, venues_aggregate: { __typename?: 'venues_aggregate', aggregate?: { __typename?: 'venues_aggregate_fields', count: number } | null } };

export type UpdateVenueStatusMutationVariables = Exact<{
  id: Scalars['uuid']['input'];
  status: Venue_Status_Enum;
}>;


export type UpdateVenueStatusMutation = { __typename?: 'mutation_root', update_venues_by_pk?: { __typename?: 'venues', id: UUID, status: Venue_Status_Enum, updated_at: Timestamp } | null };

export const EventFieldsFragmentDoc = gql`
    fragment EventFields on events {
  id
  title_en
  title_uk
  slug
  description_en
  description_uk
  type
  price_type
  price_amount
  price_currency
  start_date
  end_date
  is_online
  external_url
  custom_location_address
  custom_location_name
  area
  city
  country
  geo
  images
  registration_url
  registration_required
  capacity
  age_restriction
  language
  accessibility_info
  social_links
  status
  created_at
  is_recurring
  recurrence_rule
  organizer_name
  organizer_phone_number
  organizer_email
  owner_id
  venue_id
  user_id
  venue {
    id
    name
    slug
    city
    country
    logo
    category
    geo
  }
}
    `;
export const ProductVariantFieldsFragmentDoc = gql`
    fragment ProductVariantFields on product_variants {
  id
  gender
  age_group
  size
  color
  stock
  sku
  price_override_minor
}
    `;
export const ProductFieldsFragmentDoc = gql`
    fragment ProductFields on products {
  id
  name
  slug
  description_en
  description_uk
  category
  clothing_type
  price_minor
  currency
  images
  badge
  status
  stock
  created_at
  updated_at
  product_variants {
    ...ProductVariantFields
  }
}
    ${ProductVariantFieldsFragmentDoc}`;
export const ChainFieldsFragmentDoc = gql`
    fragment ChainFields on chains {
  id
  name
  slug
  logo
  country
  description_uk
  description_en
  phone_numbers
  emails
  website
  social_links
}
    `;
export const ChainWithVenuesFragmentDoc = gql`
    fragment ChainWithVenues on chains {
  ...ChainFields
  venues {
    id
    name
    slug
    city
    country
  }
  venues_aggregate {
    aggregate {
      count
    }
  }
}
    ${ChainFieldsFragmentDoc}`;
export const ChainWithChainsFragmentDoc = gql`
    fragment ChainWithChains on chains {
  ...ChainFields
  chains {
    id
    name
    slug
    country
    venues {
      id
      name
      slug
      city
      country
    }
    venues_aggregate {
      aggregate {
        count
      }
    }
  }
  chains_aggregate {
    aggregate {
      count
    }
  }
}
    ${ChainFieldsFragmentDoc}`;
export const VenueFieldsFragmentDoc = gql`
    fragment VenueFields on venues {
  id
  name
  address
  city
  country
  logo
  images
  description_uk
  description_en
  geo
  category
  emails
  website
  phone_numbers
  social_links
  slug
  status
  owner_id
  user_id
  venue_schedules {
    id
    open_time
    close_time
    day_of_week
  }
  venue_accommodation_details {
    bedrooms
    bathrooms
    max_guests
    check_in_time
    check_out_time
    minimum_stay_nights
    amenities
  }
  venue_beauty_salon_details {
    services
    appointment_required
    walk_ins_accepted
  }
  venue_restaurant_details {
    cuisine_types
    seating_capacity
    price_range
    features
  }
  venue_school_details {
    subjects
    languages_taught
    age_groups
    class_size_max
    online_classes_available
  }
  venue_shop_details {
    product_categories
    payment_methods
  }
  updated_at
  events_aggregate {
    aggregate {
      count
    }
  }
  chain {
    ...ChainWithVenues
    chain {
      ...ChainWithChains
    }
  }
}
    ${ChainWithVenuesFragmentDoc}
${ChainWithChainsFragmentDoc}`;
export const GetUserProfileDocument = gql`
    query GetUserProfile($id: uuid!) {
  users_by_pk(id: $id) {
    id
    name
    email
    role
    status
    image
    points
    venues_created
    events_created
    level
  }
}
    `;

/**
 * __useGetUserProfileQuery__
 *
 * To run a query within a React component, call `useGetUserProfileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserProfileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserProfileQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserProfileQuery(baseOptions: Apollo.QueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables> & ({ variables: GetUserProfileQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
      }
export function useGetUserProfileLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
        }
export function useGetUserProfileSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
        }
export type GetUserProfileQueryHookResult = ReturnType<typeof useGetUserProfileQuery>;
export type GetUserProfileLazyQueryHookResult = ReturnType<typeof useGetUserProfileLazyQuery>;
export type GetUserProfileSuspenseQueryHookResult = ReturnType<typeof useGetUserProfileSuspenseQuery>;
export type GetUserProfileQueryResult = Apollo.QueryResult<GetUserProfileQuery, GetUserProfileQueryVariables>;
export const GetPublicEventsDocument = gql`
    query GetPublicEvents($where: events_bool_exp!, $limit: Int, $offset: Int, $order_by: [events_order_by!]) {
  events(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    ...EventFields
  }
  events_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  total: events_aggregate {
    aggregate {
      count
    }
  }
}
    ${EventFieldsFragmentDoc}`;

/**
 * __useGetPublicEventsQuery__
 *
 * To run a query within a React component, call `useGetPublicEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicEventsQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetPublicEventsQuery(baseOptions: Apollo.QueryHookOptions<GetPublicEventsQuery, GetPublicEventsQueryVariables> & ({ variables: GetPublicEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPublicEventsQuery, GetPublicEventsQueryVariables>(GetPublicEventsDocument, options);
      }
export function useGetPublicEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPublicEventsQuery, GetPublicEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPublicEventsQuery, GetPublicEventsQueryVariables>(GetPublicEventsDocument, options);
        }
export function useGetPublicEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPublicEventsQuery, GetPublicEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPublicEventsQuery, GetPublicEventsQueryVariables>(GetPublicEventsDocument, options);
        }
export type GetPublicEventsQueryHookResult = ReturnType<typeof useGetPublicEventsQuery>;
export type GetPublicEventsLazyQueryHookResult = ReturnType<typeof useGetPublicEventsLazyQuery>;
export type GetPublicEventsSuspenseQueryHookResult = ReturnType<typeof useGetPublicEventsSuspenseQuery>;
export type GetPublicEventsQueryResult = Apollo.QueryResult<GetPublicEventsQuery, GetPublicEventsQueryVariables>;
export const GetPublicProductsDocument = gql`
    query GetPublicProducts($where: products_bool_exp!, $limit: Int, $offset: Int, $order_by: [products_order_by!]) {
  products(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    ...ProductFields
  }
  products_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    ${ProductFieldsFragmentDoc}`;

/**
 * __useGetPublicProductsQuery__
 *
 * To run a query within a React component, call `useGetPublicProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicProductsQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetPublicProductsQuery(baseOptions: Apollo.QueryHookOptions<GetPublicProductsQuery, GetPublicProductsQueryVariables> & ({ variables: GetPublicProductsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPublicProductsQuery, GetPublicProductsQueryVariables>(GetPublicProductsDocument, options);
      }
export function useGetPublicProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPublicProductsQuery, GetPublicProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPublicProductsQuery, GetPublicProductsQueryVariables>(GetPublicProductsDocument, options);
        }
export function useGetPublicProductsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPublicProductsQuery, GetPublicProductsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPublicProductsQuery, GetPublicProductsQueryVariables>(GetPublicProductsDocument, options);
        }
export type GetPublicProductsQueryHookResult = ReturnType<typeof useGetPublicProductsQuery>;
export type GetPublicProductsLazyQueryHookResult = ReturnType<typeof useGetPublicProductsLazyQuery>;
export type GetPublicProductsSuspenseQueryHookResult = ReturnType<typeof useGetPublicProductsSuspenseQuery>;
export type GetPublicProductsQueryResult = Apollo.QueryResult<GetPublicProductsQuery, GetPublicProductsQueryVariables>;
export const GetProductBySlugDocument = gql`
    query GetProductBySlug($slug: String!) {
  products(where: {slug: {_eq: $slug}, status: {_eq: "ACTIVE"}}, limit: 1) {
    ...ProductFields
  }
}
    ${ProductFieldsFragmentDoc}`;

/**
 * __useGetProductBySlugQuery__
 *
 * To run a query within a React component, call `useGetProductBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetProductBySlugQuery(baseOptions: Apollo.QueryHookOptions<GetProductBySlugQuery, GetProductBySlugQueryVariables> & ({ variables: GetProductBySlugQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProductBySlugQuery, GetProductBySlugQueryVariables>(GetProductBySlugDocument, options);
      }
export function useGetProductBySlugLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProductBySlugQuery, GetProductBySlugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProductBySlugQuery, GetProductBySlugQueryVariables>(GetProductBySlugDocument, options);
        }
export function useGetProductBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetProductBySlugQuery, GetProductBySlugQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetProductBySlugQuery, GetProductBySlugQueryVariables>(GetProductBySlugDocument, options);
        }
export type GetProductBySlugQueryHookResult = ReturnType<typeof useGetProductBySlugQuery>;
export type GetProductBySlugLazyQueryHookResult = ReturnType<typeof useGetProductBySlugLazyQuery>;
export type GetProductBySlugSuspenseQueryHookResult = ReturnType<typeof useGetProductBySlugSuspenseQuery>;
export type GetProductBySlugQueryResult = Apollo.QueryResult<GetProductBySlugQuery, GetProductBySlugQueryVariables>;
export const GetUserEventsDocument = gql`
    query GetUserEvents($where: events_bool_exp!, $limit: Int, $offset: Int, $order_by: [events_order_by!]) {
  events(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    ...EventFields
    updated_at
  }
  events_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    ${EventFieldsFragmentDoc}`;

/**
 * __useGetUserEventsQuery__
 *
 * To run a query within a React component, call `useGetUserEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserEventsQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetUserEventsQuery(baseOptions: Apollo.QueryHookOptions<GetUserEventsQuery, GetUserEventsQueryVariables> & ({ variables: GetUserEventsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserEventsQuery, GetUserEventsQueryVariables>(GetUserEventsDocument, options);
      }
export function useGetUserEventsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserEventsQuery, GetUserEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserEventsQuery, GetUserEventsQueryVariables>(GetUserEventsDocument, options);
        }
export function useGetUserEventsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserEventsQuery, GetUserEventsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserEventsQuery, GetUserEventsQueryVariables>(GetUserEventsDocument, options);
        }
export type GetUserEventsQueryHookResult = ReturnType<typeof useGetUserEventsQuery>;
export type GetUserEventsLazyQueryHookResult = ReturnType<typeof useGetUserEventsLazyQuery>;
export type GetUserEventsSuspenseQueryHookResult = ReturnType<typeof useGetUserEventsSuspenseQuery>;
export type GetUserEventsQueryResult = Apollo.QueryResult<GetUserEventsQuery, GetUserEventsQueryVariables>;
export const UpdateEventStatusDocument = gql`
    mutation UpdateEventStatus($id: uuid!, $status: event_status_enum!) {
  update_events_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
    id
    status
    updated_at
  }
}
    `;
export type UpdateEventStatusMutationFn = Apollo.MutationFunction<UpdateEventStatusMutation, UpdateEventStatusMutationVariables>;

/**
 * __useUpdateEventStatusMutation__
 *
 * To run a mutation, you first call `useUpdateEventStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEventStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEventStatusMutation, { data, loading, error }] = useUpdateEventStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateEventStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateEventStatusMutation, UpdateEventStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateEventStatusMutation, UpdateEventStatusMutationVariables>(UpdateEventStatusDocument, options);
      }
export type UpdateEventStatusMutationHookResult = ReturnType<typeof useUpdateEventStatusMutation>;
export type UpdateEventStatusMutationResult = Apollo.MutationResult<UpdateEventStatusMutation>;
export type UpdateEventStatusMutationOptions = Apollo.BaseMutationOptions<UpdateEventStatusMutation, UpdateEventStatusMutationVariables>;
export const GetPublicVenuesDocument = gql`
    query GetPublicVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
  venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    ...VenueFields
  }
  venues_aggregate(where: $where) {
    aggregate {
      count
    }
  }
  total: venues_aggregate {
    aggregate {
      count
    }
  }
}
    ${VenueFieldsFragmentDoc}`;

/**
 * __useGetPublicVenuesQuery__
 *
 * To run a query within a React component, call `useGetPublicVenuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPublicVenuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPublicVenuesQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetPublicVenuesQuery(baseOptions: Apollo.QueryHookOptions<GetPublicVenuesQuery, GetPublicVenuesQueryVariables> & ({ variables: GetPublicVenuesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>(GetPublicVenuesDocument, options);
      }
export function useGetPublicVenuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>(GetPublicVenuesDocument, options);
        }
export function useGetPublicVenuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>(GetPublicVenuesDocument, options);
        }
export type GetPublicVenuesQueryHookResult = ReturnType<typeof useGetPublicVenuesQuery>;
export type GetPublicVenuesLazyQueryHookResult = ReturnType<typeof useGetPublicVenuesLazyQuery>;
export type GetPublicVenuesSuspenseQueryHookResult = ReturnType<typeof useGetPublicVenuesSuspenseQuery>;
export type GetPublicVenuesQueryResult = Apollo.QueryResult<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>;
export const GetUserVenuesDocument = gql`
    query GetUserVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
  venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
    ...VenueFields
    postcode
    created_at
  }
  venues_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    ${VenueFieldsFragmentDoc}`;

/**
 * __useGetUserVenuesQuery__
 *
 * To run a query within a React component, call `useGetUserVenuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserVenuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserVenuesQuery({
 *   variables: {
 *      where: // value for 'where'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      order_by: // value for 'order_by'
 *   },
 * });
 */
export function useGetUserVenuesQuery(baseOptions: Apollo.QueryHookOptions<GetUserVenuesQuery, GetUserVenuesQueryVariables> & ({ variables: GetUserVenuesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserVenuesQuery, GetUserVenuesQueryVariables>(GetUserVenuesDocument, options);
      }
export function useGetUserVenuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserVenuesQuery, GetUserVenuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserVenuesQuery, GetUserVenuesQueryVariables>(GetUserVenuesDocument, options);
        }
export function useGetUserVenuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserVenuesQuery, GetUserVenuesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUserVenuesQuery, GetUserVenuesQueryVariables>(GetUserVenuesDocument, options);
        }
export type GetUserVenuesQueryHookResult = ReturnType<typeof useGetUserVenuesQuery>;
export type GetUserVenuesLazyQueryHookResult = ReturnType<typeof useGetUserVenuesLazyQuery>;
export type GetUserVenuesSuspenseQueryHookResult = ReturnType<typeof useGetUserVenuesSuspenseQuery>;
export type GetUserVenuesQueryResult = Apollo.QueryResult<GetUserVenuesQuery, GetUserVenuesQueryVariables>;
export const GetAdminVenuesDocument = gql`
    query GetAdminVenues($where: venues_bool_exp!) {
  venues(where: $where, order_by: {updated_at: desc}) {
    ...VenueFields
    created_at
  }
  venues_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
    ${VenueFieldsFragmentDoc}`;

/**
 * __useGetAdminVenuesQuery__
 *
 * To run a query within a React component, call `useGetAdminVenuesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAdminVenuesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAdminVenuesQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetAdminVenuesQuery(baseOptions: Apollo.QueryHookOptions<GetAdminVenuesQuery, GetAdminVenuesQueryVariables> & ({ variables: GetAdminVenuesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>(GetAdminVenuesDocument, options);
      }
export function useGetAdminVenuesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>(GetAdminVenuesDocument, options);
        }
export function useGetAdminVenuesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>(GetAdminVenuesDocument, options);
        }
export type GetAdminVenuesQueryHookResult = ReturnType<typeof useGetAdminVenuesQuery>;
export type GetAdminVenuesLazyQueryHookResult = ReturnType<typeof useGetAdminVenuesLazyQuery>;
export type GetAdminVenuesSuspenseQueryHookResult = ReturnType<typeof useGetAdminVenuesSuspenseQuery>;
export type GetAdminVenuesQueryResult = Apollo.QueryResult<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>;
export const UpdateVenueStatusDocument = gql`
    mutation UpdateVenueStatus($id: uuid!, $status: venue_status_enum!) {
  update_venues_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
    id
    status
    updated_at
  }
}
    `;
export type UpdateVenueStatusMutationFn = Apollo.MutationFunction<UpdateVenueStatusMutation, UpdateVenueStatusMutationVariables>;

/**
 * __useUpdateVenueStatusMutation__
 *
 * To run a mutation, you first call `useUpdateVenueStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVenueStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVenueStatusMutation, { data, loading, error }] = useUpdateVenueStatusMutation({
 *   variables: {
 *      id: // value for 'id'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateVenueStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdateVenueStatusMutation, UpdateVenueStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateVenueStatusMutation, UpdateVenueStatusMutationVariables>(UpdateVenueStatusDocument, options);
      }
export type UpdateVenueStatusMutationHookResult = ReturnType<typeof useUpdateVenueStatusMutation>;
export type UpdateVenueStatusMutationResult = Apollo.MutationResult<UpdateVenueStatusMutation>;
export type UpdateVenueStatusMutationOptions = Apollo.BaseMutationOptions<UpdateVenueStatusMutation, UpdateVenueStatusMutationVariables>;