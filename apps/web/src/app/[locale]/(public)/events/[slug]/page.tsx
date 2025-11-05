import { EventView } from "~/features/Events";

interface EventPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  return (
    <div className="flex h-full grow flex-col">
      <EventView slug={slug} />
    </div>
  );
}
