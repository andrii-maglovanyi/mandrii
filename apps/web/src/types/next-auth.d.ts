export * from "next-auth";

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "inactive";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      email?: null | string;
      id: string;
      image?: null | string;
      name?: null | string;
      role?: UserRole;
      status?: UserStatus;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    status?: UserStatus;
  }
}
