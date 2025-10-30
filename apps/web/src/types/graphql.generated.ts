import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";

import { Geography } from "./geography";
import { Geometry } from "./geometry";
import { Json } from "./json";
import { Timestamp } from "./timestamp";
import { UUID } from "./uuid";
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type Incremental<T> = { [P in keyof T]?: P extends "__typename" | " $fragmentName" ? T[P] : never } | T;
export type InputMaybe<T> = Maybe<T>;
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type MakeMaybe<T, K extends keyof T> = { [SubKey in K]: Maybe<T[SubKey]> } & Omit<T, K>;
export type MakeOptional<T, K extends keyof T> = { [SubKey in K]?: Maybe<T[SubKey]> } & Omit<T, K>;
export type Maybe<T> = null | T;
const defaultOptions = {} as const;
/** unique or primary key constraints on table "accounts" */
export enum Accounts_Constraint {
  /** unique or primary key constraint on columns "id" */
  AccountsPkey = "accounts_pkey",
}

/** select columns of table "accounts" */
export enum Accounts_Select_Column {
  /** column name */
  AccessToken = "access_token",
  /** column name */
  ExpiresAt = "expires_at",
  /** column name */
  Id = "id",
  /** column name */
  IdToken = "id_token",
  /** column name */
  Provider = "provider",
  /** column name */
  ProviderAccountId = "providerAccountId",
  /** column name */
  RefreshToken = "refresh_token",
  /** column name */
  Scope = "scope",
  /** column name */
  SessionState = "session_state",
  /** column name */
  TokenType = "token_type",
  /** column name */
  Type = "type",
  /** column name */
  UserId = "userId",
}

/** update columns of table "accounts" */
export enum Accounts_Update_Column {
  /** column name */
  AccessToken = "access_token",
  /** column name */
  ExpiresAt = "expires_at",
  /** column name */
  Id = "id",
  /** column name */
  IdToken = "id_token",
  /** column name */
  Provider = "provider",
  /** column name */
  ProviderAccountId = "providerAccountId",
  /** column name */
  RefreshToken = "refresh_token",
  /** column name */
  Scope = "scope",
  /** column name */
  SessionState = "session_state",
  /** column name */
  TokenType = "token_type",
  /** column name */
  Type = "type",
  /** column name */
  UserId = "userId",
}

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = "ASC",
  /** descending ordering of the cursor */
  Desc = "DESC",
}

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = "asc",
  /** in ascending order, nulls first */
  AscNullsFirst = "asc_nulls_first",
  /** in ascending order, nulls last */
  AscNullsLast = "asc_nulls_last",
  /** in descending order, nulls first */
  Desc = "desc",
  /** in descending order, nulls first */
  DescNullsFirst = "desc_nulls_first",
  /** in descending order, nulls last */
  DescNullsLast = "desc_nulls_last",
}

/** unique or primary key constraints on table "provider_type" */
export enum Provider_Type_Constraint {
  /** unique or primary key constraint on columns "value" */
  ProviderTypePkey = "provider_type_pkey",
}

/** select columns of table "provider_type" */
export enum Provider_Type_Select_Column {
  /** column name */
  Value = "value",
}

/** update columns of table "provider_type" */
export enum Provider_Type_Update_Column {
  /** column name */
  Value = "value",
}

/** unique or primary key constraints on table "sessions" */
export enum Sessions_Constraint {
  /** unique or primary key constraint on columns "sessionToken" */
  SessionsPkey = "sessions_pkey",
}

/** select columns of table "sessions" */
export enum Sessions_Select_Column {
  /** column name */
  Expires = "expires",
  /** column name */
  Id = "id",
  /** column name */
  SessionToken = "sessionToken",
  /** column name */
  UserId = "userId",
}

/** update columns of table "sessions" */
export enum Sessions_Update_Column {
  /** column name */
  Expires = "expires",
  /** column name */
  Id = "id",
  /** column name */
  SessionToken = "sessionToken",
  /** column name */
  UserId = "userId",
}

/** unique or primary key constraints on table "user_role" */
export enum User_Role_Constraint {
  /** unique or primary key constraint on columns "value" */
  UserRolePkey = "user_role_pkey",
}

export enum User_Role_Enum {
  /** Administrator with full access */
  Admin = "admin",
  /** Regular user with standard access */
  User = "user",
}

/** select columns of table "user_role" */
export enum User_Role_Select_Column {
  /** column name */
  Description = "description",
  /** column name */
  Value = "value",
}

/** update columns of table "user_role" */
export enum User_Role_Update_Column {
  /** column name */
  Description = "description",
  /** column name */
  Value = "value",
}

/** unique or primary key constraints on table "user_status" */
export enum User_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  UserStatusPkey = "user_status_pkey",
}

export enum User_Status_Enum {
  /** Currently active and able to log in */
  Active = "active",
  /** Inactive but can be reactivated */
  Inactive = "inactive",
}

/** select columns of table "user_status" */
export enum User_Status_Select_Column {
  /** column name */
  Description = "description",
  /** column name */
  Value = "value",
}

/** update columns of table "user_status" */
export enum User_Status_Update_Column {
  /** column name */
  Description = "description",
  /** column name */
  Value = "value",
}

/** unique or primary key constraints on table "users" */
export enum Users_Constraint {
  /** unique or primary key constraint on columns "email" */
  UsersEmailKey = "users_email_key",
  /** unique or primary key constraint on columns "id" */
  UsersPkey = "users_pkey",
}

/** select columns of table "users" */
export enum Users_Select_Column {
  /** column name */
  City = "city",
  /** column name */
  Email = "email",
  /** column name */
  EmailVerified = "emailVerified",
  /** column name */
  EventsCreated = "events_created",
  /** column name */
  Id = "id",
  /** column name */
  Image = "image",
  /** column name */
  IsVerifiedContributor = "is_verified_contributor",
  /** column name */
  Level = "level",
  /** column name */
  Name = "name",
  /** column name */
  Points = "points",
  /** column name */
  ReviewsCreated = "reviews_created",
  /** column name */
  Role = "role",
  /** column name */
  Status = "status",
  /** column name */
  ThankYouCount = "thank_you_count",
  /** column name */
  VenuesCreated = "venues_created",
}

/** select "users_aggregate_bool_exp_bool_and_arguments_columns" columns of table "users" */
export enum Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsVerifiedContributor = "is_verified_contributor",
}

/** select "users_aggregate_bool_exp_bool_or_arguments_columns" columns of table "users" */
export enum Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsVerifiedContributor = "is_verified_contributor",
}

/** update columns of table "users" */
export enum Users_Update_Column {
  /** column name */
  City = "city",
  /** column name */
  Email = "email",
  /** column name */
  EmailVerified = "emailVerified",
  /** column name */
  EventsCreated = "events_created",
  /** column name */
  Id = "id",
  /** column name */
  Image = "image",
  /** column name */
  IsVerifiedContributor = "is_verified_contributor",
  /** column name */
  Level = "level",
  /** column name */
  Name = "name",
  /** column name */
  Points = "points",
  /** column name */
  ReviewsCreated = "reviews_created",
  /** column name */
  Role = "role",
  /** column name */
  Status = "status",
  /** column name */
  ThankYouCount = "thank_you_count",
  /** column name */
  VenuesCreated = "venues_created",
}

/** unique or primary key constraints on table "venue_category" */
export enum Venue_Category_Constraint {
  /** unique or primary key constraint on columns "value" */
  VenueCategoryPkey = "venue_category_pkey",
}

export enum Venue_Category_Enum {
  BeautySalon = "BEAUTY_SALON",
  Cafe = "CAFE",
  Catering = "CATERING",
  Church = "CHURCH",
  Club = "CLUB",
  CulturalCentre = "CULTURAL_CENTRE",
  DentalClinic = "DENTAL_CLINIC",
  GroceryStore = "GROCERY_STORE",
  Library = "LIBRARY",
  Organization = "ORGANIZATION",
  Restaurant = "RESTAURANT",
  School = "SCHOOL",
}

/** select columns of table "venue_category" */
export enum Venue_Category_Select_Column {
  /** column name */
  Value = "value",
}

/** update columns of table "venue_category" */
export enum Venue_Category_Update_Column {
  /** column name */
  Value = "value",
}

/** unique or primary key constraints on table "venue_status" */
export enum Venue_Status_Constraint {
  /** unique or primary key constraint on columns "value" */
  VenueStatusPkey = "venue_status_pkey",
}

export enum Venue_Status_Enum {
  /** Verified and visible to the public */
  Active = "ACTIVE",
  /** No longer active but kept for reference */
  Archived = "ARCHIVED",
  /** Temporarily hidden from public view */
  Hidden = "HIDDEN",
  /** Submitted but not yet reviewed */
  Pending = "PENDING",
  /** Rejected by moderator/admin */
  Rejected = "REJECTED",
}

/** select columns of table "venue_status" */
export enum Venue_Status_Select_Column {
  /** column name */
  Description = "description",
  /** column name */
  Value = "value",
}

/** update columns of table "venue_status" */
export enum Venue_Status_Update_Column {
  /** column name */
  Description = "description",
  /** column name */
  Value = "value",
}

/** unique or primary key constraints on table "venues" */
export enum Venues_Constraint {
  /** unique or primary key constraint on columns "id" */
  VenuePkey = "venue_pkey",
  /** unique or primary key constraint on columns "slug" */
  VenueSlugKey = "venue_slug_key",
}

/** select columns of table "venues" */
export enum Venues_Select_Column {
  /** column name */
  Address = "address",
  /** column name */
  Area = "area",
  /** column name */
  Category = "category",
  /** column name */
  City = "city",
  /** column name */
  Country = "country",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DescriptionEn = "description_en",
  /** column name */
  DescriptionUk = "description_uk",
  /** column name */
  Emails = "emails",
  /** column name */
  Geo = "geo",
  /** column name */
  Id = "id",
  /** column name */
  Images = "images",
  /** column name */
  Logo = "logo",
  /** column name */
  Name = "name",
  /** column name */
  OwnerId = "owner_id",
  /** column name */
  PhoneNumbers = "phone_numbers",
  /** column name */
  Postcode = "postcode",
  /** column name */
  Slug = "slug",
  /** column name */
  SocialLinks = "social_links",
  /** column name */
  Status = "status",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  UserId = "user_id",
  /** column name */
  Website = "website",
}

/** update columns of table "venues" */
export enum Venues_Update_Column {
  /** column name */
  Address = "address",
  /** column name */
  Area = "area",
  /** column name */
  Category = "category",
  /** column name */
  City = "city",
  /** column name */
  Country = "country",
  /** column name */
  CreatedAt = "created_at",
  /** column name */
  DescriptionEn = "description_en",
  /** column name */
  DescriptionUk = "description_uk",
  /** column name */
  Emails = "emails",
  /** column name */
  Geo = "geo",
  /** column name */
  Id = "id",
  /** column name */
  Images = "images",
  /** column name */
  Logo = "logo",
  /** column name */
  Name = "name",
  /** column name */
  OwnerId = "owner_id",
  /** column name */
  PhoneNumbers = "phone_numbers",
  /** column name */
  Postcode = "postcode",
  /** column name */
  Slug = "slug",
  /** column name */
  SocialLinks = "social_links",
  /** column name */
  Status = "status",
  /** column name */
  UpdatedAt = "updated_at",
  /** column name */
  UserId = "user_id",
  /** column name */
  Website = "website",
}

/** unique or primary key constraints on table "verification_tokens" */
export enum Verification_Tokens_Constraint {
  /** unique or primary key constraint on columns "token" */
  VerificationTokensPkey = "verification_tokens_pkey",
}

/** select columns of table "verification_tokens" */
export enum Verification_Tokens_Select_Column {
  /** column name */
  Expires = "expires",
  /** column name */
  Identifier = "identifier",
  /** column name */
  Token = "token",
}

/** update columns of table "verification_tokens" */
export enum Verification_Tokens_Update_Column {
  /** column name */
  Expires = "expires",
  /** column name */
  Identifier = "identifier",
  /** column name */
  Token = "token",
}

/** columns and relationships of "accounts" */
export type Accounts = {
  __typename?: "accounts";
  access_token?: Maybe<Scalars["String"]["output"]>;
  expires_at?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["uuid"]["output"];
  id_token?: Maybe<Scalars["String"]["output"]>;
  provider: Scalars["String"]["output"];
  /** An object relationship */
  provider_type: Provider_Type;
  providerAccountId: Scalars["String"]["output"];
  refresh_token?: Maybe<Scalars["String"]["output"]>;
  scope?: Maybe<Scalars["String"]["output"]>;
  session_state?: Maybe<Scalars["String"]["output"]>;
  token_type?: Maybe<Scalars["String"]["output"]>;
  type: Scalars["String"]["output"];
  /** An object relationship */
  user: Users;
  userId: Scalars["uuid"]["output"];
};

/** aggregated selection of "accounts" */
export type Accounts_Aggregate = {
  __typename?: "accounts_aggregate";
  aggregate?: Maybe<Accounts_Aggregate_Fields>;
  nodes: Array<Accounts>;
};

export type Accounts_Aggregate_Bool_Exp = {
  count?: InputMaybe<Accounts_Aggregate_Bool_Exp_Count>;
};

export type Accounts_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Accounts_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Accounts_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "accounts" */
export type Accounts_Aggregate_Fields = {
  __typename?: "accounts_aggregate_fields";
  avg?: Maybe<Accounts_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  __typename?: "accounts_avg_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
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
  provider_type?: InputMaybe<Provider_Type_Bool_Exp>;
  providerAccountId?: InputMaybe<String_Comparison_Exp>;
  refresh_token?: InputMaybe<String_Comparison_Exp>;
  scope?: InputMaybe<String_Comparison_Exp>;
  session_state?: InputMaybe<String_Comparison_Exp>;
  token_type?: InputMaybe<String_Comparison_Exp>;
  type?: InputMaybe<String_Comparison_Exp>;
  user?: InputMaybe<Users_Bool_Exp>;
  userId?: InputMaybe<Uuid_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "accounts" */
export type Accounts_Inc_Input = {
  expires_at?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "accounts" */
export type Accounts_Insert_Input = {
  access_token?: InputMaybe<Scalars["String"]["input"]>;
  expires_at?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  id_token?: InputMaybe<Scalars["String"]["input"]>;
  provider?: InputMaybe<Scalars["String"]["input"]>;
  provider_type?: InputMaybe<Provider_Type_Obj_Rel_Insert_Input>;
  providerAccountId?: InputMaybe<Scalars["String"]["input"]>;
  refresh_token?: InputMaybe<Scalars["String"]["input"]>;
  scope?: InputMaybe<Scalars["String"]["input"]>;
  session_state?: InputMaybe<Scalars["String"]["input"]>;
  token_type?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Accounts_Max_Fields = {
  __typename?: "accounts_max_fields";
  access_token?: Maybe<Scalars["String"]["output"]>;
  expires_at?: Maybe<Scalars["Int"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  id_token?: Maybe<Scalars["String"]["output"]>;
  provider?: Maybe<Scalars["String"]["output"]>;
  providerAccountId?: Maybe<Scalars["String"]["output"]>;
  refresh_token?: Maybe<Scalars["String"]["output"]>;
  scope?: Maybe<Scalars["String"]["output"]>;
  session_state?: Maybe<Scalars["String"]["output"]>;
  token_type?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
  userId?: Maybe<Scalars["uuid"]["output"]>;
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
  __typename?: "accounts_min_fields";
  access_token?: Maybe<Scalars["String"]["output"]>;
  expires_at?: Maybe<Scalars["Int"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  id_token?: Maybe<Scalars["String"]["output"]>;
  provider?: Maybe<Scalars["String"]["output"]>;
  providerAccountId?: Maybe<Scalars["String"]["output"]>;
  refresh_token?: Maybe<Scalars["String"]["output"]>;
  scope?: Maybe<Scalars["String"]["output"]>;
  session_state?: Maybe<Scalars["String"]["output"]>;
  token_type?: Maybe<Scalars["String"]["output"]>;
  type?: Maybe<Scalars["String"]["output"]>;
  userId?: Maybe<Scalars["uuid"]["output"]>;
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
  __typename?: "accounts_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  provider_type?: InputMaybe<Provider_Type_Order_By>;
  providerAccountId?: InputMaybe<Order_By>;
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
  id: Scalars["uuid"]["input"];
};

/** input type for updating data in table "accounts" */
export type Accounts_Set_Input = {
  access_token?: InputMaybe<Scalars["String"]["input"]>;
  expires_at?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  id_token?: InputMaybe<Scalars["String"]["input"]>;
  provider?: InputMaybe<Scalars["String"]["input"]>;
  providerAccountId?: InputMaybe<Scalars["String"]["input"]>;
  refresh_token?: InputMaybe<Scalars["String"]["input"]>;
  scope?: InputMaybe<Scalars["String"]["input"]>;
  session_state?: InputMaybe<Scalars["String"]["input"]>;
  token_type?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate stddev on columns */
export type Accounts_Stddev_Fields = {
  __typename?: "accounts_stddev_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev() on columns of table "accounts" */
export type Accounts_Stddev_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Accounts_Stddev_Pop_Fields = {
  __typename?: "accounts_stddev_pop_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
};

/** order by stddev_pop() on columns of table "accounts" */
export type Accounts_Stddev_Pop_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Accounts_Stddev_Samp_Fields = {
  __typename?: "accounts_stddev_samp_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
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
  access_token?: InputMaybe<Scalars["String"]["input"]>;
  expires_at?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  id_token?: InputMaybe<Scalars["String"]["input"]>;
  provider?: InputMaybe<Scalars["String"]["input"]>;
  providerAccountId?: InputMaybe<Scalars["String"]["input"]>;
  refresh_token?: InputMaybe<Scalars["String"]["input"]>;
  scope?: InputMaybe<Scalars["String"]["input"]>;
  session_state?: InputMaybe<Scalars["String"]["input"]>;
  token_type?: InputMaybe<Scalars["String"]["input"]>;
  type?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate sum on columns */
export type Accounts_Sum_Fields = {
  __typename?: "accounts_sum_fields";
  expires_at?: Maybe<Scalars["Int"]["output"]>;
};

/** order by sum() on columns of table "accounts" */
export type Accounts_Sum_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

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
  __typename?: "accounts_var_pop_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_pop() on columns of table "accounts" */
export type Accounts_Var_Pop_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Accounts_Var_Samp_Fields = {
  __typename?: "accounts_var_samp_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
};

/** order by var_samp() on columns of table "accounts" */
export type Accounts_Var_Samp_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Accounts_Variance_Fields = {
  __typename?: "accounts_variance_fields";
  expires_at?: Maybe<Scalars["Float"]["output"]>;
};

/** order by variance() on columns of table "accounts" */
export type Accounts_Variance_Order_By = {
  expires_at?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Boolean"]["input"]>;
  _gt?: InputMaybe<Scalars["Boolean"]["input"]>;
  _gte?: InputMaybe<Scalars["Boolean"]["input"]>;
  _in?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lte?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<Scalars["Boolean"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["Boolean"]["input"]>>;
};

export type Geography_Cast_Exp = {
  geometry?: InputMaybe<Geometry_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "geography". All fields are combined with logical 'AND'. */
export type Geography_Comparison_Exp = {
  _cast?: InputMaybe<Geography_Cast_Exp>;
  _eq?: InputMaybe<Scalars["geography"]["input"]>;
  _gt?: InputMaybe<Scalars["geography"]["input"]>;
  _gte?: InputMaybe<Scalars["geography"]["input"]>;
  _in?: InputMaybe<Array<Scalars["geography"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["geography"]["input"]>;
  _lte?: InputMaybe<Scalars["geography"]["input"]>;
  _neq?: InputMaybe<Scalars["geography"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["geography"]["input"]>>;
  /** is the column within a given distance from the given geography value */
  _st_d_within?: InputMaybe<St_D_Within_Geography_Input>;
  /** does the column spatially intersect the given geography value */
  _st_intersects?: InputMaybe<Scalars["geography"]["input"]>;
};

export type Geometry_Cast_Exp = {
  geography?: InputMaybe<Geography_Comparison_Exp>;
};

/** Boolean expression to compare columns of type "geometry". All fields are combined with logical 'AND'. */
export type Geometry_Comparison_Exp = {
  _cast?: InputMaybe<Geometry_Cast_Exp>;
  _eq?: InputMaybe<Scalars["geometry"]["input"]>;
  _gt?: InputMaybe<Scalars["geometry"]["input"]>;
  _gte?: InputMaybe<Scalars["geometry"]["input"]>;
  _in?: InputMaybe<Array<Scalars["geometry"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["geometry"]["input"]>;
  _lte?: InputMaybe<Scalars["geometry"]["input"]>;
  _neq?: InputMaybe<Scalars["geometry"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["geometry"]["input"]>>;
  /** is the column within a given 3D distance from the given geometry value */
  _st_3d_d_within?: InputMaybe<St_D_Within_Input>;
  /** does the column spatially intersect the given geometry value in 3D */
  _st_3d_intersects?: InputMaybe<Scalars["geometry"]["input"]>;
  /** does the column contain the given geometry value */
  _st_contains?: InputMaybe<Scalars["geometry"]["input"]>;
  /** does the column cross the given geometry value */
  _st_crosses?: InputMaybe<Scalars["geometry"]["input"]>;
  /** is the column within a given distance from the given geometry value */
  _st_d_within?: InputMaybe<St_D_Within_Input>;
  /** is the column equal to given geometry value (directionality is ignored) */
  _st_equals?: InputMaybe<Scalars["geometry"]["input"]>;
  /** does the column spatially intersect the given geometry value */
  _st_intersects?: InputMaybe<Scalars["geometry"]["input"]>;
  /** does the column 'spatially overlap' (intersect but not completely contain) the given geometry value */
  _st_overlaps?: InputMaybe<Scalars["geometry"]["input"]>;
  /** does the column have atleast one point in common with the given geometry value */
  _st_touches?: InputMaybe<Scalars["geometry"]["input"]>;
  /** is the column contained in the given geometry value */
  _st_within?: InputMaybe<Scalars["geometry"]["input"]>;
};

export type GetAdminVenuesQuery = {
  __typename?: "query_root";
  venues: Array<{
    __typename?: "venues";
    address?: null | string;
    category: Venue_Category_Enum;
    created_at: Timestamp;
    description_en?: null | string;
    description_uk?: null | string;
    emails?: Array<string> | null;
    geo?: Geography | null;
    id: UUID;
    images?: Array<string> | null;
    name: string;
    phone_numbers?: Array<string> | null;
    slug: string;
    status: Venue_Status_Enum;
    user_id?: null | UUID;
    website?: null | string;
  }>;
  venues_aggregate: {
    __typename?: "venues_aggregate";
    aggregate?: { __typename?: "venues_aggregate_fields"; count: number } | null;
  };
};

export type GetAdminVenuesQueryVariables = Exact<{
  where: Venues_Bool_Exp;
}>;

export type GetPublicVenuesQuery = {
  __typename?: "query_root";
  total: {
    __typename?: "venues_aggregate";
    aggregate?: { __typename?: "venues_aggregate_fields"; count: number } | null;
  };
  venues: Array<{
    __typename?: "venues";
    address?: null | string;
    category: Venue_Category_Enum;
    city?: null | string;
    country?: null | string;
    description_en?: null | string;
    description_uk?: null | string;
    emails?: Array<string> | null;
    geo?: Geography | null;
    id: UUID;
    images?: Array<string> | null;
    logo?: null | string;
    name: string;
    owner_id?: null | UUID;
    phone_numbers?: Array<string> | null;
    slug: string;
    social_links: Json;
    status: Venue_Status_Enum;
    user_id?: null | UUID;
    website?: null | string;
  }>;
  venues_aggregate: {
    __typename?: "venues_aggregate";
    aggregate?: { __typename?: "venues_aggregate_fields"; count: number } | null;
  };
};

export type GetPublicVenuesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By> | Venues_Order_By>;
  where: Venues_Bool_Exp;
}>;

export type GetUserProfileQuery = {
  __typename?: "query_root";
  users_by_pk?: {
    __typename?: "users";
    email: string;
    events_created: number;
    id: UUID;
    image?: null | string;
    level: number;
    name?: null | string;
    points: number;
    role: User_Role_Enum;
    status: User_Status_Enum;
    venues_created: number;
  } | null;
};

export type GetUserProfileQueryVariables = Exact<{
  id: Scalars["uuid"]["input"];
}>;

export type GetUserVenuesQuery = {
  __typename?: "query_root";
  venues: Array<{
    __typename?: "venues";
    address?: null | string;
    category: Venue_Category_Enum;
    city?: null | string;
    country?: null | string;
    created_at: Timestamp;
    description_en?: null | string;
    description_uk?: null | string;
    emails?: Array<string> | null;
    geo?: Geography | null;
    id: UUID;
    images?: Array<string> | null;
    logo?: null | string;
    name: string;
    owner_id?: null | UUID;
    phone_numbers?: Array<string> | null;
    postcode?: null | string;
    slug: string;
    social_links: Json;
    status: Venue_Status_Enum;
    website?: null | string;
  }>;
  venues_aggregate: {
    __typename?: "venues_aggregate";
    aggregate?: { __typename?: "venues_aggregate_fields"; count: number } | null;
  };
};

export type GetUserVenuesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By> | Venues_Order_By>;
  where: Venues_Bool_Exp;
}>;

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["Int"]["input"]>;
  _gt?: InputMaybe<Scalars["Int"]["input"]>;
  _gte?: InputMaybe<Scalars["Int"]["input"]>;
  _in?: InputMaybe<Array<Scalars["Int"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["Int"]["input"]>;
  _lte?: InputMaybe<Scalars["Int"]["input"]>;
  _neq?: InputMaybe<Scalars["Int"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["Int"]["input"]>>;
};

/** Boolean expression to compare columns of type "json". All fields are combined with logical 'AND'. */
export type Json_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["json"]["input"]>;
  _gt?: InputMaybe<Scalars["json"]["input"]>;
  _gte?: InputMaybe<Scalars["json"]["input"]>;
  _in?: InputMaybe<Array<Scalars["json"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["json"]["input"]>;
  _lte?: InputMaybe<Scalars["json"]["input"]>;
  _neq?: InputMaybe<Scalars["json"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["json"]["input"]>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: "mutation_root";
  /** delete data from the table: "accounts" */
  delete_accounts?: Maybe<Accounts_Mutation_Response>;
  /** delete single row from the table: "accounts" */
  delete_accounts_by_pk?: Maybe<Accounts>;
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
  /** delete data from the table: "venue_category" */
  delete_venue_category?: Maybe<Venue_Category_Mutation_Response>;
  /** delete single row from the table: "venue_category" */
  delete_venue_category_by_pk?: Maybe<Venue_Category>;
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
  /** insert data into the table: "venue_category" */
  insert_venue_category?: Maybe<Venue_Category_Mutation_Response>;
  /** insert a single row into the table: "venue_category" */
  insert_venue_category_one?: Maybe<Venue_Category>;
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
  /** update data of the table: "venue_category" */
  update_venue_category?: Maybe<Venue_Category_Mutation_Response>;
  /** update single row of the table: "venue_category" */
  update_venue_category_by_pk?: Maybe<Venue_Category>;
  /** update multiples rows of table: "venue_category" */
  update_venue_category_many?: Maybe<Array<Maybe<Venue_Category_Mutation_Response>>>;
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
export type Mutation_RootDelete_Accounts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_AccountsArgs = {
  where: Accounts_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Provider_Type_By_PkArgs = {
  value: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Provider_TypeArgs = {
  where: Provider_Type_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Sessions_By_PkArgs = {
  sessionToken: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_SessionsArgs = {
  where: Sessions_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_User_Role_By_PkArgs = {
  value: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_User_RoleArgs = {
  where: User_Role_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_User_Status_By_PkArgs = {
  value: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_User_StatusArgs = {
  where: User_Status_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Users_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_UsersArgs = {
  where: Users_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Venue_Category_By_PkArgs = {
  value: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Venue_CategoryArgs = {
  where: Venue_Category_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Venue_Status_By_PkArgs = {
  value: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Venue_StatusArgs = {
  where: Venue_Status_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Venues_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_VenuesArgs = {
  where: Venues_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Verification_Tokens_By_PkArgs = {
  token: Scalars["String"]["input"];
};

/** mutation root */
export type Mutation_RootDelete_Verification_TokensArgs = {
  where: Verification_Tokens_Bool_Exp;
};

/** mutation root */
export type Mutation_RootInsert_Accounts_OneArgs = {
  object: Accounts_Insert_Input;
  on_conflict?: InputMaybe<Accounts_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_AccountsArgs = {
  objects: Array<Accounts_Insert_Input>;
  on_conflict?: InputMaybe<Accounts_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Provider_Type_OneArgs = {
  object: Provider_Type_Insert_Input;
  on_conflict?: InputMaybe<Provider_Type_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Provider_TypeArgs = {
  objects: Array<Provider_Type_Insert_Input>;
  on_conflict?: InputMaybe<Provider_Type_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Sessions_OneArgs = {
  object: Sessions_Insert_Input;
  on_conflict?: InputMaybe<Sessions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_SessionsArgs = {
  objects: Array<Sessions_Insert_Input>;
  on_conflict?: InputMaybe<Sessions_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Role_OneArgs = {
  object: User_Role_Insert_Input;
  on_conflict?: InputMaybe<User_Role_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_RoleArgs = {
  objects: Array<User_Role_Insert_Input>;
  on_conflict?: InputMaybe<User_Role_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Status_OneArgs = {
  object: User_Status_Insert_Input;
  on_conflict?: InputMaybe<User_Status_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_StatusArgs = {
  objects: Array<User_Status_Insert_Input>;
  on_conflict?: InputMaybe<User_Status_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Users_OneArgs = {
  object: Users_Insert_Input;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_UsersArgs = {
  objects: Array<Users_Insert_Input>;
  on_conflict?: InputMaybe<Users_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Venue_Category_OneArgs = {
  object: Venue_Category_Insert_Input;
  on_conflict?: InputMaybe<Venue_Category_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Venue_CategoryArgs = {
  objects: Array<Venue_Category_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Category_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Venue_Status_OneArgs = {
  object: Venue_Status_Insert_Input;
  on_conflict?: InputMaybe<Venue_Status_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Venue_StatusArgs = {
  objects: Array<Venue_Status_Insert_Input>;
  on_conflict?: InputMaybe<Venue_Status_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Venues_OneArgs = {
  object: Venues_Insert_Input;
  on_conflict?: InputMaybe<Venues_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_VenuesArgs = {
  objects: Array<Venues_Insert_Input>;
  on_conflict?: InputMaybe<Venues_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Verification_Tokens_OneArgs = {
  object: Verification_Tokens_Insert_Input;
  on_conflict?: InputMaybe<Verification_Tokens_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Verification_TokensArgs = {
  objects: Array<Verification_Tokens_Insert_Input>;
  on_conflict?: InputMaybe<Verification_Tokens_On_Conflict>;
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
export type Mutation_RootUpdate_AccountsArgs = {
  _inc?: InputMaybe<Accounts_Inc_Input>;
  _set?: InputMaybe<Accounts_Set_Input>;
  where: Accounts_Bool_Exp;
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
export type Mutation_RootUpdate_Provider_TypeArgs = {
  _set?: InputMaybe<Provider_Type_Set_Input>;
  where: Provider_Type_Bool_Exp;
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
export type Mutation_RootUpdate_SessionsArgs = {
  _set?: InputMaybe<Sessions_Set_Input>;
  where: Sessions_Bool_Exp;
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
export type Mutation_RootUpdate_User_RoleArgs = {
  _set?: InputMaybe<User_Role_Set_Input>;
  where: User_Role_Bool_Exp;
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
export type Mutation_RootUpdate_User_StatusArgs = {
  _set?: InputMaybe<User_Status_Set_Input>;
  where: User_Status_Bool_Exp;
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
export type Mutation_RootUpdate_UsersArgs = {
  _inc?: InputMaybe<Users_Inc_Input>;
  _set?: InputMaybe<Users_Set_Input>;
  where: Users_Bool_Exp;
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
export type Mutation_RootUpdate_Venue_CategoryArgs = {
  _set?: InputMaybe<Venue_Category_Set_Input>;
  where: Venue_Category_Bool_Exp;
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
export type Mutation_RootUpdate_Venue_StatusArgs = {
  _set?: InputMaybe<Venue_Status_Set_Input>;
  where: Venue_Status_Bool_Exp;
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
export type Mutation_RootUpdate_VenuesArgs = {
  _set?: InputMaybe<Venues_Set_Input>;
  where: Venues_Bool_Exp;
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

/** mutation root */
export type Mutation_RootUpdate_Verification_TokensArgs = {
  _set?: InputMaybe<Verification_Tokens_Set_Input>;
  where: Verification_Tokens_Bool_Exp;
};

/** columns and relationships of "provider_type" */
export type Provider_Type = {
  __typename?: "provider_type";
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  value: Scalars["String"]["output"];
};

/** aggregated selection of "provider_type" */
export type Provider_Type_Aggregate = {
  __typename?: "provider_type_aggregate";
  aggregate?: Maybe<Provider_Type_Aggregate_Fields>;
  nodes: Array<Provider_Type>;
};

/** aggregate fields of "provider_type" */
export type Provider_Type_Aggregate_Fields = {
  __typename?: "provider_type_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Provider_Type_Max_Fields>;
  min?: Maybe<Provider_Type_Min_Fields>;
};

/** aggregate fields of "provider_type" */
export type Provider_Type_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Provider_Type_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** input type for inserting data into table "provider_type" */
export type Provider_Type_Insert_Input = {
  accounts?: InputMaybe<Accounts_Arr_Rel_Insert_Input>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Provider_Type_Max_Fields = {
  __typename?: "provider_type_max_fields";
  value?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Provider_Type_Min_Fields = {
  __typename?: "provider_type_min_fields";
  value?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "provider_type" */
export type Provider_Type_Mutation_Response = {
  __typename?: "provider_type_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  value: Scalars["String"]["input"];
};

/** input type for updating data in table "provider_type" */
export type Provider_Type_Set_Input = {
  value?: InputMaybe<Scalars["String"]["input"]>;
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
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type Provider_Type_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Provider_Type_Set_Input>;
  /** filter the rows which have to be updated */
  where: Provider_Type_Bool_Exp;
};

/** columns and relationships of "provider_type" */
export type Provider_TypeAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

/** columns and relationships of "provider_type" */
export type Provider_TypeAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

export type Query_Root = {
  __typename?: "query_root";
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  /** fetch data from the table: "accounts" using primary key columns */
  accounts_by_pk?: Maybe<Accounts>;
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
  /** fetch data from the table: "venue_category" */
  venue_category: Array<Venue_Category>;
  /** fetch aggregated fields from the table: "venue_category" */
  venue_category_aggregate: Venue_Category_Aggregate;
  /** fetch data from the table: "venue_category" using primary key columns */
  venue_category_by_pk?: Maybe<Venue_Category>;
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

export type Query_RootAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

export type Query_RootAccounts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

export type Query_RootProvider_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};

export type Query_RootProvider_Type_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Query_RootProvider_TypeArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};

export type Query_RootSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

export type Query_RootSessions_By_PkArgs = {
  sessionToken: Scalars["String"]["input"];
};

export type Query_RootSessionsArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

export type Query_RootUser_Role_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};

export type Query_RootUser_Role_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Query_RootUser_RoleArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};

export type Query_RootUser_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};

export type Query_RootUser_Status_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Query_RootUser_StatusArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};

export type Query_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Query_RootUsers_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Query_RootVenue_Category_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};

export type Query_RootVenue_Category_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Query_RootVenue_CategoryArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};

export type Query_RootVenue_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};

export type Query_RootVenue_Status_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Query_RootVenue_StatusArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};

export type Query_RootVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

export type Query_RootVenues_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Query_RootVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

export type Query_RootVerification_Tokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

export type Query_RootVerification_Tokens_By_PkArgs = {
  token: Scalars["String"]["input"];
};

export type Query_RootVerification_TokensArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  Boolean: { input: boolean; output: boolean };
  Float: { input: number; output: number };
  geography: { input: Geography; output: Geography };
  geometry: { input: Geometry; output: Geometry };
  ID: { input: string; output: string };
  Int: { input: number; output: number };
  json: { input: Json; output: Json };
  String: { input: string; output: string };
  timestamptz: { input: Timestamp; output: Timestamp };
  uuid: { input: UUID; output: UUID };
};

/** columns and relationships of "sessions" */
export type Sessions = {
  __typename?: "sessions";
  expires: Scalars["timestamptz"]["output"];
  id: Scalars["uuid"]["output"];
  sessionToken: Scalars["String"]["output"];
  /** An object relationship */
  user: Users;
  userId: Scalars["uuid"]["output"];
};

/** aggregated selection of "sessions" */
export type Sessions_Aggregate = {
  __typename?: "sessions_aggregate";
  aggregate?: Maybe<Sessions_Aggregate_Fields>;
  nodes: Array<Sessions>;
};

export type Sessions_Aggregate_Bool_Exp = {
  count?: InputMaybe<Sessions_Aggregate_Bool_Exp_Count>;
};

export type Sessions_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Sessions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Sessions_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "sessions" */
export type Sessions_Aggregate_Fields = {
  __typename?: "sessions_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Sessions_Max_Fields>;
  min?: Maybe<Sessions_Min_Fields>;
};

/** aggregate fields of "sessions" */
export type Sessions_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Sessions_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** input type for inserting data into table "sessions" */
export type Sessions_Insert_Input = {
  expires?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  sessionToken?: InputMaybe<Scalars["String"]["input"]>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  userId?: InputMaybe<Scalars["uuid"]["input"]>;
};

/** aggregate max on columns */
export type Sessions_Max_Fields = {
  __typename?: "sessions_max_fields";
  expires?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  sessionToken?: Maybe<Scalars["String"]["output"]>;
  userId?: Maybe<Scalars["uuid"]["output"]>;
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
  __typename?: "sessions_min_fields";
  expires?: Maybe<Scalars["timestamptz"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  sessionToken?: Maybe<Scalars["String"]["output"]>;
  userId?: Maybe<Scalars["uuid"]["output"]>;
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
  __typename?: "sessions_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  sessionToken: Scalars["String"]["input"];
};

/** input type for updating data in table "sessions" */
export type Sessions_Set_Input = {
  expires?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  sessionToken?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["uuid"]["input"]>;
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
  expires?: InputMaybe<Scalars["timestamptz"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  sessionToken?: InputMaybe<Scalars["String"]["input"]>;
  userId?: InputMaybe<Scalars["uuid"]["input"]>;
};

export type Sessions_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Sessions_Set_Input>;
  /** filter the rows which have to be updated */
  where: Sessions_Bool_Exp;
};

export type St_D_Within_Geography_Input = {
  distance: Scalars["Float"]["input"];
  from: Scalars["geography"]["input"];
  use_spheroid?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type St_D_Within_Input = {
  distance: Scalars["Float"]["input"];
  from: Scalars["geometry"]["input"];
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Array_Comparison_Exp = {
  /** is the array contained in the given array value */
  _contained_in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the array contain the given value */
  _contains?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _eq?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _gt?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _gte?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _in?: InputMaybe<Array<Array<Scalars["String"]["input"]>>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _lte?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _neq?: InputMaybe<Array<Scalars["String"]["input"]>>;
  _nin?: InputMaybe<Array<Array<Scalars["String"]["input"]>>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["String"]["input"]>;
  _gt?: InputMaybe<Scalars["String"]["input"]>;
  _gte?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars["String"]["input"]>;
  _in?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars["String"]["input"]>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars["String"]["input"]>;
  _lt?: InputMaybe<Scalars["String"]["input"]>;
  _lte?: InputMaybe<Scalars["String"]["input"]>;
  _neq?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars["String"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["String"]["input"]>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars["String"]["input"]>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars["String"]["input"]>;
};

export type Subscription_Root = {
  __typename?: "subscription_root";
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  /** fetch data from the table: "accounts" using primary key columns */
  accounts_by_pk?: Maybe<Accounts>;
  /** fetch data from the table in a streaming manner: "accounts" */
  accounts_stream: Array<Accounts>;
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
  /** fetch data from the table: "venue_category" */
  venue_category: Array<Venue_Category>;
  /** fetch aggregated fields from the table: "venue_category" */
  venue_category_aggregate: Venue_Category_Aggregate;
  /** fetch data from the table: "venue_category" using primary key columns */
  venue_category_by_pk?: Maybe<Venue_Category>;
  /** fetch data from the table in a streaming manner: "venue_category" */
  venue_category_stream: Array<Venue_Category>;
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

export type Subscription_RootAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

export type Subscription_RootAccounts_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootAccounts_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Accounts_Stream_Cursor_Input>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

export type Subscription_RootAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

export type Subscription_RootProvider_Type_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};

export type Subscription_RootProvider_Type_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Subscription_RootProvider_Type_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Provider_Type_Stream_Cursor_Input>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};

export type Subscription_RootProvider_TypeArgs = {
  distinct_on?: InputMaybe<Array<Provider_Type_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Provider_Type_Order_By>>;
  where?: InputMaybe<Provider_Type_Bool_Exp>;
};

export type Subscription_RootSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

export type Subscription_RootSessions_By_PkArgs = {
  sessionToken: Scalars["String"]["input"];
};

export type Subscription_RootSessions_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Sessions_Stream_Cursor_Input>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

export type Subscription_RootSessionsArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

export type Subscription_RootUser_Role_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};

export type Subscription_RootUser_Role_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Subscription_RootUser_Role_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<User_Role_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};

export type Subscription_RootUser_RoleArgs = {
  distinct_on?: InputMaybe<Array<User_Role_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Role_Order_By>>;
  where?: InputMaybe<User_Role_Bool_Exp>;
};

export type Subscription_RootUser_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};

export type Subscription_RootUser_Status_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Subscription_RootUser_Status_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<User_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};

export type Subscription_RootUser_StatusArgs = {
  distinct_on?: InputMaybe<Array<User_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<User_Status_Order_By>>;
  where?: InputMaybe<User_Status_Bool_Exp>;
};

export type Subscription_RootUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootUsers_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootUsers_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Users_Stream_Cursor_Input>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

export type Subscription_RootVenue_Category_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};

export type Subscription_RootVenue_Category_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Subscription_RootVenue_Category_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Venue_Category_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};

export type Subscription_RootVenue_CategoryArgs = {
  distinct_on?: InputMaybe<Array<Venue_Category_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Category_Order_By>>;
  where?: InputMaybe<Venue_Category_Bool_Exp>;
};

export type Subscription_RootVenue_Status_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};

export type Subscription_RootVenue_Status_By_PkArgs = {
  value: Scalars["String"]["input"];
};

export type Subscription_RootVenue_Status_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Venue_Status_Stream_Cursor_Input>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};

export type Subscription_RootVenue_StatusArgs = {
  distinct_on?: InputMaybe<Array<Venue_Status_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venue_Status_Order_By>>;
  where?: InputMaybe<Venue_Status_Bool_Exp>;
};

export type Subscription_RootVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

export type Subscription_RootVenues_By_PkArgs = {
  id: Scalars["uuid"]["input"];
};

export type Subscription_RootVenues_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Venues_Stream_Cursor_Input>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

export type Subscription_RootVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

export type Subscription_RootVerification_Tokens_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

export type Subscription_RootVerification_Tokens_By_PkArgs = {
  token: Scalars["String"]["input"];
};

export type Subscription_RootVerification_Tokens_StreamArgs = {
  batch_size: Scalars["Int"]["input"];
  cursor: Array<InputMaybe<Verification_Tokens_Stream_Cursor_Input>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

export type Subscription_RootVerification_TokensArgs = {
  distinct_on?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Verification_Tokens_Order_By>>;
  where?: InputMaybe<Verification_Tokens_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _gt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _gte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _in?: InputMaybe<Array<Scalars["timestamptz"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _lte?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _neq?: InputMaybe<Scalars["timestamptz"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["timestamptz"]["input"]>>;
};

export type UpdateVenueStatusMutation = {
  __typename?: "mutation_root";
  update_venues_by_pk?: { __typename?: "venues"; id: UUID; status: Venue_Status_Enum; updated_at: Timestamp } | null;
};

export type UpdateVenueStatusMutationVariables = Exact<{
  id: Scalars["uuid"]["input"];
  status: Venue_Status_Enum;
}>;

/** columns and relationships of "user_role" */
export type User_Role = {
  __typename?: "user_role";
  description?: Maybe<Scalars["String"]["output"]>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  value: Scalars["String"]["output"];
};

/** aggregated selection of "user_role" */
export type User_Role_Aggregate = {
  __typename?: "user_role_aggregate";
  aggregate?: Maybe<User_Role_Aggregate_Fields>;
  nodes: Array<User_Role>;
};

/** aggregate fields of "user_role" */
export type User_Role_Aggregate_Fields = {
  __typename?: "user_role_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<User_Role_Max_Fields>;
  min?: Maybe<User_Role_Min_Fields>;
};

/** aggregate fields of "user_role" */
export type User_Role_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Role_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** Boolean expression to compare columns of type "user_role_enum". All fields are combined with logical 'AND'. */
export type User_Role_Enum_Comparison_Exp = {
  _eq?: InputMaybe<User_Role_Enum>;
  _in?: InputMaybe<Array<User_Role_Enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<User_Role_Enum>;
  _nin?: InputMaybe<Array<User_Role_Enum>>;
};

/** input type for inserting data into table "user_role" */
export type User_Role_Insert_Input = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  users?: InputMaybe<Users_Arr_Rel_Insert_Input>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type User_Role_Max_Fields = {
  __typename?: "user_role_max_fields";
  description?: Maybe<Scalars["String"]["output"]>;
  value?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type User_Role_Min_Fields = {
  __typename?: "user_role_min_fields";
  description?: Maybe<Scalars["String"]["output"]>;
  value?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "user_role" */
export type User_Role_Mutation_Response = {
  __typename?: "user_role_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  value: Scalars["String"]["input"];
};

/** input type for updating data in table "user_role" */
export type User_Role_Set_Input = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
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
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type User_Role_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Role_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Role_Bool_Exp;
};

/** columns and relationships of "user_role" */
export type User_RoleUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** columns and relationships of "user_role" */
export type User_RoleUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** columns and relationships of "user_status" */
export type User_Status = {
  __typename?: "user_status";
  description?: Maybe<Scalars["String"]["output"]>;
  /** An array relationship */
  users: Array<Users>;
  /** An aggregate relationship */
  users_aggregate: Users_Aggregate;
  value: Scalars["String"]["output"];
};

/** aggregated selection of "user_status" */
export type User_Status_Aggregate = {
  __typename?: "user_status_aggregate";
  aggregate?: Maybe<User_Status_Aggregate_Fields>;
  nodes: Array<User_Status>;
};

/** aggregate fields of "user_status" */
export type User_Status_Aggregate_Fields = {
  __typename?: "user_status_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<User_Status_Max_Fields>;
  min?: Maybe<User_Status_Min_Fields>;
};

/** aggregate fields of "user_status" */
export type User_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** Boolean expression to compare columns of type "user_status_enum". All fields are combined with logical 'AND'. */
export type User_Status_Enum_Comparison_Exp = {
  _eq?: InputMaybe<User_Status_Enum>;
  _in?: InputMaybe<Array<User_Status_Enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<User_Status_Enum>;
  _nin?: InputMaybe<Array<User_Status_Enum>>;
};

/** input type for inserting data into table "user_status" */
export type User_Status_Insert_Input = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  users?: InputMaybe<Users_Arr_Rel_Insert_Input>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type User_Status_Max_Fields = {
  __typename?: "user_status_max_fields";
  description?: Maybe<Scalars["String"]["output"]>;
  value?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type User_Status_Min_Fields = {
  __typename?: "user_status_min_fields";
  description?: Maybe<Scalars["String"]["output"]>;
  value?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "user_status" */
export type User_Status_Mutation_Response = {
  __typename?: "user_status_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  value: Scalars["String"]["input"];
};

/** input type for updating data in table "user_status" */
export type User_Status_Set_Input = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
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
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type User_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Status_Bool_Exp;
};

/** columns and relationships of "user_status" */
export type User_StatusUsers_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** columns and relationships of "user_status" */
export type User_StatusUsersArgs = {
  distinct_on?: InputMaybe<Array<Users_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Users_Order_By>>;
  where?: InputMaybe<Users_Bool_Exp>;
};

/** columns and relationships of "users" */
export type Users = {
  __typename?: "users";
  /** An array relationship */
  accounts: Array<Accounts>;
  /** An aggregate relationship */
  accounts_aggregate: Accounts_Aggregate;
  city?: Maybe<Scalars["String"]["output"]>;
  email: Scalars["String"]["output"];
  emailVerified?: Maybe<Scalars["timestamptz"]["output"]>;
  events_created: Scalars["Int"]["output"];
  id: Scalars["uuid"]["output"];
  image?: Maybe<Scalars["String"]["output"]>;
  is_verified_contributor: Scalars["Boolean"]["output"];
  level: Scalars["Int"]["output"];
  name?: Maybe<Scalars["String"]["output"]>;
  points: Scalars["Int"]["output"];
  reviews_created: Scalars["Int"]["output"];
  role: User_Role_Enum;
  /** An array relationship */
  sessions: Array<Sessions>;
  /** An aggregate relationship */
  sessions_aggregate: Sessions_Aggregate;
  status: User_Status_Enum;
  thank_you_count: Scalars["Int"]["output"];
  /** An object relationship */
  user_role: User_Role;
  /** An object relationship */
  user_status: User_Status;
  venues_created: Scalars["Int"]["output"];
};

/** aggregated selection of "users" */
export type Users_Aggregate = {
  __typename?: "users_aggregate";
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Users_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Users_Select_Column_Users_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Users_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Users_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Users_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "users" */
export type Users_Aggregate_Fields = {
  __typename?: "users_aggregate_fields";
  avg?: Maybe<Users_Avg_Fields>;
  count: Scalars["Int"]["output"];
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
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  __typename?: "users_avg_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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
  events_created?: InputMaybe<Int_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  image?: InputMaybe<String_Comparison_Exp>;
  is_verified_contributor?: InputMaybe<Boolean_Comparison_Exp>;
  level?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
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

/** input type for incrementing numeric columns in table "users" */
export type Users_Inc_Input = {
  events_created?: InputMaybe<Scalars["Int"]["input"]>;
  level?: InputMaybe<Scalars["Int"]["input"]>;
  points?: InputMaybe<Scalars["Int"]["input"]>;
  reviews_created?: InputMaybe<Scalars["Int"]["input"]>;
  thank_you_count?: InputMaybe<Scalars["Int"]["input"]>;
  venues_created?: InputMaybe<Scalars["Int"]["input"]>;
};

/** input type for inserting data into table "users" */
export type Users_Insert_Input = {
  accounts?: InputMaybe<Accounts_Arr_Rel_Insert_Input>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  emailVerified?: InputMaybe<Scalars["timestamptz"]["input"]>;
  events_created?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_verified_contributor?: InputMaybe<Scalars["Boolean"]["input"]>;
  level?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  points?: InputMaybe<Scalars["Int"]["input"]>;
  reviews_created?: InputMaybe<Scalars["Int"]["input"]>;
  role?: InputMaybe<User_Role_Enum>;
  sessions?: InputMaybe<Sessions_Arr_Rel_Insert_Input>;
  status?: InputMaybe<User_Status_Enum>;
  thank_you_count?: InputMaybe<Scalars["Int"]["input"]>;
  user_role?: InputMaybe<User_Role_Obj_Rel_Insert_Input>;
  user_status?: InputMaybe<User_Status_Obj_Rel_Insert_Input>;
  venues_created?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate max on columns */
export type Users_Max_Fields = {
  __typename?: "users_max_fields";
  city?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  emailVerified?: Maybe<Scalars["timestamptz"]["output"]>;
  events_created?: Maybe<Scalars["Int"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  level?: Maybe<Scalars["Int"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  points?: Maybe<Scalars["Int"]["output"]>;
  reviews_created?: Maybe<Scalars["Int"]["output"]>;
  thank_you_count?: Maybe<Scalars["Int"]["output"]>;
  venues_created?: Maybe<Scalars["Int"]["output"]>;
};

/** order by max() on columns of table "users" */
export type Users_Max_Order_By = {
  city?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  emailVerified?: InputMaybe<Order_By>;
  events_created?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Users_Min_Fields = {
  __typename?: "users_min_fields";
  city?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  emailVerified?: Maybe<Scalars["timestamptz"]["output"]>;
  events_created?: Maybe<Scalars["Int"]["output"]>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  image?: Maybe<Scalars["String"]["output"]>;
  level?: Maybe<Scalars["Int"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  points?: Maybe<Scalars["Int"]["output"]>;
  reviews_created?: Maybe<Scalars["Int"]["output"]>;
  thank_you_count?: Maybe<Scalars["Int"]["output"]>;
  venues_created?: Maybe<Scalars["Int"]["output"]>;
};

/** order by min() on columns of table "users" */
export type Users_Min_Order_By = {
  city?: InputMaybe<Order_By>;
  email?: InputMaybe<Order_By>;
  emailVerified?: InputMaybe<Order_By>;
  events_created?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  points?: InputMaybe<Order_By>;
  reviews_created?: InputMaybe<Order_By>;
  thank_you_count?: InputMaybe<Order_By>;
  venues_created?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "users" */
export type Users_Mutation_Response = {
  __typename?: "users_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  events_created?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  image?: InputMaybe<Order_By>;
  is_verified_contributor?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
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
  id: Scalars["uuid"]["input"];
};

/** input type for updating data in table "users" */
export type Users_Set_Input = {
  city?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  emailVerified?: InputMaybe<Scalars["timestamptz"]["input"]>;
  events_created?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_verified_contributor?: InputMaybe<Scalars["Boolean"]["input"]>;
  level?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  points?: InputMaybe<Scalars["Int"]["input"]>;
  reviews_created?: InputMaybe<Scalars["Int"]["input"]>;
  role?: InputMaybe<User_Role_Enum>;
  status?: InputMaybe<User_Status_Enum>;
  thank_you_count?: InputMaybe<Scalars["Int"]["input"]>;
  venues_created?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate stddev on columns */
export type Users_Stddev_Fields = {
  __typename?: "users_stddev_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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
  __typename?: "users_stddev_pop_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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
  __typename?: "users_stddev_samp_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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
  city?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  emailVerified?: InputMaybe<Scalars["timestamptz"]["input"]>;
  events_created?: InputMaybe<Scalars["Int"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  image?: InputMaybe<Scalars["String"]["input"]>;
  is_verified_contributor?: InputMaybe<Scalars["Boolean"]["input"]>;
  level?: InputMaybe<Scalars["Int"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  points?: InputMaybe<Scalars["Int"]["input"]>;
  reviews_created?: InputMaybe<Scalars["Int"]["input"]>;
  role?: InputMaybe<User_Role_Enum>;
  status?: InputMaybe<User_Status_Enum>;
  thank_you_count?: InputMaybe<Scalars["Int"]["input"]>;
  venues_created?: InputMaybe<Scalars["Int"]["input"]>;
};

/** aggregate sum on columns */
export type Users_Sum_Fields = {
  __typename?: "users_sum_fields";
  events_created?: Maybe<Scalars["Int"]["output"]>;
  level?: Maybe<Scalars["Int"]["output"]>;
  points?: Maybe<Scalars["Int"]["output"]>;
  reviews_created?: Maybe<Scalars["Int"]["output"]>;
  thank_you_count?: Maybe<Scalars["Int"]["output"]>;
  venues_created?: Maybe<Scalars["Int"]["output"]>;
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
  __typename?: "users_var_pop_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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
  __typename?: "users_var_samp_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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
  __typename?: "users_variance_fields";
  events_created?: Maybe<Scalars["Float"]["output"]>;
  level?: Maybe<Scalars["Float"]["output"]>;
  points?: Maybe<Scalars["Float"]["output"]>;
  reviews_created?: Maybe<Scalars["Float"]["output"]>;
  thank_you_count?: Maybe<Scalars["Float"]["output"]>;
  venues_created?: Maybe<Scalars["Float"]["output"]>;
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

/** columns and relationships of "users" */
export type UsersAccounts_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersAccountsArgs = {
  distinct_on?: InputMaybe<Array<Accounts_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Accounts_Order_By>>;
  where?: InputMaybe<Accounts_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersSessions_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

/** columns and relationships of "users" */
export type UsersSessionsArgs = {
  distinct_on?: InputMaybe<Array<Sessions_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Sessions_Order_By>>;
  where?: InputMaybe<Sessions_Bool_Exp>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars["uuid"]["input"]>;
  _gt?: InputMaybe<Scalars["uuid"]["input"]>;
  _gte?: InputMaybe<Scalars["uuid"]["input"]>;
  _in?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _lt?: InputMaybe<Scalars["uuid"]["input"]>;
  _lte?: InputMaybe<Scalars["uuid"]["input"]>;
  _neq?: InputMaybe<Scalars["uuid"]["input"]>;
  _nin?: InputMaybe<Array<Scalars["uuid"]["input"]>>;
};

/** columns and relationships of "venue_category" */
export type Venue_Category = {
  __typename?: "venue_category";
  value: Scalars["String"]["output"];
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
};

/** aggregated selection of "venue_category" */
export type Venue_Category_Aggregate = {
  __typename?: "venue_category_aggregate";
  aggregate?: Maybe<Venue_Category_Aggregate_Fields>;
  nodes: Array<Venue_Category>;
};

/** aggregate fields of "venue_category" */
export type Venue_Category_Aggregate_Fields = {
  __typename?: "venue_category_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Venue_Category_Max_Fields>;
  min?: Maybe<Venue_Category_Min_Fields>;
};

/** aggregate fields of "venue_category" */
export type Venue_Category_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Category_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** Boolean expression to compare columns of type "venue_category_enum". All fields are combined with logical 'AND'. */
export type Venue_Category_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Venue_Category_Enum>;
  _in?: InputMaybe<Array<Venue_Category_Enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<Venue_Category_Enum>;
  _nin?: InputMaybe<Array<Venue_Category_Enum>>;
};

/** input type for inserting data into table "venue_category" */
export type Venue_Category_Insert_Input = {
  value?: InputMaybe<Scalars["String"]["input"]>;
  venues?: InputMaybe<Venues_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Venue_Category_Max_Fields = {
  __typename?: "venue_category_max_fields";
  value?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Venue_Category_Min_Fields = {
  __typename?: "venue_category_min_fields";
  value?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "venue_category" */
export type Venue_Category_Mutation_Response = {
  __typename?: "venue_category_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  value: Scalars["String"]["input"];
};

/** input type for updating data in table "venue_category" */
export type Venue_Category_Set_Input = {
  value?: InputMaybe<Scalars["String"]["input"]>;
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
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type Venue_Category_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Category_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Category_Bool_Exp;
};

/** columns and relationships of "venue_category" */
export type Venue_CategoryVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** columns and relationships of "venue_category" */
export type Venue_CategoryVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** columns and relationships of "venue_status" */
export type Venue_Status = {
  __typename?: "venue_status";
  description?: Maybe<Scalars["String"]["output"]>;
  value: Scalars["String"]["output"];
  /** An array relationship */
  venues: Array<Venues>;
  /** An aggregate relationship */
  venues_aggregate: Venues_Aggregate;
};

/** aggregated selection of "venue_status" */
export type Venue_Status_Aggregate = {
  __typename?: "venue_status_aggregate";
  aggregate?: Maybe<Venue_Status_Aggregate_Fields>;
  nodes: Array<Venue_Status>;
};

/** aggregate fields of "venue_status" */
export type Venue_Status_Aggregate_Fields = {
  __typename?: "venue_status_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Venue_Status_Max_Fields>;
  min?: Maybe<Venue_Status_Min_Fields>;
};

/** aggregate fields of "venue_status" */
export type Venue_Status_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venue_Status_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** Boolean expression to compare columns of type "venue_status_enum". All fields are combined with logical 'AND'. */
export type Venue_Status_Enum_Comparison_Exp = {
  _eq?: InputMaybe<Venue_Status_Enum>;
  _in?: InputMaybe<Array<Venue_Status_Enum>>;
  _is_null?: InputMaybe<Scalars["Boolean"]["input"]>;
  _neq?: InputMaybe<Venue_Status_Enum>;
  _nin?: InputMaybe<Array<Venue_Status_Enum>>;
};

/** input type for inserting data into table "venue_status" */
export type Venue_Status_Insert_Input = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
  venues?: InputMaybe<Venues_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Venue_Status_Max_Fields = {
  __typename?: "venue_status_max_fields";
  description?: Maybe<Scalars["String"]["output"]>;
  value?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Venue_Status_Min_Fields = {
  __typename?: "venue_status_min_fields";
  description?: Maybe<Scalars["String"]["output"]>;
  value?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "venue_status" */
export type Venue_Status_Mutation_Response = {
  __typename?: "venue_status_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  value: Scalars["String"]["input"];
};

/** input type for updating data in table "venue_status" */
export type Venue_Status_Set_Input = {
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
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
  description?: InputMaybe<Scalars["String"]["input"]>;
  value?: InputMaybe<Scalars["String"]["input"]>;
};

export type Venue_Status_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venue_Status_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venue_Status_Bool_Exp;
};

/** columns and relationships of "venue_status" */
export type Venue_StatusVenues_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** columns and relationships of "venue_status" */
export type Venue_StatusVenuesArgs = {
  distinct_on?: InputMaybe<Array<Venues_Select_Column>>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
  offset?: InputMaybe<Scalars["Int"]["input"]>;
  order_by?: InputMaybe<Array<Venues_Order_By>>;
  where?: InputMaybe<Venues_Bool_Exp>;
};

/** columns and relationships of "venues" */
export type Venues = {
  __typename?: "venues";
  address?: Maybe<Scalars["String"]["output"]>;
  area?: Maybe<Scalars["String"]["output"]>;
  category: Venue_Category_Enum;
  city?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  created_at: Scalars["timestamptz"]["output"];
  description_en?: Maybe<Scalars["String"]["output"]>;
  description_uk?: Maybe<Scalars["String"]["output"]>;
  emails?: Maybe<Array<Scalars["String"]["output"]>>;
  geo?: Maybe<Scalars["geography"]["output"]>;
  id: Scalars["uuid"]["output"];
  images?: Maybe<Array<Scalars["String"]["output"]>>;
  logo?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  /** An object relationship */
  owner?: Maybe<Users>;
  owner_id?: Maybe<Scalars["uuid"]["output"]>;
  phone_numbers?: Maybe<Array<Scalars["String"]["output"]>>;
  postcode?: Maybe<Scalars["String"]["output"]>;
  slug: Scalars["String"]["output"];
  social_links: Scalars["json"]["output"];
  status: Venue_Status_Enum;
  updated_at: Scalars["timestamptz"]["output"];
  /** An object relationship */
  user?: Maybe<Users>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  /** An object relationship */
  venue_category: Venue_Category;
  /** An object relationship */
  venue_status: Venue_Status;
  website?: Maybe<Scalars["String"]["output"]>;
};

/** aggregated selection of "venues" */
export type Venues_Aggregate = {
  __typename?: "venues_aggregate";
  aggregate?: Maybe<Venues_Aggregate_Fields>;
  nodes: Array<Venues>;
};

export type Venues_Aggregate_Bool_Exp = {
  count?: InputMaybe<Venues_Aggregate_Bool_Exp_Count>;
};

export type Venues_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Venues_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
  filter?: InputMaybe<Venues_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "venues" */
export type Venues_Aggregate_Fields = {
  __typename?: "venues_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Venues_Max_Fields>;
  min?: Maybe<Venues_Min_Fields>;
};

/** aggregate fields of "venues" */
export type Venues_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Venues_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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
  city?: InputMaybe<String_Comparison_Exp>;
  country?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  description_en?: InputMaybe<String_Comparison_Exp>;
  description_uk?: InputMaybe<String_Comparison_Exp>;
  emails?: InputMaybe<String_Array_Comparison_Exp>;
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
  venue_category?: InputMaybe<Venue_Category_Bool_Exp>;
  venue_status?: InputMaybe<Venue_Status_Bool_Exp>;
  website?: InputMaybe<String_Comparison_Exp>;
};

/** input type for inserting data into table "venues" */
export type Venues_Insert_Input = {
  address?: InputMaybe<Scalars["String"]["input"]>;
  area?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Venue_Category_Enum>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description_en?: InputMaybe<Scalars["String"]["input"]>;
  description_uk?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  geo?: InputMaybe<Scalars["geography"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  images?: InputMaybe<Array<Scalars["String"]["input"]>>;
  logo?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  owner?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  owner_id?: InputMaybe<Scalars["uuid"]["input"]>;
  phone_numbers?: InputMaybe<Array<Scalars["String"]["input"]>>;
  postcode?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  social_links?: InputMaybe<Scalars["json"]["input"]>;
  status?: InputMaybe<Venue_Status_Enum>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  user?: InputMaybe<Users_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  venue_category?: InputMaybe<Venue_Category_Obj_Rel_Insert_Input>;
  venue_status?: InputMaybe<Venue_Status_Obj_Rel_Insert_Input>;
  website?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Venues_Max_Fields = {
  __typename?: "venues_max_fields";
  address?: Maybe<Scalars["String"]["output"]>;
  area?: Maybe<Scalars["String"]["output"]>;
  city?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description_en?: Maybe<Scalars["String"]["output"]>;
  description_uk?: Maybe<Scalars["String"]["output"]>;
  emails?: Maybe<Array<Scalars["String"]["output"]>>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  images?: Maybe<Array<Scalars["String"]["output"]>>;
  logo?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  owner_id?: Maybe<Scalars["uuid"]["output"]>;
  phone_numbers?: Maybe<Array<Scalars["String"]["output"]>>;
  postcode?: Maybe<Scalars["String"]["output"]>;
  slug?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  website?: Maybe<Scalars["String"]["output"]>;
};

/** order by max() on columns of table "venues" */
export type Venues_Max_Order_By = {
  address?: InputMaybe<Order_By>;
  area?: InputMaybe<Order_By>;
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
  __typename?: "venues_min_fields";
  address?: Maybe<Scalars["String"]["output"]>;
  area?: Maybe<Scalars["String"]["output"]>;
  city?: Maybe<Scalars["String"]["output"]>;
  country?: Maybe<Scalars["String"]["output"]>;
  created_at?: Maybe<Scalars["timestamptz"]["output"]>;
  description_en?: Maybe<Scalars["String"]["output"]>;
  description_uk?: Maybe<Scalars["String"]["output"]>;
  emails?: Maybe<Array<Scalars["String"]["output"]>>;
  id?: Maybe<Scalars["uuid"]["output"]>;
  images?: Maybe<Array<Scalars["String"]["output"]>>;
  logo?: Maybe<Scalars["String"]["output"]>;
  name?: Maybe<Scalars["String"]["output"]>;
  owner_id?: Maybe<Scalars["uuid"]["output"]>;
  phone_numbers?: Maybe<Array<Scalars["String"]["output"]>>;
  postcode?: Maybe<Scalars["String"]["output"]>;
  slug?: Maybe<Scalars["String"]["output"]>;
  updated_at?: Maybe<Scalars["timestamptz"]["output"]>;
  user_id?: Maybe<Scalars["uuid"]["output"]>;
  website?: Maybe<Scalars["String"]["output"]>;
};

/** order by min() on columns of table "venues" */
export type Venues_Min_Order_By = {
  address?: InputMaybe<Order_By>;
  area?: InputMaybe<Order_By>;
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
  __typename?: "venues_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
  /** data from the rows affected by the mutation */
  returning: Array<Venues>;
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
  city?: InputMaybe<Order_By>;
  country?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  description_en?: InputMaybe<Order_By>;
  description_uk?: InputMaybe<Order_By>;
  emails?: InputMaybe<Order_By>;
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
  venue_category?: InputMaybe<Venue_Category_Order_By>;
  venue_status?: InputMaybe<Venue_Status_Order_By>;
  website?: InputMaybe<Order_By>;
};

/** primary key columns input for table: venues */
export type Venues_Pk_Columns_Input = {
  id: Scalars["uuid"]["input"];
};

/** input type for updating data in table "venues" */
export type Venues_Set_Input = {
  address?: InputMaybe<Scalars["String"]["input"]>;
  area?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Venue_Category_Enum>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description_en?: InputMaybe<Scalars["String"]["input"]>;
  description_uk?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  geo?: InputMaybe<Scalars["geography"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  images?: InputMaybe<Array<Scalars["String"]["input"]>>;
  logo?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  owner_id?: InputMaybe<Scalars["uuid"]["input"]>;
  phone_numbers?: InputMaybe<Array<Scalars["String"]["input"]>>;
  postcode?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  social_links?: InputMaybe<Scalars["json"]["input"]>;
  status?: InputMaybe<Venue_Status_Enum>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  website?: InputMaybe<Scalars["String"]["input"]>;
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
  address?: InputMaybe<Scalars["String"]["input"]>;
  area?: InputMaybe<Scalars["String"]["input"]>;
  category?: InputMaybe<Venue_Category_Enum>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  country?: InputMaybe<Scalars["String"]["input"]>;
  created_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  description_en?: InputMaybe<Scalars["String"]["input"]>;
  description_uk?: InputMaybe<Scalars["String"]["input"]>;
  emails?: InputMaybe<Array<Scalars["String"]["input"]>>;
  geo?: InputMaybe<Scalars["geography"]["input"]>;
  id?: InputMaybe<Scalars["uuid"]["input"]>;
  images?: InputMaybe<Array<Scalars["String"]["input"]>>;
  logo?: InputMaybe<Scalars["String"]["input"]>;
  name?: InputMaybe<Scalars["String"]["input"]>;
  owner_id?: InputMaybe<Scalars["uuid"]["input"]>;
  phone_numbers?: InputMaybe<Array<Scalars["String"]["input"]>>;
  postcode?: InputMaybe<Scalars["String"]["input"]>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  social_links?: InputMaybe<Scalars["json"]["input"]>;
  status?: InputMaybe<Venue_Status_Enum>;
  updated_at?: InputMaybe<Scalars["timestamptz"]["input"]>;
  user_id?: InputMaybe<Scalars["uuid"]["input"]>;
  website?: InputMaybe<Scalars["String"]["input"]>;
};

export type Venues_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Venues_Set_Input>;
  /** filter the rows which have to be updated */
  where: Venues_Bool_Exp;
};

/** columns and relationships of "venues" */
export type VenuesSocial_LinksArgs = {
  path?: InputMaybe<Scalars["String"]["input"]>;
};

/** columns and relationships of "verification_tokens" */
export type Verification_Tokens = {
  __typename?: "verification_tokens";
  expires: Scalars["timestamptz"]["output"];
  identifier: Scalars["String"]["output"];
  token: Scalars["String"]["output"];
};

/** aggregated selection of "verification_tokens" */
export type Verification_Tokens_Aggregate = {
  __typename?: "verification_tokens_aggregate";
  aggregate?: Maybe<Verification_Tokens_Aggregate_Fields>;
  nodes: Array<Verification_Tokens>;
};

/** aggregate fields of "verification_tokens" */
export type Verification_Tokens_Aggregate_Fields = {
  __typename?: "verification_tokens_aggregate_fields";
  count: Scalars["Int"]["output"];
  max?: Maybe<Verification_Tokens_Max_Fields>;
  min?: Maybe<Verification_Tokens_Min_Fields>;
};

/** aggregate fields of "verification_tokens" */
export type Verification_Tokens_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Verification_Tokens_Select_Column>>;
  distinct?: InputMaybe<Scalars["Boolean"]["input"]>;
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

/** input type for inserting data into table "verification_tokens" */
export type Verification_Tokens_Insert_Input = {
  expires?: InputMaybe<Scalars["timestamptz"]["input"]>;
  identifier?: InputMaybe<Scalars["String"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
};

/** aggregate max on columns */
export type Verification_Tokens_Max_Fields = {
  __typename?: "verification_tokens_max_fields";
  expires?: Maybe<Scalars["timestamptz"]["output"]>;
  identifier?: Maybe<Scalars["String"]["output"]>;
  token?: Maybe<Scalars["String"]["output"]>;
};

/** aggregate min on columns */
export type Verification_Tokens_Min_Fields = {
  __typename?: "verification_tokens_min_fields";
  expires?: Maybe<Scalars["timestamptz"]["output"]>;
  identifier?: Maybe<Scalars["String"]["output"]>;
  token?: Maybe<Scalars["String"]["output"]>;
};

/** response of any mutation on the table "verification_tokens" */
export type Verification_Tokens_Mutation_Response = {
  __typename?: "verification_tokens_mutation_response";
  /** number of rows affected by the mutation */
  affected_rows: Scalars["Int"]["output"];
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
  token: Scalars["String"]["input"];
};

/** input type for updating data in table "verification_tokens" */
export type Verification_Tokens_Set_Input = {
  expires?: InputMaybe<Scalars["timestamptz"]["input"]>;
  identifier?: InputMaybe<Scalars["String"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
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
  expires?: InputMaybe<Scalars["timestamptz"]["input"]>;
  identifier?: InputMaybe<Scalars["String"]["input"]>;
  token?: InputMaybe<Scalars["String"]["input"]>;
};

export type Verification_Tokens_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Verification_Tokens_Set_Input>;
  /** filter the rows which have to be updated */
  where: Verification_Tokens_Bool_Exp;
};

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

export type GetUserProfileLazyQueryHookResult = ReturnType<typeof useGetUserProfileLazyQuery>;
export type GetUserProfileQueryHookResult = ReturnType<typeof useGetUserProfileQuery>;
export type GetUserProfileQueryResult = Apollo.QueryResult<GetUserProfileQuery, GetUserProfileQueryVariables>;
export type GetUserProfileSuspenseQueryHookResult = ReturnType<typeof useGetUserProfileSuspenseQuery>;
export function useGetUserProfileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
}
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
export function useGetUserProfileQuery(
  baseOptions: ({ skip: boolean } | { skip?: boolean; variables: GetUserProfileQueryVariables }) &
    Apollo.QueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
}
export function useGetUserProfileSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserProfileQuery, GetUserProfileQueryVariables>,
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserProfileQuery, GetUserProfileQueryVariables>(GetUserProfileDocument, options);
}
export const GetPublicVenuesDocument = gql`
  query GetPublicVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
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
`;

export type GetPublicVenuesLazyQueryHookResult = ReturnType<typeof useGetPublicVenuesLazyQuery>;
export type GetPublicVenuesQueryHookResult = ReturnType<typeof useGetPublicVenuesQuery>;
export type GetPublicVenuesQueryResult = Apollo.QueryResult<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>;
export type GetPublicVenuesSuspenseQueryHookResult = ReturnType<typeof useGetPublicVenuesSuspenseQuery>;
export function useGetPublicVenuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>(GetPublicVenuesDocument, options);
}
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
export function useGetPublicVenuesQuery(
  baseOptions: ({ skip: boolean } | { skip?: boolean; variables: GetPublicVenuesQueryVariables }) &
    Apollo.QueryHookOptions<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>(GetPublicVenuesDocument, options);
}
export function useGetPublicVenuesSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>,
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPublicVenuesQuery, GetPublicVenuesQueryVariables>(GetPublicVenuesDocument, options);
}
export const GetUserVenuesDocument = gql`
  query GetUserVenues($where: venues_bool_exp!, $limit: Int, $offset: Int, $order_by: [venues_order_by!]) {
    venues(where: $where, limit: $limit, offset: $offset, order_by: $order_by) {
      id
      name
      address
      city
      country
      postcode
      logo
      images
      category
      created_at
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      social_links
      status
      owner_id
      slug
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export type GetUserVenuesLazyQueryHookResult = ReturnType<typeof useGetUserVenuesLazyQuery>;
export type GetUserVenuesQueryHookResult = ReturnType<typeof useGetUserVenuesQuery>;
export type GetUserVenuesQueryResult = Apollo.QueryResult<GetUserVenuesQuery, GetUserVenuesQueryVariables>;
export type GetUserVenuesSuspenseQueryHookResult = ReturnType<typeof useGetUserVenuesSuspenseQuery>;
export function useGetUserVenuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetUserVenuesQuery, GetUserVenuesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserVenuesQuery, GetUserVenuesQueryVariables>(GetUserVenuesDocument, options);
}
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
export function useGetUserVenuesQuery(
  baseOptions: ({ skip: boolean } | { skip?: boolean; variables: GetUserVenuesQueryVariables }) &
    Apollo.QueryHookOptions<GetUserVenuesQuery, GetUserVenuesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserVenuesQuery, GetUserVenuesQueryVariables>(GetUserVenuesDocument, options);
}
export function useGetUserVenuesSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUserVenuesQuery, GetUserVenuesQueryVariables>,
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserVenuesQuery, GetUserVenuesQueryVariables>(GetUserVenuesDocument, options);
}
export const GetAdminVenuesDocument = gql`
  query GetAdminVenues($where: venues_bool_exp!) {
    venues(where: $where, order_by: { updated_at: desc }) {
      id
      name
      address
      images
      category
      created_at
      description_uk
      description_en
      geo
      emails
      website
      phone_numbers
      status
      user_id
      slug
    }
    venues_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export type GetAdminVenuesLazyQueryHookResult = ReturnType<typeof useGetAdminVenuesLazyQuery>;
export type GetAdminVenuesQueryHookResult = ReturnType<typeof useGetAdminVenuesQuery>;
export type GetAdminVenuesQueryResult = Apollo.QueryResult<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>;
export type GetAdminVenuesSuspenseQueryHookResult = ReturnType<typeof useGetAdminVenuesSuspenseQuery>;
export function useGetAdminVenuesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>(GetAdminVenuesDocument, options);
}
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
export function useGetAdminVenuesQuery(
  baseOptions: ({ skip: boolean } | { skip?: boolean; variables: GetAdminVenuesQueryVariables }) &
    Apollo.QueryHookOptions<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>(GetAdminVenuesDocument, options);
}
export function useGetAdminVenuesSuspenseQuery(
  baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>,
) {
  const options = baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetAdminVenuesQuery, GetAdminVenuesQueryVariables>(GetAdminVenuesDocument, options);
}
export const UpdateVenueStatusDocument = gql`
  mutation UpdateVenueStatus($id: uuid!, $status: venue_status_enum!) {
    update_venues_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
      updated_at
    }
  }
`;
export type UpdateVenueStatusMutationFn = Apollo.MutationFunction<
  UpdateVenueStatusMutation,
  UpdateVenueStatusMutationVariables
>;

export type UpdateVenueStatusMutationHookResult = ReturnType<typeof useUpdateVenueStatusMutation>;
export type UpdateVenueStatusMutationOptions = Apollo.BaseMutationOptions<
  UpdateVenueStatusMutation,
  UpdateVenueStatusMutationVariables
>;
export type UpdateVenueStatusMutationResult = Apollo.MutationResult<UpdateVenueStatusMutation>;
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
export function useUpdateVenueStatusMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateVenueStatusMutation, UpdateVenueStatusMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateVenueStatusMutation, UpdateVenueStatusMutationVariables>(
    UpdateVenueStatusDocument,
    options,
  );
}
