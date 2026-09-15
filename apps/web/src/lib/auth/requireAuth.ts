import { redirect } from "next/navigation";
import { cache } from "react";

import type { AuthenticatedSession } from "~/lib/api/context";
import type { UserRole } from "~/types/next-auth";

import { auth } from "~/lib/auth";
import { isActiveAccount } from "~/lib/auth/account-status";
import { UserModel } from "~/lib/models/user";

import { UrlHelper } from "../url-helper";

const getCurrentAccount = cache(async () => {
  const session = await auth();
  const user = session?.user?.id
    ? await new UserModel(session as unknown as AuthenticatedSession).findById(session.user.id)
    : null;
  return { session, user };
});

export async function requireAuth(callbackUrl?: string, inactiveRedirectUrl = "/en/account-inactive") {
  const { session, user } = await getCurrentAccount();

  if (!session?.user) {
    const callback = callbackUrl ?? "/";
    const signInUrl = `${UrlHelper.getBaseUrl()}/api/auth/signin?callbackUrl=${encodeURIComponent(callback)}`;
    redirect(signInUrl);
  }

  if (!user || !isActiveAccount(user)) {
    redirect(inactiveRedirectUrl);
  }

  return { ...session, user: { ...session.user, role: user.role as UserRole, status: "active" as const } };
}
