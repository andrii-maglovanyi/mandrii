import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { EditEvent } from "~/features";
import { useI18n } from "~/i18n/useI18n";

interface EditEventPageLayoutProps {
  slug: string;
}

interface EditEventPageProps {
  params: Readonly<Promise<{ slug: string }>>;
}

const EventPageLayout = ({ slug }: EditEventPageLayoutProps) => {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Events"), url: `/user-directory#Events` }]} />
      <h1 className={`
        mb-12 text-3xl font-extrabold text-on-surface
        md:text-5xl
      `}>{i18n("Edit event")}</h1>

      <EditEvent slug={slug} />
    </>
  );
};

export default async function EditEventPage({ params }: Readonly<EditEventPageProps>) {
  const { slug } = await params;

  return (
    <>
      <EventPageLayout slug={slug} />
      <MixpanelTracker event="Viewed Edit Event Page" props={{ slug }} />
    </>
  );
}
