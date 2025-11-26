"use client";

import { Calculator, Clock } from "lucide-react";
import Link from "next/link";

import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs } from "~/components/ui";
import { ILRCalculator } from "~/features";
import { useI18n } from "~/i18n/useI18n";

export default function ToolsAndCalculatorsPage() {
  const i18n = useI18n();

  const tools = [
    {
      descriptionKey: i18n("Check ILR timing and fees under the draft rules."),
      href: "/guides/tools/ilr-calculator",
      slug: "ilr-calculator",
      statusKey: i18n("Live"),
      titleKey: i18n("ILR calculator"),
    },
  ];

  return (
    <>
      <main className={`
        mx-auto max-w-6xl px-4 py-10
        md:py-12
      `}>
        <Breadcrumbs items={[{ title: i18n("Guides"), url: `/guides` }, { title: i18n("Tools") }]} />
        <div className={`
          mt-6 mb-12 flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
        `}>
          <div className="space-y-3">
            <h1 className={`
              text-3xl font-extrabold text-on-surface
              md:text-5xl
            `}>
              {i18n("Helpful tools for living abroad")}
            </h1>
            <p className={`
              text-sm text-neutral
              md:text-base
            `}>
              {i18n("Check timelines, fees and options quickly. Start with the ILR calculator below.")}
            </p>
          </div>
        </div>

        <section className={`
          mb-12 grid gap-4
          lg:grid-cols-3
        `}>
          {tools.map((tool) => (
            <div
              className={`
                group flex flex-col rounded-xl border border-primary/10
                bg-surface/80 p-5 transition
                hover:border-primary/30 hover:shadow-lg
              `}
              key={tool.slug}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-on-surface">{tool.titleKey}</span>
                <span className={`
                  rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold
                  text-green-700
                `}>
                  {tool.statusKey}
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral">{tool.descriptionKey}</p>
              <div className={`
                mt-4 flex items-center gap-2 text-sm font-semibold text-primary
              `}>
                <span className={`
                  flex h-8 w-8 items-center justify-center rounded-full
                  bg-primary/10
                `}>
                  <Calculator className="h-4 w-4" />
                </span>
                <Link className="hover:underline" href={tool.href ?? "#ilr-calculator"}>
                  {i18n("Go to calculator")}
                </Link>
              </div>
            </div>
          ))}

          <div
            className={`
              flex flex-col justify-between rounded-xl border border-dashed
              border-neutral bg-surface/60 p-5
              lg:col-span-2
            `}
          >
            <div className="space-y-2">
              <div
                className={`
                  inline-flex items-center gap-2 rounded-lg bg-neutral/20 px-3
                  py-1.5 text-xs font-semibold text-neutral
                `}
              >
                <Clock className="h-4 w-4" />
                {i18n("Coming soon")}
              </div>
              <p className="text-lg font-semibold text-on-surface">{i18n("More helpers on the way")}</p>
              <p className="text-sm text-neutral">
                {i18n("I'm planning more checklists and calculators. Tell me what you need most!")}
              </p>
            </div>
            <Link className={`
              mt-3 text-sm font-semibold text-primary
              hover:underline
            `} href="/guides">
              {i18n("Back to guides")}
            </Link>
          </div>
        </section>

        <section className="space-y-4" id="ilr-calculator">
          <div>
            <h2 className={`
              text-2xl font-bold text-on-surface
              md:text-3xl
            `}>{i18n("ILR calculator")}</h2>
            <p className={`
              mt-1 text-sm text-neutral
              md:text-base
            `}>
              {i18n(
                "Estimate your earliest ILR application date and indicative fees based on the Home Office consultation proposals.",
              )}
            </p>
          </div>
          <ILRCalculator />
        </section>
      </main>
      <MixpanelTracker event="Viewed Guides-Tools Page" />
    </>
  );
}
