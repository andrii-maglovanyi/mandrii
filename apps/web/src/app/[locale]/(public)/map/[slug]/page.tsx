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
    <div className={`
      flex h-[calc(100vh-64px)] grow flex-col overflow-hidden bg-neutral/10
    `}>
      <VenuesMap slug={slug} />
      <MixpanelTracker event="Viewed Venue" props={{ slug }} />
    </div>
  );
}
