import type { Session } from "next-auth";

import { getSession } from "next-auth/react";

const REFRESH_BUFFER_MS = 60_000;
let cached: { expiresAt: number; token: string | undefined } | null = null;
let pending: null | Promise<string | undefined> = null;
let generation = 0;

export async function getApolloAccessToken(): Promise<string | undefined> {
  // Do not retain request-specific credentials in server module state.
  if (typeof window === "undefined") return (await getSession({ broadcast: false }))?.accessToken;
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  if (pending) return pending;
  const requestGeneration = generation;
  pending = getSession({ broadcast: false })
    .then((session) => {
      if (requestGeneration === generation) {
        setApolloSessionToken(session);
        // NextAuth also returns null on transport errors. Retry instead of
        // treating a failed background refresh as a permanent sign-out.
        if (session === null && cached) cached.expiresAt = Date.now() + 30_000;
      }
      return cached?.token;
    })
    .catch(() => (cached && cached.expiresAt > Date.now() ? cached.token : undefined))
    .finally(() => {
      pending = null;
    });
  return pending;
}

/** SessionProvider is authoritative for sign-in, sign-out, and account changes. */
export function setApolloSessionToken(session: null | Session) {
  generation += 1;
  cached = {
    expiresAt:
      session === null
        ? Infinity
        : session.accessTokenExpiresAt
          ? session.accessTokenExpiresAt - REFRESH_BUFFER_MS
          : Date.now() + 30_000,
    token: session?.accessToken,
  };
}
