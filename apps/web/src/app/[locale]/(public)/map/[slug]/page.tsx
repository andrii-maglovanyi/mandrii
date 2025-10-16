import { MixpanelTracker, Venues } from "~/components/layout";

interface MapVenuePage {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MapVenuePage({ params }: Readonly<MapVenuePage>) {
  const slug = (await params).slug;

  return (
    <>
      <Venues slug={slug} />
      <MixpanelTracker event="Viewed Venue" props={{ slug }} />
    </>
  );
}
