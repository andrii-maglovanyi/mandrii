import { BadGateway, BadRequestError, InternalServerError, UnauthorizedError } from "~/lib/api/errors";
import { publicConfig } from "~/lib/config/public";

type AuthHeaders = { "x-hasura-admin-secret": string } | { Authorization: string };

export async function executeGraphQLQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  auth: AuthHeaders,
): Promise<T> {
  let response;

  try {
    response = await fetch(publicConfig.hasura.endpoint, {
      body: JSON.stringify({ query, variables }),
      headers: {
        "Content-Type": "application/json",
        ...auth,
      },
      method: "POST",
    });
  } catch (error) {
    throw new BadGateway(
      `Network error connecting to database: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  if (!response.ok) {
    throw new BadGateway(`Database returned HTTP ${response.status}: ${response.statusText}`);
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new InternalServerError("Failed to parse database response");
  }

  if (result.errors) {
    const errorMessage = result.errors[0].message;
    const errorExtensions = result.errors[0].extensions;

    if (errorExtensions?.code === "constraint-violation") {
      throw new BadRequestError(`Database constraint violation: ${errorMessage}`);
    }

    if (errorExtensions?.code === "permission-denied") {
      throw new UnauthorizedError("Permission denied");
    }

    throw new InternalServerError(`Database error: ${errorMessage}`);
  }

  return result.data;
}
