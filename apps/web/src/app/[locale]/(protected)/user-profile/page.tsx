import { useLocale } from "next-intl";
import { MixpanelTracker, UserProfile } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui/Breadcrumbs/Breadcrumbs";
import { useI18n } from "~/i18n/useI18n";

export default function UserProfilePage() {
  const i18n = useI18n();
  const locale = useLocale();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/${locale}` }]} />
      <h1 className={`mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Profile")}</h1>

      <UserProfile />
      <MixpanelTracker event="Viewed Profile Page" />
    </>
  );
}
