import { EventViewServer } from "~/features/Events/EventView/EventViewServer";

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
