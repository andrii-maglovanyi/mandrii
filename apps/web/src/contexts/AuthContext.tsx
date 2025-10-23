"use client";

import { gql, useQuery } from "@apollo/client";
import { SessionProvider, useSession } from "next-auth/react";
import { createContext, ReactNode, useContext } from "react";

import { Users } from "~/types";

const GET_USER_PROFILE = gql`
  query GetUserProfile($id: uuid!) {
    users_by_pk(id: $id) {
      id
      name
      email
      role
      status
      image
      points
      venues_created
      events_created
      level
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
}>;

export default function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
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

  const { data, loading, refetch } = useQuery(GET_USER_PROFILE, {
    skip: !userId,
    variables: { id: userId! },
  });

  const refetchProfile = async () => {
    await refetch();
  };

  const value: AuthContextType = {
    isLoading: status === "loading" || loading,
    profile: data?.users_by_pk || null,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
