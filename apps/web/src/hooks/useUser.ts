import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useAuth } from "~/contexts/AuthContext";
import { UserRole } from "~/types/next-auth";

export function useUser() {
  const { data: session, status, update } = useSession();
  const { profile, isLoading: profileLoading, refetchProfile } = useAuth();

  const isLoading = status === "loading" || profileLoading;
  const isAuthenticated = !!session?.user;

  const data: Session | null = session
    ? {
        ...session,
        user: {
          ...session.user,
          ...(profile && {
            name: profile.name,
            email: profile.email,
            role: profile.role as UserRole,
            image: profile.image,
          }),
        },
      }
    : null;

  return {
    data,
    status,
    isLoading,
    isAuthenticated,
    update,
    refetchProfile,
  };
}
