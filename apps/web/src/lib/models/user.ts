import { AuthenticatedSession } from "~/lib/api/context";
import { BadGateway, BadRequestError, NotFoundError, UnauthorizedError } from "~/lib/api/errors";
import { publicConfig } from "~/lib/config/public";
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

type AuthContext = { accessToken: string; type: "user"; } | { adminSecret: string; type: "admin"; };

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
    const result = await this.executeQuery<{ users_by_pk: null | Users }>(
      GET_USER_BY_ID_QUERY,
      { id },
      this.getAuthContext(),
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

    const result = await this.executeQuery<{ update_users_by_pk: null | Users }>(
      UPDATE_USER_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      this.getAuthContext(),
    );

    if (!result.update_users_by_pk) {
      throw new NotFoundError("User not found");
    }

    return result.update_users_by_pk;
  }

  private async executeQuery<T>(query: string, variables: Record<string, unknown>, auth: AuthContext): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (auth.type === "user") {
      headers["Authorization"] = `Bearer ${auth.accessToken}`;
    } else if (auth.type === "admin") {
      headers["x-hasura-admin-secret"] = auth.adminSecret;
    }

    const response = await fetch(publicConfig.hasura.endpoint, {
      body: JSON.stringify({ query, variables }),
      headers,
      method: "POST",
    });

    if (!response.ok) {
      throw new BadGateway("Failed to execute GraphQL query");
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  private getAuthContext(useAdmin: boolean = false): AuthContext {
    if (useAdmin) {
      return { adminSecret: privateConfig.hasura.adminSecret, type: "admin" };
    }

    if (!this.session?.accessToken) {
      throw new UnauthorizedError("Session is required for user operations");
    }

    return { accessToken: this.session.accessToken, type: "user" };
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

    const result = await this.executeQuery<{ update_users_by_pk: null | Users }>(
      UPDATE_USER_MUTATION,
      {
        _set: cleanedFields,
        id,
      },
      this.getAuthContext(true),
    );

    if (!result.update_users_by_pk) {
      throw new NotFoundError("User not found");
    }

    return result.update_users_by_pk;
  }
}
