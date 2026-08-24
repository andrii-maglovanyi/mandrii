import { CircleAlert, Mail } from "lucide-react";

import { InactiveAccountActions } from "~/components/layout/Auth/InactiveAccountActions";
import { Breadcrumbs, SectionCard } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { getI18n } from "~/i18n/getI18n";
import { Locale } from "~/types";

type AccountInactivePageProps = Readonly<{
  params: Promise<{ locale: Locale }>;
}>;

export default async function AccountInactivePage({ params }: AccountInactivePageProps) {
  const { locale } = await params;
  const i18n = await getI18n({ locale });

  return (
    <div className="container mx-auto">
      <Breadcrumbs items={[{ title: i18n("Home"), url: "/" }]} />
      <SectionCard className="mx-auto my-12 max-w-2xl p-6 text-center md:p-10">
        <div className="bg-warning/15 text-warning mx-auto flex h-16 w-16 items-center justify-center rounded-full">
          <CircleAlert aria-hidden="true" size={32} />
        </div>
        <h1 className="text-on-surface mt-6 text-3xl font-bold md:text-4xl">{i18n("Your account is inactive")}</h1>
        <p className="text-neutral mt-4">
          {i18n(
            "You cannot use account features while your account is inactive. Please get in touch if you believe this is a mistake.",
          )}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="bg-primary text-surface hover:bg-primary-hover inline-flex items-center justify-center rounded-md px-4 py-2 no-underline transition-colors"
            href="/contact"
          >
            <Mail aria-hidden="true" className="mr-2" size={18} />
            {i18n("Contact me")}
          </Link>
          <InactiveAccountActions />
        </div>
      </SectionCard>
    </div>
  );
}
