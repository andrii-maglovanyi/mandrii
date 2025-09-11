"use client";

import { SessionProvider } from "next-auth/react";

type AuthProviderProps = Readonly<{
  children: React.ReactNode;
}>;

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
