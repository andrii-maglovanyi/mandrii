import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";
import { isActiveAccount } from "~/lib/auth/account-status";
import type { AuthenticatedSession } from "~/lib/api/context";
import { UserModel } from "~/lib/models/user";

import { UrlHelper } from "../url-helper";

export async function requireAuth(callbackUrl?: string, inactiveRedirectUrl = "/en/account-inactive") {
  const session = await auth();

  if (!session?.user) {
    const callback = callbackUrl ?? "/";
    const signInUrl = `${UrlHelper.getBaseUrl()}/api/auth/signin?callbackUrl=${encodeURIComponent(callback)}`;
    redirect(signInUrl);
  }

  const user = await new UserModel(session as unknown as AuthenticatedSession).findById(session.user.id);

  if (!user || !isActiveAccount(user)) {
    redirect(inactiveRedirectUrl);
  }

  return session;
}
