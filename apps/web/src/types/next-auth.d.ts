export * from "next-auth";

export type UserRole = "admin" | "user";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      email?: null | string;
      id: string;
      image?: null | string;
      name?: null | string;
      role?: UserRole;
    };
  }
}
