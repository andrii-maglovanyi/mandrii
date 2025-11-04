import { MixpanelTracker } from "~/components/layout";
import { Events } from "~/features/Events";
import { Locale } from "~/types";

interface EventsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function EventsPage({ params }: Readonly<EventsPageProps>) {
  const { locale } = await params;

  return (
    <>
      <Events />
      <MixpanelTracker event="Viewed Events Page" />
    </>
  );
}
