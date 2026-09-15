import type { Metadata } from "next";

import { MixpanelTracker } from "~/components/layout";
import { VenuesMap } from "~/features/Venues/Map/VenuesMap";
import { noIndexRobots } from "~/lib/seo";

interface MapVenuePage {
  params: Promise<{
    slug: string;
  }>;
}

// This is an alternate, map-only view of a venue. The venue detail URL is canonical.
export const metadata: Metadata = { robots: noIndexRobots };

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
