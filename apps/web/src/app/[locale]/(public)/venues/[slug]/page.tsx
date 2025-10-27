import { VenueView } from "~/features/Venues";

interface VenuePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <VenueView slug={slug} />
    </div>
  );
}
