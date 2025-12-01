import { Session } from "next-auth";
import { useSession } from "next-auth/react";

import { useAuth } from "~/contexts/AuthContext";
import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";
import { constants } from "~/lib/constants";
import { UrlHelper } from "~/lib/url-helper";
import { sessionStore } from "~/lib/utils";
import { UserRole } from "~/types/next-auth";
import { UserSession } from "~/types/user";
import { UUID } from "~/types/uuid";

export interface UserContext {
  data: null | UserSession;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchProfile: () => Promise<void>;
  status: "authenticated" | "loading" | "unauthenticated";
  update: (data?: Partial<Session> | undefined) => Promise<null | Session>;
}

export function getFullImageUrl(image: null | string | undefined): null | string {
  if (!image) return null;

  if (UrlHelper.isAbsoluteUrl(image)) {
    return image;
  }

  return `${constants.vercelBlobStorageUrl}/${image}`;
}

export const useUser = (): UserContext => {
  const { data: session, status, update } = useSession();
  const { isLoading: profileLoading, profile, refetchProfile } = useAuth();
  const i18n = useI18n();

  const isLoading = status === "loading" || profileLoading;
  const isAuthenticated = !!session?.user;

  const data: null | UserSession = session
    ? {
        ...profile,
        email: profile?.email ?? session.user?.email ?? "",
        id: (profile?.id ?? session.user?.id) as UUID,
        image: getFullImageUrl(profile?.image ?? session.user?.image),
        name: profile?.name ?? session.user?.name ?? i18n("Someone"),
        role: (profile?.role ?? session.user?.role ?? "user") as UserRole,
      }
    : null;

  // Do not track certain users in Mixpanel
  if (publicConfig.mixpanel.ignoredEmails.includes(data?.email.toLowerCase() ?? "")) {
    sessionStore.set("mixpanelOptOut", "true");
  }

  return {
    data,
    isAuthenticated,
    isLoading,
    refetchProfile,
    status,
    update,
  };
};
