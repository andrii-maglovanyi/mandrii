"use client";

import { Breadcrumbs } from "~/components/ui";
import { ILRCalculator } from "~/features";
import { useI18n } from "~/i18n/useI18n";

export default function GuidesILRCalculatorPage() {
  const i18n = useI18n();

  return (
    <main className={`
      mx-auto max-w-6xl px-4 py-10
      md:py-12
    `}>
      <Breadcrumbs
        items={[
          { title: i18n("Guides"), url: `/guides` },
          { title: i18n("Tools & calculators"), url: `/guides/tools-and-calculators` },
          { title: i18n("ILR calculator") },
        ]}
      />
      <div className="mt-6 mb-10 space-y-3">
        <h1 className={`
          text-3xl font-extrabold text-on-surface
          md:text-5xl
        `}>{i18n("ILR calculator")}</h1>
        <p className={`
          text-sm text-neutral
          md:text-base
        `}>
          {i18n(
            "Estimate your earliest ILR application date and indicative fees based on the Home Office consultation proposals.",
          )}
        </p>
      </div>

      <ILRCalculator />
    </main>
  );
}
