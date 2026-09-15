"use client";

import type { Session } from "next-auth";

import { gql, useQuery } from "@apollo/client";
import { SessionProvider, useSession } from "next-auth/react";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from "react";

import { syncApolloSession } from "~/lib/apollo/client";
import { Users } from "~/types";
import { User_Status_Enum } from "~/types/graphql.generated";

const GET_USER_PROFILE = gql`
  query GetUserProfile($id: uuid!) {
    users_by_pk(id: $id) {
      id
      name
      bio
      city
      email
      role
      status
      image
      points
      is_verified_contributor
      username
    }
  }
`;

type AuthContextType = {
  isLoading: boolean;
  profile: null | Users;
  refetchProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = Readonly<{
  children: React.ReactNode;
  session?: null | Session;
}>;

const LAST_SEEN_UPDATE_INTERVAL_MS = 5 * 60 * 1000;

const LastSeenTracker = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const lastTrackedAt = useRef(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    const trackLastSeen = () => {
      if (document.visibilityState === "hidden" || Date.now() - lastTrackedAt.current < LAST_SEEN_UPDATE_INTERVAL_MS) {
        return;
      }

      lastTrackedAt.current = Date.now();
      void fetch("/api/user/last-seen", { keepalive: true, method: "POST" }).catch(() => {
        // Presence tracking must not interrupt the session on a network failure.
      });
    };

    const trackWhenVisible = () => {
      if (document.visibilityState === "visible") trackLastSeen();
    };

    trackLastSeen();
    document.addEventListener("visibilitychange", trackWhenVisible);
    window.addEventListener("focus", trackLastSeen);
    window.addEventListener("keydown", trackLastSeen);
    window.addEventListener("pointerdown", trackLastSeen);

    return () => {
      document.removeEventListener("visibilitychange", trackWhenVisible);
      window.removeEventListener("focus", trackLastSeen);
      window.removeEventListener("keydown", trackLastSeen);
      window.removeEventListener("pointerdown", trackLastSeen);
    };
  }, [isAuthenticated]);

  return null;
};

export default function AuthProvider({ children, session }: AuthProviderProps) {
  return (
    <SessionProvider session={session}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (status !== "loading") syncApolloSession(session);
  }, [session, status]);

  const { data, loading, refetch } = useQuery(GET_USER_PROFILE, {
    skip: !userId,
    variables: { id: userId! },
  });

  const profile = userId && data?.users_by_pk?.id === userId ? data.users_by_pk : null;
  const refetchProfile = useCallback(async () => {
    if (userId) await refetch();
  }, [refetch, userId]);

  const value: AuthContextType = useMemo(
    () => ({
      isLoading: status === "loading" || Boolean(userId && loading && !profile),
      profile,
      refetchProfile,
    }),
    [status, userId, loading, profile, refetchProfile],
  );

  return (
    <AuthContext.Provider value={value}>
      <LastSeenTracker isAuthenticated={status === "authenticated" && profile?.status === User_Status_Enum.Active} />
      {children}
    </AuthContext.Provider>
  );
}
