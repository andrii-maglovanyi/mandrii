import type { Metadata } from "next";

import { EventViewServer, getEventViewBySlug } from "~/features/Events/EventView/EventViewServer";
import { getI18n } from "~/i18n/getI18n";
import { getEffectiveEventStatus } from "~/lib/events/status";
import { getPublicMediaUrl } from "~/lib/media";
import { buildPublicPageMetadata, noIndexRobots } from "~/lib/seo";
import { Event_Status_Enum } from "~/types";

interface EventPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { locale, slug } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <EventViewServer locale={locale} slug={slug} />
    </div>
  );
}

export async function generateMetadata({ params }: Readonly<EventPageProps>): Promise<Metadata> {
  const { locale, slug } = await params;
  const i18n = await getI18n({ locale });

  try {
    const event = await getEventViewBySlug(slug);
    const title = (locale === "uk" ? event?.title_uk : event?.title_en) ?? i18n("Event");
    const description =
      (locale === "uk" ? event?.description_uk : event?.description_en) ||
      i18n("Explore {name} on Mandrii.", { name: title });
    const image = getPublicMediaUrl(event?.images?.[0]);

    return buildPublicPageMetadata({
      description,
      image,
      locale,
      pathname: `/events/${slug}`,
      robots: getEffectiveEventStatus(event) === Event_Status_Enum.Active ? undefined : { follow: false, index: false },
      title,
    });
  } catch (error) {
    console.error("Error loading event metadata:", error);

    const title = i18n("Event");
    return buildPublicPageMetadata({
      description: i18n("Explore {name} on Mandrii.", { name: title }),
      locale,
      pathname: `/events/${slug}`,
      robots: noIndexRobots,
      title,
    });
  }
}
