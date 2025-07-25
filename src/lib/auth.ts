import { HasuraAdapter } from "@auth/hasura-adapter";
import jwt from "jsonwebtoken";
import NextAuth, { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";

import { UserRole } from "~/types/next-auth";

import { sendVerificationRequest } from "./authSendRequest";
import { UrlHelper } from "./url-helper";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET in environment variables.");
}

const getHasuraClaims = ({ id, role }: { id: string; role: UserRole }) => ({
  "x-hasura-allowed-roles": role === "admin" ? ["admin", "user"] : ["user"],
  "x-hasura-default-role": role || "user",
  "x-hasura-user-id": id || "",
});

const getUserById = async (id: string) => {
  const res = await fetch(process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT!, {
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
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET!,
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
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user: User;
    }) {
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
        JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "1h",
          issuer: UrlHelper.getBaseUrl(),
        },
      );

      return session;
    },
  },
  cookies:
    process.env.NODE_ENV === "production"
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
      sendVerificationRequest,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authOptions,
  adapter: HasuraAdapter({
    adminSecret: process.env.HASURA_ADMIN_SECRET!,
    endpoint: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_ENDPOINT!,
  }),
});
