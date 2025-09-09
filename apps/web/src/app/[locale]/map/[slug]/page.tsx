import { Locations, MixpanelTracker } from "~/components/layout";

interface MapLocationPage {
  params: Promise<{
    slug: string;
  }>;
}

export default async function MapLocationPage({ params }: Readonly<MapLocationPage>) {
  const slug = (await params).slug;

  return (
    <>
      <Locations slug={slug} />
      <MixpanelTracker event="Viewed Location" props={{ slug }} />
    </>
  );
}
