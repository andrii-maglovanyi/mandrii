import type { Metadata } from "next";

import type { Locale } from "~/types";

import { MixpanelTracker } from "~/components/layout";
import { MapView } from "~/features/Map/MapView";
import { getI18n } from "~/i18n/getI18n";
import { buildPublicPageMetadata } from "~/lib/seo";

type MapPageProps = Readonly<{ params: Promise<{ locale: Locale }> }>;

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { locale } = await params;
  const i18n = await getI18n({ locale });
  const title = i18n("Explore the Map");
  const description = i18n("Find Ukrainian venues and events near you on the Mandrii map.");
  return buildPublicPageMetadata({ description, locale, pathname: "/map", title });
}

export default function MapPage() {
  return (
    <>
      <MapView />
      <MixpanelTracker event="Viewed Map Page" />
    </>
  );
}
