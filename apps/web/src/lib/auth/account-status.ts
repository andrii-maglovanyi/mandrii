import { User_Status_Enum } from "~/types/graphql.generated";

type AccountWithStatus = {
  status: User_Status_Enum;
};

export const isActiveAccount = (account: AccountWithStatus) => account.status === User_Status_Enum.Active;

/**
 * Client-facing status checks should only hide account UI for an explicitly
 * inactive account. The server-side guard remains fail-closed for every
 * non-active status.
 */
export const isInactiveAccount = (status: null | string | undefined) =>
  status?.toLowerCase() === User_Status_Enum.Inactive;
