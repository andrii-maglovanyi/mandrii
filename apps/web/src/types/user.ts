import { UserRole } from "~/types/next-auth";
import { UUID } from "~/types/uuid";

import { GetUserProfileQuery } from "./graphql.generated";

/**
 * User session type for authentication and user context.
 * Automatically derived from the GetUserProfile GraphQL query with modifications:
 * - All GraphQL fields are made optional (Partial) since profile may not be loaded
 * - Required fields (id, name, email, image, role) are explicitly defined
 * - 'role' uses NextAuth's UserRole type instead of GraphQL's User_Role_Enum
 */
export type UserSession = {
  email: string;
  id: UUID;
  image: null | string;
  name: string;
  role: UserRole;
} & Partial<Omit<NonNullable<GetUserProfileQuery["users_by_pk"]>, "email" | "id" | "image" | "name" | "role">>;
