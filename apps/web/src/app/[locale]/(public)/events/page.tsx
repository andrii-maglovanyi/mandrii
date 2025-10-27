import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { ContentData, contentManager } from "~/lib/mdx/reader";
import { Locale } from "~/types";

interface EventPageLayoutProps {
  events: Array<ContentData>;
  locale: Locale;
}

interface EventsPageProps {
  params: Promise<{ locale: Locale }>;
}

const type = "events";

const EventPageLayout = ({ events, locale }: EventPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/${locale}` }]} />
      <h1 className={`
        mb-12 text-3xl font-extrabold
        md:text-5xl
      `}>{i18n("Events")}</h1>

      <div className={`
        mb-32
        lg:mt-2 lg:mb-0 lg:w-full lg:max-w-5xl lg:text-left
      `}>
        {events?.length ? events.map(({ meta }) => meta.title) : "No events found."}
      </div>
    </>
  );
};

export default async function EventsPage({ params }: Readonly<EventsPageProps>) {
  const { locale } = await params;
  const events = await contentManager.getContent(type, locale);

  return (
    <>
      <EventPageLayout events={events} locale={locale} />
      <MixpanelTracker event="Viewed Events Page" />
    </>
  );
}
