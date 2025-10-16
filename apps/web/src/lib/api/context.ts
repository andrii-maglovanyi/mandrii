import { Session } from "next-auth";

import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

import { auth } from "../auth";
import { UnauthorizedError } from "./errors";

export type AuthenticatedSession = {
  accessToken: string;
} & Session;

interface ApiContextBase {
  locale: Locale;
}

interface ApiContextFull extends ApiContextWithI18n, ApiContextWithUser {}

interface ApiContextParams {
  withAuth?: boolean;
  withI18n?: boolean;
}

interface ApiContextWithI18n extends ApiContextBase {
  i18n: Awaited<ReturnType<typeof getI18n>>;
}

interface ApiContextWithUser extends ApiContextBase {
  session: AuthenticatedSession;
}

export async function getApiContext(req: Request, options: { withAuth: true; withI18n: true }): Promise<ApiContextFull>;
export async function getApiContext(
  req: Request,
  options: { withAuth: true; withI18n?: false },
): Promise<ApiContextWithUser>;
export async function getApiContext(
  req: Request,
  options: { withAuth?: false; withI18n: true },
): Promise<ApiContextWithI18n>;
export async function getApiContext(
  req: Request,
  options?: { withAuth?: false; withI18n?: false },
): Promise<ApiContextBase>;

export async function getApiContext(req: Request, { withAuth = false, withI18n = false }: ApiContextParams = {}) {
  const { searchParams } = new URL(req.url);
  const localeParam = searchParams.get("locale") as Locale | null;
  const locale = Object.values(Locale).includes(localeParam ?? Locale.EN) ? (localeParam as Locale) : Locale.EN;

  if (withAuth && withI18n) {
    const session = await auth();
    if (!session?.accessToken) throw new UnauthorizedError();

    const i18n = await getI18n({ locale });
    return { i18n, locale, session: session as AuthenticatedSession } satisfies ApiContextFull;
  }

  if (withAuth) {
    const session = await auth();
    if (!session?.accessToken) throw new UnauthorizedError();
    return { locale, session: session as AuthenticatedSession } satisfies ApiContextWithUser;
  }

  if (withI18n) {
    const i18n = await getI18n({ locale });
    return { i18n, locale } satisfies ApiContextWithI18n;
  }

  return { locale } satisfies ApiContextBase;
}
