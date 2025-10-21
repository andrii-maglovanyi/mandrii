import { Session, User } from "next-auth";
import { useSession } from "next-auth/react";

import { useAuth } from "~/contexts/AuthContext";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { UrlHelper } from "~/lib/url-helper";
import { UserRole } from "~/types/next-auth";
import { UUID } from "~/types/uuid";

export interface UserSession extends Session {
  user: User & {
    id: UUID;
    name: string;
  };
}

export interface UserContext {
  data: null | UserSession;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchProfile: () => Promise<void>;
  status: "loading" | "authenticated" | "unauthenticated";
  update: (data?: Partial<Session> | undefined) => Promise<Session | null>;
}

export function getFullImageUrl(image: string | null | undefined): string | null {
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
        ...session,
        user: {
          ...session.user,
          ...profile,
          id: (profile?.id ?? session.user?.id) as UUID,
          name: profile?.name ?? session.user?.name ?? i18n("Someone"),
          ...(profile && {
            email: profile.email,
            image: getFullImageUrl(profile.image),
            role: profile.role as UserRole,
          }),
        },
      }
    : null;

  return {
    data,
    isAuthenticated,
    isLoading,
    refetchProfile,
    status,
    update,
  };
};
