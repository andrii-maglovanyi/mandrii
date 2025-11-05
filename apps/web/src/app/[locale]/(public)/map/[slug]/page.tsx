import { MixpanelTracker } from "~/components/layout";
import { VenuesMap } from "~/features/Venues/Map/VenuesMap";

interface MapVenuePage {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MapVenuePage({ params }: Readonly<MapVenuePage>) {
  const slug = (await params).slug;

  return (
    <>
      <VenuesMap slug={slug} />
      <MixpanelTracker event="Viewed Venue" props={{ slug }} />
    </>
  );
}
