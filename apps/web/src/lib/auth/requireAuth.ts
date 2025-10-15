import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";

import { UrlHelper } from "../url-helper";

export async function requireAuth(callbackUrl?: string) {
  const session = await auth();

  if (!session?.user) {
    const callback = callbackUrl ?? "/";
    const signInUrl = `${UrlHelper.getBaseUrl()}/api/auth/signin?callbackUrl=${encodeURIComponent(callback)}`;
    redirect(signInUrl);
  }

  return session;
}
