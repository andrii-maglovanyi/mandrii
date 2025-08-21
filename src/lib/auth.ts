import { HasuraAdapter } from "@auth/hasura-adapter";
import jwt from "jsonwebtoken";
import NextAuth, { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { UserRole } from "~/types/next-auth";

import { sendVerificationRequest } from "./authSendRequest";
import { isProduction } from "./config/env";
import { privateConfig } from "./config/private";
import { publicConfig } from "./config/public";
import { UrlHelper } from "./url-helper";

const getHasuraClaims = ({ id, role }: { id: string; role: UserRole }) => ({
  "x-hasura-allowed-roles": role === "admin" ? ["admin", "user"] : ["user"],
  "x-hasura-default-role": role || "user",
  "x-hasura-user-id": id || "",
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

  const result = await res.json();
  const user = result.data?.users?.[0];

  if (!user) {
    throw new Error(`User with ID ${id} not found`);
  }

  return {
    hasuraClaims: getHasuraClaims(user),
    id: user.id,
    role: user.role || "user",
  };
};

const authOptions = {
  callbacks: {
    async redirect({ baseUrl, url }: { baseUrl: string; url: string }) {
      return url.startsWith(baseUrl) ? url : "/account";
    },
    async session({ session, token, user }: { session: Session; token: JWT; user: User }) {
      if (!token?.sub) {
        return session;
      }

      const dbUser = await getUserById(token.sub);

      if (!dbUser) {
        throw new Error(`User with ID ${user.id} not found`);
      }

      session.user.id = dbUser.id;
      session.user.role = dbUser.role;
      session.accessToken = jwt.sign(
        {
          email: token.email,
          "https://hasura.io/jwt/claims": dbUser.hasuraClaims,
          sub: user?.id || token.sub,
        },
        privateConfig.auth.nextAuthSecret,
        {
          algorithm: "HS256",
          expiresIn: "1h",
          issuer: UrlHelper.getBaseUrl(),
        },
      );

      return session;
    },
  },
  cookies: isProduction
    ? {
        sessionToken: {
          name: `__Secure-next-auth.session-token`,
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
