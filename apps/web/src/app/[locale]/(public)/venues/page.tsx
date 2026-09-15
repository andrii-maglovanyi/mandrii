import type { Metadata } from "next";

import type { Locale } from "~/types";

import { VenuesCatalogPage } from "~/features/Venues";
import { getI18n } from "~/i18n/getI18n";
import { buildPublicPageMetadata } from "~/lib/seo";

type VenuesPageProps = Readonly<{ params: Promise<{ locale: Locale }> }>;

export async function generateMetadata({ params }: VenuesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n = await getI18n({ locale });
  const title = i18n("Discover venues");
  const description = i18n("Explore Ukrainian venues and community spaces around the world");
  return buildPublicPageMetadata({ description, locale, pathname: "/venues", title });
}

export default function VenuesPage() {
  return <VenuesCatalogPage />;
}
