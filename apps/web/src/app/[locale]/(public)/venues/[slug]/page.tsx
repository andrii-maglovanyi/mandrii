import { VenueDetail } from "~/features/Venues/VenueDetail";

interface VenuePageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;

  return (
    <div className="container mx-auto px-4 py-8">
      <VenueDetail slug={slug} />
    </div>
  );
}
