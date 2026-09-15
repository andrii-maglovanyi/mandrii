"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { useUser } from "~/hooks/useUser";

/** Adds useful, non-PII context to browser errors after authentication changes. */
export function SentryUserContext() {
  const { data: user } = useUser();

  useEffect(() => {
    Sentry.setUser(user ? { id: user.id, role: user.role } : null);
  }, [user?.id, user?.role]);

  return null;
}
