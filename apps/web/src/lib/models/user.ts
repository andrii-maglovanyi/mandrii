import { AuthenticatedSession } from "~/lib/api/context";
import { BadGateway, BadRequestError, NotFoundError, UnauthorizedError } from "~/lib/api/errors";
import { publicConfig } from "~/lib/config/public";
import { Users } from "~/types";

const USER_FIELDS = `
  id
  name
  email
  image
  role
  status
  points
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

const executeGraphQLQuery = async <T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken: string,
): Promise<T> => {
  const response = await fetch(publicConfig.hasura.endpoint, {
    body: JSON.stringify({ query, variables }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  console.log("RES", response);

  if (!response.ok) {
    throw new BadGateway("Failed to execute GraphQL query");
  }

  const result = await response.json();

  console.log("RESULT", result);

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

export const getUserById = async (id: string, session: { accessToken: string }) => {
  if (!session.accessToken) {
    throw new UnauthorizedError("Access token is required");
  }

  console.log(">>>>>", GET_USER_BY_ID_QUERY);

  const result = await executeGraphQLQuery<{ users_by_pk: Users | null }>(
    GET_USER_BY_ID_QUERY,
    { id },
    session.accessToken,
  );

  console.log(">>>>>RES", result);

  return result.users_by_pk;
};

export const saveUser = async (variables: Partial<Users>, session: AuthenticatedSession) => {
  const { id, ...updateFields } = variables;

  if (!id) {
    throw new BadRequestError("User ID is required for updates");
  }

  const cleanedFields = Object.fromEntries(Object.entries(updateFields).filter(([, v]) => v !== undefined));

  if (Object.keys(cleanedFields).length === 0) {
    throw new BadRequestError("No fields to update");
  }

  const result = await executeGraphQLQuery<{ update_users_by_pk: { id: string } }>(
    UPDATE_USER_MUTATION,
    {
      _set: cleanedFields,
      id,
    },
    session.accessToken,
  );

  if (!result.update_users_by_pk) {
    throw new NotFoundError("User not found");
  }

  return result.update_users_by_pk.id;
};
