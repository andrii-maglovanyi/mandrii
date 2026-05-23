import { VenueViewServer } from "~/features/Venues/VenueView/VenueViewServer";

interface VenuePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug, locale } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <VenueViewServer locale={locale} slug={slug} />
    </div>
  );
}
