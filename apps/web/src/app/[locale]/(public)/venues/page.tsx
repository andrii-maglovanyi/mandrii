import { useLocale } from "next-intl";

import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { VenuesList } from "~/features/Venues/VenuesList";
import { useI18n } from "~/i18n/useI18n";

export default function VenuesPage() {
  const locale = useLocale();
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/${locale}` }]} />
      <h1
        className={`from-primary to-secondary mb-12 bg-gradient-to-r bg-clip-text text-3xl font-extrabold text-transparent md:text-5xl`}
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
