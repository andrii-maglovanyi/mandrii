import { HasuraAdapter } from "@auth/hasura-adapter";
import jwt from "jsonwebtoken";
import NextAuth, { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { UserRole } from "~/types/next-auth";

import { sendVerificationRequest } from "./authSendRequest";
import { isDevelopment, isProduction } from "./config/env";
import { privateConfig } from "./config/private";
import { publicConfig } from "./config/public";
import { UrlHelper } from "./url-helper";

const getHasuraClaims = ({ id, role }: { id: string; role: UserRole }) => ({
  "x-hasura-allowed-roles": role === "admin" ? ["admin", "user"] : ["user"],
  "x-hasura-default-role": role,
  "x-hasura-user-id": id,
});

const getUserById = async (id: string) => {
  const res = await fetch(publicConfig.hasura.endpoint, {
    body: JSON.stringify({
      query: `
        query GetUserById($id: uuid!) {
          users(where: {id: {_eq: $id}}, limit: 1) {
            id
            role
          }
        }
      `,
      variables: { id },
    }),
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": privateConfig.hasura.adminSecret,
    },
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Hasura request failed: ${res.status}`);
  }

  const result = await res.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message ?? "Unknown Hasura error");
  }

  const user = result.data?.users?.[0];

  if (!user) {
    throw new Error(`User with ID ${id} not found`);
  }

  const role: UserRole = user.role === "admin" ? "admin" : "user";

  return {
    hasuraClaims: getHasuraClaims({ id: user.id, role }),
    id: user.id,
    role,
  };
};

const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 60; // 1 hour
const REFRESH_BUFFER_MS = 60 * 1000; // 1 minute buffer

const authOptions: NextAuthConfig = {
  callbacks: {
    async jwt({ token, user, trigger }) {
      const userId = user?.id ?? token.sub;

      if (!userId) {
        throw new Error("Missing user ID in token");
      }

      let dbUser;
      if (user?.id || trigger === "update" || !token.hasuraClaims) {
        dbUser = await getUserById(userId);
      }

      if (dbUser) {
        token.role = dbUser.role;
        token.hasuraClaims = dbUser.hasuraClaims;
      }

      const now = Date.now();
      const expiry = token.accessTokenExpiry as number | undefined;

      const shouldRefresh = !token.accessToken || !expiry || expiry < now + REFRESH_BUFFER_MS;

      if (shouldRefresh) {
        // Reuse dbUser if already fetched this cycle, otherwise fetch fresh
        const freshUser = dbUser ?? (await getUserById(userId));
        token.role = freshUser.role;
        token.hasuraClaims = freshUser.hasuraClaims;

        if (!token.hasuraClaims) {
          throw new Error("Cannot sign token without Hasura claims");
        }

        token.accessToken = jwt.sign(
          {
            sub: userId,
            "https://hasura.io/jwt/claims": token.hasuraClaims,
          },
          privateConfig.auth.nextAuthSecret,
          {
            algorithm: "HS256",
            expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
            issuer: UrlHelper.getBaseUrl(isDevelopment ? "preview" : undefined),
          },
        );

        token.accessTokenExpiry = now + ACCESS_TOKEN_EXPIRY_SECONDS * 1000;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token?.sub) return session;

      session.user.id = token.sub;
      session.user.role = token.role as UserRole;
      session.accessToken = token.accessToken as string;

      return session;
    },
  },
  // Only override options, let NextAuth control the name for cookie chunking
  cookies: isProduction
    ? {
        sessionToken: {
          options: {
            domain: `.${UrlHelper.getHostname()}`,
            httpOnly: true,
            path: "/",
            sameSite: "lax" as const,
            secure: true,
          },
        },
      }
    : undefined,
  pages: {
    verifyRequest: "/auth/verify-request",
  },
  providers: [
    Google,
    Resend({
      apiKey: privateConfig.email.resendApiKey,
      sendVerificationRequest,
    }),
  ],
  secret: privateConfig.auth.nextAuthSecret,
  session: {
    strategy: "jwt" as const,
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authOptions,
  adapter: HasuraAdapter({
    adminSecret: privateConfig.hasura.adminSecret,
    endpoint: publicConfig.hasura.endpoint,
  }),
});
