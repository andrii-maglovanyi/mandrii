import clsx from "clsx";
import { Briefcase, Coins, FileText, Plane, Users, Wrench } from "lucide-react";
import Link from "next/link";

import { MixpanelTracker } from "~/components/layout/MixpanelTracker/MixpanelTracker";
import { Breadcrumbs } from "~/components/ui";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

interface GuidesPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function GuidesPage({ params }: GuidesPageProps) {
  const { locale } = await params;

  const i18n = await getI18n({ locale });

  const topics = [
    {
      description: i18n("Requirements, routes, timelines and practical steps."),
      disabled: true,
      icon: Plane,
      slug: "visas-and-immigration",
      title: i18n("Visas & immigration"),
    },
    {
      description: i18n("How to find a job, employment rights, CVs and interviews."),
      disabled: true,
      icon: Briefcase,
      slug: "jobs-and-work",
      title: i18n("Jobs & work"),
    },
    {
      description: i18n("Bank accounts, taxes, NI, pensions, benefits rules."),
      disabled: true,
      icon: Coins,
      slug: "money-and-taxes",
      title: i18n("Money & taxes"),
    },
    {
      description: i18n("Birth, schools, family visas and everyday parenting issues."),
      disabled: true,
      icon: Users,
      slug: "family-and-kids",
      title: i18n("Family & kids"),
    },
    {
      description: i18n("Register a car, GP, address, ID and paperwork."),
      disabled: true,
      icon: FileText,
      slug: "registration-and-documents",
      title: i18n("Registration & documents"),
    },
    {
      description: i18n("ILR calculator and more practical helpers."),
      icon: Wrench,
      slug: "tools",
      title: i18n("Tools"),
    },
  ];

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />
        <div className="mt-6 mb-12 space-y-3">
          <h1 className={`text-on-surface text-3xl font-extrabold md:text-5xl`}>{i18n("Guides")}</h1>
          <p className={`text-neutral text-sm md:text-base`}>
            {i18n("Guides, community answers and calculators to help you live abroad with fewer surprises.")}
          </p>
        </div>

        <section className={`grid gap-4 md:grid-cols-2`}>
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                aria-disabled={topic.disabled}
                className={clsx(
                  `border-primary/0 bg-surface-tint/50 hover:border-primary/20 flex gap-4 rounded-xl border p-4 no-underline transition-all duration-300 hover:shadow-lg`,
                  topic.disabled && "pointer-events-none opacity-75",
                )}
                href={`/guides/${topic.slug}`}
                key={topic.slug}
              >
                <div
                  className={clsx(
                    `flex h-10 w-10 shrink-0 items-center justify-center rounded-lg`,
                    topic.disabled ? "bg-neutral/10" : "bg-primary/10",
                  )}
                >
                  <Icon className={clsx("h-5 w-5", topic.disabled ? `text-neutral` : `text-primary`)} />
                </div>
                <div>
                  <strong
                    className={clsx("flex h-10 items-center text-lg", topic.disabled ? `text-neutral` : `text-primary`)}
                  >
                    {topic.title}
                  </strong>
                  <p className="text-neutral text-sm">{topic.description}</p>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
      <MixpanelTracker event="Viewed New Guides Page" />
    </>
  );
}
