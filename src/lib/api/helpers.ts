import { getI18n } from "~/i18n/getI18n";

export async function getLocaleContext(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "en";

  if (!["en", "uk"].includes(locale)) {
    return {
      error: Response.json({ error: "Invalid locale" }, { status: 400 }),
    };
  }

  const i18n = await getI18n({ locale });
  return { i18n, locale };
}
