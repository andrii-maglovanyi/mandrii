"use client";

import { gql, useQuery } from "@apollo/client";
import { SessionProvider, useSession } from "next-auth/react";
import { createContext, ReactNode, useContext } from "react";

const GET_USER_PROFILE = gql`
  query GetUserProfile($id: uuid!) {
    users_by_pk(id: $id) {
      id
      name
      email
      role
      status
      image
    }
  }
`;

type AuthContextType = {
  isLoading: boolean;
  profile: UserProfile;
  refetchProfile: () => Promise<void>;
};

type UserProfile = {
  email: null | string;
  id: string;
  image: null | string;
  name: null | string;
  role: string;
  status: string;
} | null;

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
