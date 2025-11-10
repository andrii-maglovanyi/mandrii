import { AuthenticatedSession } from "~/lib/api/context";
import { BadRequestError, NotFoundError, UnauthorizedError } from "~/lib/api/errors";
import { executeGraphQLQuery } from "~/lib/graphql/client";
import { Users } from "~/types";

import { privateConfig } from "../config/private";

const USER_FIELDS = `
  id
  name
  email
  image
  role
  status
  points
  events_created
  venues_created
`;

const GET_USER_BY_ID_QUERY = `
  query GetUserById($id: uuid!) {
    users_by_pk(id: $id) {
      ${USER_FIELDS}
    }
  }
`;

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

  async addPoints(pointsToAdd: number): Promise<Users> {
    if (!this.session) {
      throw new UnauthorizedError("Session is required");
    }

    return await this.updateAsAdmin({
      id: this.session.user.id,
      points: (this.session.user.points ?? 0) + pointsToAdd,
    });
  }

  async findById(id: string): Promise<null | Users> {
    const result = await executeGraphQLQuery<{ users_by_pk: null | Users }>(
      GET_USER_BY_ID_QUERY,
      { id },
      this.getAuthHeaders(),
    );

    return result.users_by_pk;
  }

  async incrementEventCreation(): Promise<Users> {
    if (!this.session) {
      throw new UnauthorizedError("Session is required");
    }

    return await this.updateAsAdmin({
      events_created: (this.session.user.events_created ?? 0) + 1,
      id: this.session.user.id,
      points: (this.session.user.points ?? 0) + privateConfig.rewards.pointsPerEventCreation,
    });
  }

  async incrementVenueCreation(): Promise<Users> {
    if (!this.session) {
      throw new UnauthorizedError("Session is required");
    }

    return await this.updateAsAdmin({
      id: this.session.user.id,
      points: (this.session.user.points ?? 0) + privateConfig.rewards.pointsPerVenueCreation,
      venues_created: (this.session.user.venues_created ?? 0) + 1,
    });
  }

  async update(variables: Partial<Users>): Promise<Users> {
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

  private async updateAsAdmin(variables: Partial<Users>): Promise<Users> {
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
      this.getAuthHeaders(true),
    );

    if (!result.update_users_by_pk) {
      throw new NotFoundError("User not found");
    }

    return result.update_users_by_pk;
  }
}
