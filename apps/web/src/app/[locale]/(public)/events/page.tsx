import type { Metadata } from "next";

import type { Locale } from "~/types";

import { EventsCatalogPage } from "~/features/Events";
import { getI18n } from "~/i18n/getI18n";
import { buildPublicPageMetadata } from "~/lib/seo";

type EventsPageProps = Readonly<{ params: Promise<{ locale: Locale }> }>;

export default function EventsPage() {
  return <EventsCatalogPage />;
}

export async function generateMetadata({ params }: EventsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n = await getI18n({ locale });
  const title = i18n("Explore events");
  const description = i18n("Explore Ukrainian events and gatherings around the world");
  return buildPublicPageMetadata({ description, locale, pathname: "/events", title });
}
