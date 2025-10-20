import { Session } from "next-auth";
import { useSession } from "next-auth/react";

import { useAuth } from "~/contexts/AuthContext";
import { UserRole } from "~/types/next-auth";

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
            image: profile.image,
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
