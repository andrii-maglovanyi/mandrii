import { Session } from "next-auth";
import { useSession } from "next-auth/react";

import { useAuth } from "~/contexts/AuthContext";
import { constants } from "~/lib/constants";
import { UrlHelper } from "~/lib/url-helper";
import { UserRole } from "~/types/next-auth";

function getFullImageUrl(image: string | null | undefined): string | null {
  if (!image) return null;

  if (UrlHelper.isAbsoluteUrl(image)) {
    return image;
  }

  return `${constants.vercelBlobStorageUrl}/${image}`;
}

export function useUser() {
  const { data: session, status, update } = useSession();
  const { isLoading: profileLoading, profile, refetchProfile } = useAuth();

  const isLoading = status === "loading" || profileLoading;
  const isAuthenticated = !!session?.user;

  const data: null | Session = session
    ? {
        ...session,
        user: {
          ...session.user,
          ...(profile && {
            email: profile.email,
            image: getFullImageUrl(profile.image),
            name: profile.name,
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
}
