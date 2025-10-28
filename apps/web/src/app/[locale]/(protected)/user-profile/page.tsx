import { MixpanelTracker } from "~/components/layout";
import { Breadcrumbs } from "~/components/ui";
import { UserProfile } from "~/features";
import { useI18n } from "~/i18n/useI18n";

export default function UserProfilePage() {
  const i18n = useI18n();

  return (
    <>
      <Breadcrumbs items={[{ title: i18n("Home"), url: `/` }]} />
      <h1 className={`mb-12 text-3xl font-extrabold md:text-5xl`}>{i18n("Profile")}</h1>

      <UserProfile />
      <MixpanelTracker event="Viewed Profile Page" />
    </>
  );
}
