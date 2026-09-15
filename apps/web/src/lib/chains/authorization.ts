import { ForbiddenError, getApiContext } from "~/lib/api";

export async function requireChainAdmin(req: Request) {
  const { session } = await getApiContext(req, { withAuth: true });
  if (session.user.role !== "admin") throw new ForbiddenError("Only administrators can manage venue chains");
  return session;
}

