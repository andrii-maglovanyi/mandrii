import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { VenuesList } from "~/features/Venues/VenuesList";
import { useI18n } from "~/i18n/useI18n";

export default function VenuesPage() {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <h1
        className={`
          mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl
          font-extrabold text-transparent
          md:text-5xl
        `}
      >
        {i18n("Discover venues")}
      </h1>

      <div className="container mx-auto">
        <p className="text-neutral">{i18n("Explore Ukrainian venues and community spaces around the world")}</p>

        <VenuesList />
        <MixpanelTracker event="Viewed Venues Page" />
      </div>
    </>
  );
}
