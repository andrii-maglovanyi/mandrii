import { Calculator } from "lucide-react";

import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs, Card } from "~/components/ui";
import { RentersRightsAct } from "~/features";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface ToolsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale } = await params;

  const i18n = await getI18n({ locale });

  const guides = [
    {
      description: i18n("Check ILR timing and fees under the draft rules."),
      href: "/guides/registration-and-documents/renters-rights-act",
      title: i18n("Renters' Rights Act"),
    },
  ];

  return (
    <>
      <main className={`mx-auto max-w-6xl px-4 py-10 md:py-12`}>
        <Breadcrumbs items={[{ title: i18n("Guides"), url: `/guides` }, { title: i18n("Tools") }]} />
        <div className={`mt-6 mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between`}>
          <div className="space-y-3">
            <h1 className={`text-on-surface text-3xl font-extrabold md:text-5xl`}>
              {i18n("Helpful tools for living abroad")}
            </h1>
            <p className={`text-neutral text-sm md:text-base`}>
              {i18n("Check timelines, fees and options quickly. Start with the ILR calculator below.")}
            </p>
          </div>
        </div>

        <section className={`mb-12 grid gap-4 lg:grid-cols-2`}>
          {guides.map(({ description, href, title }) => (
            <Card
              className={`group/card border-primary/0 bg-surface-tint/50 hover:border-primary/20 rounded-xl border transition-all duration-300 hover:shadow-lg`}
              href={href}
              key={title}
            >
              <article className="flex gap-4 px-6 py-4">
                <div className={`bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg`}>
                  <Calculator className="text-primary h-5 w-5" />
                </div>
                <div className="w-full">
                  <strong className="flex h-10 items-center text-lg">{title}</strong>
                  <p className="text-neutral text-sm">{description}</p>

                  <div
                    className={`text-primary pointer-events-none mt-8 flex items-center justify-end gap-1 text-xs font-medium no-underline`}
                  >
                    {i18n("Discover")}
                    <span className={`transition-transform group-hover/card:translate-x-1`}>→</span>
                  </div>
                </div>
              </article>
            </Card>
          ))}
        </section>

        <section className="space-y-4" id="ilr-calculator">
          <div>
            <h2 className={`text-on-surface text-2xl font-bold md:text-3xl`}>{i18n("ILR calculator")}</h2>
            <p className={`text-neutral mt-1 text-sm md:text-base`}>
              {i18n(
                "Estimate your earliest ILR application date and indicative fees based on the Home Office consultation proposals.",
              )}
            </p>
          </div>
          <RentersRightsAct />
        </section>
      </main>
      <MixpanelTracker event="Viewed Registration and Documents Page" />
    </>
  );
}
