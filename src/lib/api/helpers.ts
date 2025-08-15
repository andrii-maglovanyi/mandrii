import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

export async function getLocaleContext(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale: Locale = (searchParams.get("locale") as Locale) ?? Locale.EN;

  if (!Object.values(Locale).includes(locale)) {
    return {
      error: Response.json({ error: "Invalid locale" }, { status: 400 }),
    };
  }

  const i18n = await getI18n({ locale });
  return { i18n, locale };
}
