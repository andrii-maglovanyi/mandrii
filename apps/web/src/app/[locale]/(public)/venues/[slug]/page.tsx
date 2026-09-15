import type { Metadata } from "next";

import { getVenueViewBySlug, VenueViewServer } from "~/features/Venues/VenueView/VenueViewServer";
import { getI18n } from "~/i18n/getI18n";
import { getPublicMediaUrl } from "~/lib/media";
import { buildPublicPageMetadata, noIndexRobots } from "~/lib/seo";
import { Venue_Status_Enum } from "~/types";

interface VenuePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Readonly<VenuePageProps>): Promise<Metadata> {
  const { locale, slug } = await params;
  const i18n = await getI18n({ locale });

  try {
    const venue = await getVenueViewBySlug(slug);
    const title = venue?.name ?? i18n("Venue");
    const description =
      (locale === "uk" ? venue?.description_uk : venue?.description_en) ||
      i18n("Explore {name} on Mandrii.", { name: title });
    const image = getPublicMediaUrl(venue?.logo ?? venue?.images?.[0]);

    return buildPublicPageMetadata({
      description,
      image,
      locale,
      pathname: `/venues/${slug}`,
      robots: venue?.status === Venue_Status_Enum.Active ? undefined : { follow: false, index: false },
      title,
    });
  } catch (error) {
    console.error("Error loading venue metadata:", error);

    const title = i18n("Venue");
    return buildPublicPageMetadata({
      description: i18n("Explore {name} on Mandrii.", { name: title }),
      locale,
      pathname: `/venues/${slug}`,
      robots: noIndexRobots,
      title,
    });
  }
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { locale, slug } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <VenueViewServer locale={locale} slug={slug} />
    </div>
  );
}
