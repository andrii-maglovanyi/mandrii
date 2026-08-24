import { AuthenticatedSession } from "~/lib/api/context";
import { BadRequestError, NotFoundError, UnauthorizedError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Users } from "~/types";

import { privateConfig } from "../config/private";
import { getPublicMediaUrl } from "../media";

const USER_FIELDS = `
  id
  name
  bio
  city
  email
  image
  role
  status
  points
  is_verified_contributor
`;

const GET_USER_BY_ID_QUERY = `
  query GetUserById($id: uuid!) {
    users_by_pk(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

const GET_PUBLIC_USER_BY_ID_QUERY = `
  query GetPublicUserById($id: uuid!) {
    users_by_pk(id: $id) {
      id
      name
      bio
      city
      image
      last_seen_at
      joined_at
      points
      is_verified_contributor
      role
    }
  }
`;

export type PublicUser = {
  bio: null | string;
  city: null | string;
  id: string;
  image: null | string;
  is_verified_contributor: boolean;
  isAdmin: boolean;
  joined_at: null | string;
  last_seen_at: null | string;
  name: null | string;
  points: number;
};

type PublicUserRecord = Omit<PublicUser, "isAdmin"> & {
  role: string;
};

export type UserUpdate = {
  bio?: null | string;
  city?: null | string;
  id: string;
  image?: null | string;
  name?: string;
};

export function getPublicUserImageUrl(image: null | string) {
  return getPublicMediaUrl(image);
}

const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: uuid!, $_set: users_set_input!) {
    update_users_by_pk(pk_columns: { id: $id }, _set: $_set) {
      ${USER_FIELDS}
    }
  }
`;

export class UserModel {
  private session: AuthenticatedSession | null;

  constructor(session: AuthenticatedSession | null = null) {
    this.session = session;
  }

  async findById(id: string): Promise<null | Users> {
    const result = await executeGraphQLQuery<{ users_by_pk: null | Users }>(
      GET_USER_BY_ID_QUERY,
      { id },
      this.getAuthHeaders(),
    );

    return result.users_by_pk;
  }

  async findPublicById(id: string): Promise<null | PublicUser> {
    const result = await executeGraphQLQuery<{ users_by_pk: null | PublicUserRecord }>(
      GET_PUBLIC_USER_BY_ID_QUERY,
      { id },
      this.getAuthHeaders(true),
    );

    if (!result.users_by_pk) return null;

    const { role, ...profile } = result.users_by_pk;
    return { ...profile, isAdmin: role === "admin" };
  }

  async update(variables: UserUpdate): Promise<Users> {
    const { id, ...updateFields } = variables;

    if (!id) {
      throw new BadRequestError("User ID is required for updates");
    }

    const cleanedFields = Object.fromEntries(Object.entries(updateFields).filter(([, v]) => v !== undefined));

    if (Object.keys(cleanedFields).length === 0) {
      throw new BadRequestError("No fields to update");
    }

    const result = await executeGraphQLQuery<{ update_users_by_pk: null | Users }>(
      UPDATE_USER_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      this.getAuthHeaders(),
    );

    if (!result.update_users_by_pk) {
      throw new NotFoundError("User not found");
    }

    return result.update_users_by_pk;
  }

  private getAuthHeaders(useAdmin: boolean = false) {
    if (useAdmin) {
      return { "x-hasura-admin-secret": privateConfig.hasura.adminSecret };
    }

    if (!this.session?.accessToken) {
      throw new UnauthorizedError("Session is required for user operations");
    }

    return { Authorization: `Bearer ${this.session.accessToken}` };
  }
}
